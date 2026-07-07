# DataChat AI SQL Assistant

A full-stack, production-ready web application that enables users to upload CSV/XLSX datasets and query them using natural language.

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Google Gemini API Key

## Setup Instructions

### 1. Database Setup

1. Start your local PostgreSQL server.
2. Run the `init.sql` script located in the root directory to create the `datachat` database, the `datasets` metadata table, and seed the sample sales data.
   ```bash
   psql -U postgres -d postgres -f init.sql
   ```

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Open `backend/.env` and insert your Gemini API Key and PostgreSQL connection details if they differ from the defaults:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=datachat
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

## Testing the 5 Mandatory Queries

Once the app is running and you have uploaded a dataset (or are using the seeded `sample_sales` dataset), navigate to the Chat interface and try these queries:

1. "Show top 10 customers by revenue."
2. "Find duplicate records."
3. "Which month generated the highest sales?"
4. "Show records with missing values."
5. "Generate a sales summary for the last quarter."
