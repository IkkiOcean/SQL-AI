# SQL AI Explorer 🚀

An autonomous Natural Language to SQL Analytics Agent built with **Flask**, **Google Gemini**, **LangChain**, and **React**. Designed for production demonstrations, portfolio reviews, and interactive data exploration.

---

## 🌟 Key Highlights & AI Engineering Capabilities

- **Zero-Friction 1-Click Demo**: Includes a pre-populated SQLite E-Commerce database (`customers`, `orders`, `order_items`, `products`, `categories`) so evaluators can test instantly without setting up MySQL.
- **Custom Database Support**: Connect seamlessly to any MySQL server or custom SQLAlchemy URI (PostgreSQL, SQLite, etc.).
- **Self-Explanatory UX**: Displays real-time schema table badges and interactive one-click starter questions.
- **Full Execution Transparency**: Returns and renders:
  1. **Executive Natural Language Summary**
  2. **Generated SQL Query** (with 1-click clipboard copy)
  3. **Interactive Tabular Data Grid** (showing records returned directly from the database)
  4. **Query Execution Time Metrics**
- **Safety & Mutation Guardrails**: AST & regex validation ensures only safe read-only (`SELECT`, `WITH`) queries are executed, blocking malicious injections (`DROP`, `DELETE`, `UPDATE`, `ALTER`).
- **Autonomous Self-Correction**: If a generated query encounters a syntax error, the agent feeds the error traceback back to Gemini to self-heal and re-execute.

---

## 🛠️ Tech Stack

- **Frontend**: React.js 18, Material UI, Modern Glassmorphism CSS
- **Backend API**: Python 3.12, Flask, Flask-CORS
- **AI & LLM Orchestration**: LangChain, Google Gemini (`gemini-1.5-flash`), Python-Dotenv
- **Databases**: SQLite (bundled demo), MySQL (via PyMySQL), SQLAlchemy

---

## ⚡ Quickstart Guide

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure your Google Gemini API Key in .env
# Get a free key at: https://aistudio.google.com/app/apikey
cp .env.example .env
# Edit .env and set GOOGLE_API_KEY=your_actual_key_here

# Start the Flask API server
python3 run.py
```
*Backend runs on `http://127.0.0.1:5000`*

### 2. Frontend Setup

```bash
cd frontend

# Install node dependencies
npm install --legacy-peer-deps

# Start the React development server
npm start
```
*Frontend opens on `http://localhost:3000`*

---

## 💡 How to Demo

1. Open `http://localhost:3000` in your browser.
2. Select **"Pre-Loaded Sample E-Commerce DB"** and click **"Launch Demo with Sample DB"**.
3. Use the sidebar to inspect tables in the schema (`customers`, `orders`, `products`, etc.).
4. Click any of the suggested prompt pills:
   - *"What is the total revenue generated across all completed orders?"*
   - *"Who are the top 5 customers by total spending and where are they from?"*
   - *"Which product categories generate the highest total sales?"*
5. Or type any freeform question in plain English!
6. Inspect the generated SQL, the data table rows, and the AI executive summary.

---

## 🔒 Security Guardrails

The application intercepts all generated SQL before execution:
```python
# Prohibits DROP, DELETE, INSERT, UPDATE, ALTER, TRUNCATE, etc.
is_safe_read_only_query(sql_query) -> bool
```
Any attempts to modify or delete data are rejected with an explicit security alert.

---

## 📄 License
MIT License
