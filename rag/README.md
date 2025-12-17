# RAG Chatbot Backend

This directory contains the Retrieval Augmented Generation (RAG) backend for the Docusaurus chatbot. This backend processes user queries, retrieves relevant information from indexed documents (textbook/documentary), and uses a Large Language Model (LLM) to generate accurate responses.

## Table of Contents

1.  [Overview](#overview)
2.  [Prerequisites](#prerequisites)
3.  [Installation](#installation)
4.  [Configuration](#configuration)
5.  [Data Ingestion](#data-ingestion)
6.  [Running the Backend](#running-the-backend)
7.  [API Endpoint](#api-endpoint)
8.  [Troubleshooting](#troubleshooting)

---

## 1. Overview

The RAG backend works as follows:
*   **Data Ingestion:** Loads content from specified sources (e.g., textbook Markdown files, documentary transcripts).
*   **Knowledge Indexing:** Chunks the content, generates vector embeddings for each chunk using OpenAI, and stores these embeddings in Qdrant (vector database). Metadata for each chunk is stored in PostgreSQL.
*   **Query Flow:** When a user asks a question, the backend generates an embedding for the query, retrieves the most relevant content chunks from Qdrant, sends these chunks as context to an LLM (OpenAI), and returns the LLM's generated answer.

---

## 2. Prerequisites

Before you begin, ensure you have the following:

*   **Python 3.8+:** [Download & Install Python](https://www.python.org/downloads/)
*   **Poetry (Recommended):** For dependency management. [Install Poetry](https://python-poetry.org/docs/#installation)
*   **MongoDB:** (Not directly used by this RAG backend, but mentioned in initial setup context, so ensure it's not conflicting with other services if running).
*   **Qdrant Instance:** A running Qdrant instance (cloud or local). You'll need its URL and API Key.
*   **Neon PostgreSQL Database:** A PostgreSQL database instance on Neon.tech (or another provider). You'll need its connection string.
*   **OpenAI API Key:** For generating embeddings and LLM responses.

---

## 3. Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd rag
    ```
2.  **Install dependencies using Poetry (recommended):**
    ```bash
    poetry install
    ```
    (If you don't use Poetry, you can use `pip install -r requirements.txt`)

---

## 4. Configuration

1.  **Create a `.env` file:**
    Copy the `.env.example` file and rename it to `.env` in the `rag` directory.
    ```bash
    cp .env.example .env
    ```
2.  **Edit `.env` file:**
    Update the environment variables in your newly created `.env` file with your actual credentials:
    ```
    QDRANT_URL="YOUR_QDRANT_URL" # e.g., "https://xyz.qdrant.tech"
    QDRANT_API_KEY="YOUR_QDRANT_API_KEY"
    NEON_PG_CONNECTION_STRING="YOUR_NEON_POSTGRES_CONNECTION_STRING"
    OPENAI_API_KEY="AIzaSyDm3LfOamrkacXJIkCgo399Mh45Il_gDSE"

    LLM_MODEL_NAME="gpt-3.5-turbo" # Or "gpt-4", etc.
    ```
    **Important:** Replace all placeholder values (`YOUR_...`) with your actual API keys and connection strings.

3.  **Specify Content Paths:**
    Open `rag/main.py`. The `DOCS_PATH` variable defines where the book's content (Markdown files) is located.
    ```python
    DOCS_PATH = os.path.join("..", "physical-ai-book", "docs") # Relative path to the Docusaurus docs
    ```
    **ACTION REQUIRED:** If you have documentary text or transcripts located elsewhere, you need to configure an additional path here or modify the `ingest_documents` function to include other directories or file types (e.g., PDFs). **Please specify the location of your documentary content.**

---

## 5. Data Ingestion (One-Time Setup)

This step loads your documents, chunks them, generates embeddings, and stores them in Qdrant and PostgreSQL. This needs to be done **only once** or whenever your document content changes.

1.  **Open `rag/main.py`:**
2.  **Uncomment the `ingest_documents()` call:** Find the line `# ingest_documents()` towards the bottom of the `if __name__ == "__main__":` block and remove the `#`.
3.  **Run the script to ingest data:**
    ```bash
    python main.py
    ```
    This will take some time depending on your document size and API call limits. You should see "Document ingestion complete." in the console.
4.  **Re-comment the `ingest_documents()` call:** After successful ingestion, **re-comment** the `ingest_documents()` line in `main.py` to prevent re-ingestion every time the server starts.

---

## 6. Running the Backend

Once data ingestion is complete, you can start the API server.

1.  **Start the API server:**
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
    Alternatively, using the Python Flask development server (less recommended for production):
    ```bash
    python main.py
    ```
    The server will start on port `8000`.

---

## 7. API Endpoint

*   **Endpoint:** `POST /chat`
*   **Description:** Accepts a user question and an optional `selected_text` (if the user highlights content in the frontend) and returns an AI-generated answer based on the indexed documents.
*   **Base URL:** `http://localhost:8000`
*   **Request Body (JSON):**
    ```json
    {
        "question": "What is Physical AI?",
        "selected_text": "Physical Artificial Intelligence (AI) designates intelligent systems..."
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
        "answer": "Based on the provided context, Physical AI refers to intelligent systems integrated with a physical embodiment, allowing them to interact with the real world. (Reference: Chapter 1: Introduction to Physical AI (chap1.md) Line 10-15)"
    }
    ```
*   **Error Response:**
    *   `400 Bad Request`: Question is missing.
    *   `500 Internal Server Error`: Backend error (e.g., LLM generation failure, Qdrant connection issues).

---

## 8. Troubleshooting

*   **"Error: The following required environment variables are not set..."**: Ensure your `.env` file is correctly configured with all necessary API keys and URLs.
*   **"No Markdown files found..."**: Check `DOCS_PATH` in `main.py` and verify that your document files are present.
*   **"Sorry, I could not get a response..." (Frontend error)**: This usually means the backend is not running, or the frontend is trying to connect to the wrong address/port. Ensure your backend server is running on `http://localhost:8000` and `main.py` is configured correctly.
*   **Ingestion fails**: Check network connectivity to Qdrant/PostgreSQL/OpenAI. Verify your API keys are correct.
*   **"I cannot answer this question based on the provided textbook content."**: The RAG system couldn't find relevant chunks or the LLM decided the context was insufficient. Try rephrasing your question or provide more selected text.

---
