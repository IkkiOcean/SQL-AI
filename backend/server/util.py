import os
import re
import time
import ast
from dotenv import load_dotenv

# Load .env file
load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities.sql_database import SQLDatabase
try:
    from langchain.chains import create_sql_query_chain
except (ImportError, ModuleNotFoundError):
    from langchain_classic.chains import create_sql_query_chain
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from server.few_shorts import few_shots

# Active supported Gemini model
DEFAULT_MODEL = "gemini-2.5-flash-lite"

def get_llm():
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key in ("GOOGLE-API-KEY", "your_gemini_api_key_here"):
        raise ValueError("Google Gemini API Key is missing or invalid. Please configure GOOGLE_API_KEY in backend/.env")
    
    return ChatGoogleGenerativeAI(model=DEFAULT_MODEL, google_api_key=api_key, temperature=0.0)

def connect_to_sql(db_stats=None, url=None):
    """
    Connects to SQLite, MySQL, or other SQL databases via SQLAlchemy URI.
    """
    if url and url.strip():
        db_uri = url.strip()
    elif db_stats and isinstance(db_stats, dict) and db_stats.get("username"):
        db_user = db_stats.get('username', '')
        db_password = db_stats.get("password", '')
        db_host = db_stats.get('hostname', 'localhost')
        db_name = db_stats.get('db_name', '')
        db_uri = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
    else:
        raise ValueError("No valid database credentials or connection link provided.")

    db = SQLDatabase.from_uri(db_uri, sample_rows_in_table_info=3)
    return db

def is_safe_read_only_query(sql_query: str) -> bool:
    """
    Safety Guardrail: Validates that the query only performs read operations (SELECT).
    Blocks dangerous mutations like DROP, DELETE, INSERT, UPDATE, ALTER, TRUNCATE, EXEC.
    """
    cleaned = re.sub(r'--.*?\n', '', sql_query)
    cleaned = re.sub(r'/\*.*?\*/', '', cleaned, flags=re.DOTALL).strip()
    
    # Check if first word is SELECT or WITH
    first_token_match = re.match(r'^\s*([A-Za-z]+)', cleaned)
    if not first_token_match:
        return False
    
    first_token = first_token_match.group(1).upper()
    if first_token not in ("SELECT", "WITH"):
        return False

    # Check for prohibited SQL commands
    prohibited = [r'\bDROP\b', r'\bDELETE\b', r'\bINSERT\b', r'\bUPDATE\b', r'\bALTER\b', 
                  r'\bTRUNCATE\b', r'\bEXEC\b', r'\bGRANT\b', r'\bREVOKE\b', r'\bREPLACE\b']
    for pattern in prohibited:
        if re.search(pattern, cleaned, re.IGNORECASE):
            return False

    return True

