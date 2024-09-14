few_shots = [
    {'Question' : "List all customers in France with a credit limit over 20,000.",
     'SQLQuery' : "SELECT * FROM customers WHERE country = 'France' AND creditLimit > 20000;",
     'SQLResult': "Result of the SQL query",
     'Answer' : 'List all customers in France with a credit limit over 20,000 is 121'},
    {'Question': "Get the highest payment amount made by any customer",
     'SQLQuery':"SELECT MAX(amount) FROM payments;",
     'SQLResult': "Result of the SQL query",
     'Answer': '25000 is the highest payment amount made by any customer'},
]