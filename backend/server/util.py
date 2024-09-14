from langchain_google_genai import GoogleGenerativeAI
from langchain_community.utilities.sql_database import SQLDatabase
from langchain.chains import create_sql_query_chain
from langchain_community.tools import QuerySQLDataBaseTool
from operator import itemgetter
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from server.few_shorts import few_shots
from langchain.embeddings import GooglePalmEmbeddings
from langchain.vectorstores import Chroma
from langchain.prompts import SemanticSimilarityExampleSelector
from langchain.prompts import FewShotPromptTemplate
from langchain.chains.sql_database.prompt import PROMPT_SUFFIX
from langchain.prompts.prompt import PromptTemplate
from langchain.prompts import FewShotPromptTemplate
import os



def connect_to_sql(db_stats, url):
    if url == "" and db_stats != "":
        db_user = db_stats['username']
        db_password = db_stats["password"]
        db_host = db_stats['hostname']
        db_name = db_stats['db_name']
        db = SQLDatabase.from_uri(f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}",sample_rows_in_table_info=3)
    else:
        db = SQLDatabase.from_uri(url, sample_rows_in_table_info=3)
    return db


def get_chain(db, question):
    os.environ['LANGCHAIN_TRACING_V2']='true'
    os.environ["LANGCHAIN_PROJECT"] = 'Sample Agent Trace'
    os.environ['LANGCHAIN_API_KEY']='LANGCHAIN-API-KEY'
    os.environ['GOOGLE_API_KEY']='GOOGLE-API-KEY'

    llm = GoogleGenerativeAI(model="gemini-pro")   
    

    generate_query = create_sql_query_chain(llm, db) # converts natural language to sql query
    execute_query=QuerySQLDataBaseTool(db=db)
    answer_prompt = PromptTemplate.from_template(
    """Given the following user question, corresponding SQL query, and SQL result, Generate a full-fleged natural language sentence with as if you are telling someone containing the actual output.
    Question: {question}
    SQL Query: {query}
    SQL Result: {result}
    Answer: """
    )

    rephrase_answer = answer_prompt | llm | StrOutputParser()
    chain = (
        RunnablePassthrough.assign(query=generate_query).assign(
            result=itemgetter("query") | execute_query
        )
        | rephrase_answer)
    
    examples = [" ".join(example.values()) for example in few_shots]
    embeddings=GooglePalmEmbeddings(google_api_key=os.getenv('GOOGLE_API_KEY'))
    vectorstore=Chroma.from_texts(examples,embedding=embeddings,metadatas=few_shots)
    example_selector=SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=1
    )

    mysql_prompt = """You are a MySQL expert. Given an input question, first create a syntactically correct MySQL query to run, then look at the results of the query and return the answer to the input question.
    Unless the user specifies in the question a specific number of examples to obtain, query for at most {top_k} results using the LIMIT clause as per MySQL. You can order the results to return the most informative data in the database.
    Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in backticks (`) to denote them as delimited identifiers.
    Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
    Pay attention to use CURDATE() function to get the current date, if the question involves "today".
    
    Use the following format:
    
    Question: Question here
    SQLQuery: Query to run with no pre-amble
    SQLResult: Result of the SQLQuery
    Answer: Final answer here
    
    No pre-amble.
    """
    example_prompt = PromptTemplate(
    input_variables=["Question", "SQLQuery", "SQLResult","Answer",],
    template="\nQuestion: {Question}\nSQLQuery: {SQLQuery}\nSQLResult: {SQLResult}\nAnswer: {Answer}",
    )
    few_shot_prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix=mysql_prompt,
    suffix=PROMPT_SUFFIX,
    input_variables=["input", "table_info", "top_k"], #These variables are used in the prefix and suffix
    )
    generate_query = create_sql_query_chain(llm, db,few_shot_prompt)
    chain = (
    RunnablePassthrough.assign(query=generate_query).assign(
        result=itemgetter("query") | execute_query
    )
    | rephrase_answer
    )
    
    return chain.invoke({"question": question})
