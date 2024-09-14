# SQL AI RAG Application

This project is an AI-powered Retrieval-Augmented Generation (RAG) application that enables users to generate SQL queries from natural language input. The application simplifies database interaction by eliminating the need for writing manual SQL queries. Users can provide the necessary database credentials, and the AI handles the rest.

## Features

- **Natural Language to SQL**: Generate SQL queries using natural language, no SQL knowledge required.
- **Seamless Database Connection**: Simply input your database credentials to connect and start querying.
- **Real-time Query Generation**: Get SQL queries in real-time for efficient data retrieval and manipulation.
- **User-Friendly Interface**: Built with React.js for an intuitive, responsive frontend.
- **Secure and Reliable**: Only the necessary credentials are required to securely connect to the database.

## Tech Stack

- **Backend**: Flask
- **Frontend**: React.js
- **Natural Language Processing**: Langchain
- **AI Models**: Gemini Pro
- **Database**: SQLite

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/IkkiOcesn/SQL-AI.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd SQL-AI
   ```

3. **Backend Setup**:
    - Navigate to the backend directory:
        ```bash
        cd backend
        ```
   - Create a virtual environment:
     ```bash
     python3 -m venv venv
     source venv/bin/activate  # for Linux/macOS
     venv\Scripts\activate  # for Windows
     ```
   - Install the required Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```

4. **Frontend Setup**:
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install the necessary dependencies:
     ```bash
     npm install
     ```

## Usage

1. **Start the Backend**:
   ```bash
   cd backend
   python run.py
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application**:
   - Once both backend and frontend are running, open your browser and navigate to:
     ```
     http://localhost:3000
     ```

4. **Provide Database Credentials**:
   - Input the necessary credentials for your database (e.g., SQLite connection) and start generating SQL queries using natural language.

## Example

- Input: "Show me all the orders from customers in California"

## Contributing

Feel free to submit issues or pull requests. All contributions are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