def clean_sql_output(raw_sql: str) -> str:
    """Cleans up markdown formatting or prefixes like 'SQLQuery:' from the LLM response."""
    sql = raw_sql.strip()
    # Remove markdown code fences
    sql = re.sub(r'^```(?:sql)?\s*', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\s*```$', '', sql)
    # Remove 'SQLQuery:' or similar labels
    sql = re.sub(r'^(?:SQLQuery|SQL Query|Query):\s*', '', sql, flags=re.IGNORECASE)
    return sql.strip()

def build_few_shot_context() -> str:
    """Formats the few-shot examples into an instructional context string."""
    parts = ["Here are reference examples of Natural Language questions and corresponding SQL queries:"]
    for ex in few_shots:
        parts.append(f"Question: {ex['Question']}\nSQLQuery: {ex['SQLQuery']}\nSQLResult: {ex['SQLResult']}\nAnswer: {ex['Answer']}\n")
    return "\n".join(parts)

def execute_and_explain(db: SQLDatabase, question: str):
    """
    Executes natural language query to SQL conversion, runs the query safely,
    and returns a structured payload with generated SQL, table results, execution time, and AI summary.
    """
    start_time = time.time()
    llm = get_llm()

    # Step 1: Create SQL query chain
    few_shot_text = build_few_shot_context()
    custom_prompt = PromptTemplate(
        input_variables=["input", "table_info", "top_k"],
        template=f"""You are a SQL expert with deep knowledge of database design.
Given the user question and the database schema below, generate a syntactically correct SQL query.

{few_shot_text}

Database Dialect: {{top_k}}
Available Schema and Tables:
{{table_info}}

Rules:
1. Always generate valid SQL queries compatible with the current database dialect.
2. Query ONLY the necessary columns needed to answer the question.
3. Unless the user specifies a specific number of records, query at most 10 results using LIMIT.
4. Output ONLY the raw SQL query with no explanation, markdown formatting, or preamble.

Question: {{input}}
SQLQuery:"""
    )

    query_chain = create_sql_query_chain(llm, db, prompt=custom_prompt)
    raw_query = query_chain.invoke({"question": question})
    clean_sql = clean_sql_output(raw_query)

    # Step 2: Safety Check
    if not is_safe_read_only_query(clean_sql):
        raise PermissionError(f"Security Alert: Generated query was blocked because it is not a safe read-only SELECT query.\nQuery: {clean_sql}")

    # Step 3: Direct execution via SQLAlchemy engine to get column headers & rows
    columns = []
    rows = []
    try:
        # Use underlying SQLAlchemy engine
        with db._engine.connect() as conn:
            from sqlalchemy import text
            result_proxy = conn.execute(text(clean_sql))
            columns = list(result_proxy.keys()) if result_proxy.returns_rows else []
            if result_proxy.returns_rows:
                # Convert rows to serializable lists (handling dates, floats, decimals)
                raw_rows = result_proxy.fetchmany(100)
                for r in raw_rows:
                    rows.append([str(val) if val is not None else "NULL" for val in r])
    except Exception as exec_err:
        # Self-correction attempt: prompt LLM to fix syntax error
        fix_prompt = PromptTemplate.from_template(
            """The following SQL query failed with an error. Fix the query so it runs without error.
Original Question: {question}
Failing SQL: {failing_sql}
Error: {error}
Database Dialect Schema: {table_info}

Return ONLY the corrected SQL query with no other text:"""
        )
        fix_chain = fix_prompt | llm | StrOutputParser()
        corrected_raw = fix_chain.invoke({
            "question": question,
            "failing_sql": clean_sql,
            "error": str(exec_err),
            "table_info": db.get_table_info()
        })
        clean_sql = clean_sql_output(corrected_raw)
        
        if not is_safe_read_only_query(clean_sql):
            raise PermissionError("Corrected query failed security read-only check.")

        with db._engine.connect() as conn:
            from sqlalchemy import text
            result_proxy = conn.execute(text(clean_sql))
            columns = list(result_proxy.keys()) if result_proxy.returns_rows else []
            if result_proxy.returns_rows:
                raw_rows = result_proxy.fetchmany(100)
                for r in raw_rows:
                    rows.append([str(val) if val is not None else "NULL" for val in r])

    # Step 4: Generate conversational natural language summary
    answer_prompt = PromptTemplate.from_template(
        """You are an insightful data analyst. Given the user's question, the SQL query executed, and the resulting data, provide a clear, professional, and natural language summary of the findings.
Question: {question}
SQL Query: {query}
Result Columns: {columns}
Result Sample: {results}

Provide a concise, polished response highlighting key figures or answers directly:"""
    )
    answer_chain = answer_prompt | llm | StrOutputParser()
    summary = answer_chain.invoke({
        "question": question,
        "query": clean_sql,
        "columns": columns,
        "results": rows[:10]
    })

    execution_time = round((time.time() - start_time), 2)

    return {
        "sql": clean_sql,
        "columns": columns,
        "rows": rows,
        "summary": summary.strip(),
        "total_rows": len(rows),
        "execution_time_sec": execution_time
    }
