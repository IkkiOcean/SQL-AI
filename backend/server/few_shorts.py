few_shots = [
    {
        'Question': "List all customers in California with their email addresses",
        'SQLQuery': "SELECT first_name, last_name, email FROM customers WHERE state = 'CA';",
        'SQLResult': "[('Alice', 'Johnson', 'alice.j@example.com'), ('Sophia', 'Martinez', 'sophia.m@example.com'), ('Priya', 'Patel', 'priya.p@example.com')]",
        'Answer': 'There are 3 customers in California: Alice Johnson (alice.j@example.com), Sophia Martinez (sophia.m@example.com), and Priya Patel (priya.p@example.com).'
    },
    {
        'Question': "Get the highest payment or order amount",
        'SQLQuery': "SELECT MAX(total_amount) FROM orders;",
        'SQLResult': "[(849.97,)]",
        'Answer': 'The highest order amount recorded is $849.97.'
    },
    {
        'Question': "Which product has the highest price?",
        'SQLQuery': "SELECT name, price FROM products ORDER BY price DESC LIMIT 1;",
        'SQLResult': "[('Ultra-Wide 34-inch Monitor', 499.99)]",
        'Answer': 'The highest priced product is the Ultra-Wide 34-inch Monitor priced at $499.99.'
    },
    {
        'Question': "What is the total number of orders placed?",
        'SQLQuery': "SELECT COUNT(*) FROM orders;",
        'SQLResult': "[(10,)]",
        'Answer': 'A total of 10 orders have been placed in the database.'
    }
]