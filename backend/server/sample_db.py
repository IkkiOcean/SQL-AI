import os
import sqlite3

SAMPLE_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_ecommerce.db"))

SAMPLE_QUESTIONS = [
    {
        "category": "Sales & Revenue",
        "question": "What is the total revenue generated across all completed orders?"
    },
    {
        "category": "Customer Analytics",
        "question": "Who are the top 5 customers by total spending and where are they from?"
    },
    {
        "category": "Product Performance",
        "question": "Which product categories generate the highest total sales?"
    },
    {
        "category": "Inventory & Price",
        "question": "List the top 5 most expensive products currently in stock."
    },
    {
        "category": "Geography",
        "question": "How many orders have been placed from customers in California (CA)?"
    }
]

def init_sample_db(db_path=SAMPLE_DB_PATH):
    """Creates and seeds a realistic e-commerce SQLite database for instant demo usage."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create tables
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS customers (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        country TEXT NOT NULL,
        created_at DATE DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories (category_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        order_date DATE NOT NULL,
        status TEXT NOT NULL,
        total_amount REAL NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (order_id),
        FOREIGN KEY (product_id) REFERENCES products (product_id)
    );
    """)

    # Check if already populated
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        # Seed categories
        categories = [
            (1, "Electronics", "Gadgets, devices, and accessories"),
            (2, "Audio", "Headphones, speakers, and microphones"),
            (3, "Computers & Office", "Laptops, monitors, and ergonomic desks"),
            (4, "Wearables", "Smartwatches and fitness trackers")
        ]
        cursor.executemany("INSERT INTO categories VALUES (?, ?, ?)", categories)

        # Seed products
        products = [
            (1, "Noise-Cancelling Headphones Pro", 2, 299.99, 45),
            (2, "Ultra-Wide 34-inch Monitor", 3, 499.99, 30),
            (3, "Ergonomic Mechanical Keyboard", 3, 129.99, 80),
            (4, "Wireless Precision Mouse", 3, 79.99, 110),
            (5, "Smart Fitness Watch Ultra", 4, 399.99, 55),
            (6, "Portable Bluetooth Speaker Max", 2, 149.99, 65),
            (7, "USB-C Multiport Hub Pro", 1, 59.99, 140),
            (8, "4K Streaming Webcam with HDR", 1, 99.99, 90),
            (9, "Wireless Earbuds Active", 2, 179.99, 75),
            (10, "Aluminum Laptop Stand", 3, 49.99, 120)
        ]
        cursor.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?)", products)

        # Seed customers
        customers = [
            (1, "Alice", "Johnson", "alice.j@example.com", "San Francisco", "CA", "USA", "2024-01-15"),
            (2, "Marcus", "Chen", "marcus.chen@example.com", "Seattle", "WA", "USA", "2024-02-01"),
            (3, "Elena", "Rostova", "elena.r@example.com", "New York", "NY", "USA", "2024-02-14"),
            (4, "David", "Kim", "david.k@example.com", "Austin", "TX", "USA", "2024-02-28"),
            (5, "Sophia", "Martinez", "sophia.m@example.com", "Los Angeles", "CA", "USA", "2024-03-05"),
            (6, "James", "Wilson", "james.w@example.com", "Chicago", "IL", "USA", "2024-03-12"),
            (7, "Priya", "Patel", "priya.p@example.com", "San Jose", "CA", "USA", "2024-03-20"),
            (8, "Liam", "Smith", "liam.smith@example.com", "Boston", "MA", "USA", "2024-04-02")
        ]
        cursor.executemany("INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?)", customers)

        # Seed orders
        orders = [
            (1, 1, "2024-03-01", "Completed", 799.98),
            (2, 2, "2024-03-04", "Completed", 499.99),
            (3, 3, "2024-03-10", "Completed", 579.98),
            (4, 4, "2024-03-15", "Completed", 129.99),
            (5, 5, "2024-03-22", "Completed", 849.97),
            (6, 1, "2024-04-01", "Completed", 399.99),
            (7, 7, "2024-04-05", "Completed", 229.98),
            (8, 2, "2024-04-12", "Completed", 149.99),
            (9, 6, "2024-04-18", "Completed", 629.98),
            (10, 8, "2024-04-25", "Pending", 299.99)
        ]
        cursor.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?)", orders)

        # Seed order_items
        order_items = [
            (1, 1, 1, 1, 299.99),  # Headphones
            (2, 1, 2, 1, 499.99),  # Monitor
            (3, 2, 2, 1, 499.99),  # Monitor
            (4, 3, 1, 1, 299.99),  # Headphones
            (5, 3, 9, 1, 179.99),  # Earbuds
            (6, 3, 8, 1, 99.99),   # Webcam
            (7, 4, 3, 1, 129.99),  # Keyboard
            (8, 5, 5, 1, 399.99),  # Smartwatch
            (9, 5, 1, 1, 299.99),  # Headphones
            (10, 5, 6, 1, 149.99), # Speaker
            (11, 6, 5, 1, 399.99), # Smartwatch
            (12, 7, 6, 1, 149.99), # Speaker
            (13, 7, 4, 1, 79.99),  # Mouse
            (14, 8, 6, 1, 149.99), # Speaker
            (15, 9, 2, 1, 499.99), # Monitor
            (16, 9, 3, 1, 129.99), # Keyboard
            (17, 10, 1, 1, 299.99) # Headphones
        ]
        cursor.executemany("INSERT INTO order_items VALUES (?, ?, ?, ?, ?)", order_items)

        conn.commit()

    conn.close()
    return db_path

def get_sample_db_path():
    return init_sample_db()
