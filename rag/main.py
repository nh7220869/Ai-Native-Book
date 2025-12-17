import os
import glob
import json
from dotenv import load_dotenv
import psycopg2
from qdrant_client import QdrantClient, models
from openai import OpenAI
import tiktoken
from unstructured.partition.auto import partition
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
DOCS_PATH = os.path.join("..", "physical-ai-book", "docs") # Relative path to the Docusaurus docs
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
NEON_PG_CONNECTION_STRING = os.getenv("NEON_PG_CONNECTION_STRING")
OPENAI_API_KEY = os.getenv("GEMINI_API_KEY")
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "gpt-3.5-turbo")
EMBEDDING_MODEL = "text-embedding-ada-002"
QDRANT_COLLECTION_NAME = "docusaurus_chapters"
VECTOR_SIZE = 1536 # For text-embedding-ada-002
print("GEMINI_API_KEY:", OPENAI_API_KEY)
# --- Clients ---
qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Helper Functions ---

def get_chapter_title_from_filepath(filepath):
    """
    Extracts a cleaner chapter title from a Markdown file path.
    Assumes filenames are like 'chap1.md' or 'part1-chapter2-sensors-perception.md'
    """
    basename = os.path.basename(filepath)
    name, _ = os.path.splitext(basename)
    # Remove common prefixes and replace hyphens with spaces for better readability
    name = name.replace("part", "").replace("chapter", "").replace("-", " ").strip()
    # Capitalize first letter of each word
    name = ' '.join(word.capitalize() for word in name.split(' '))
    return name

def get_embeddings(texts):
    """Generates embeddings for a list of texts using OpenAI."""
    response = openai_client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
    return [embedding.embedding for embedding in response.data]

def chunk_text(text, filename, title, tokenizer, max_tokens=500, overlap=50):
    """
    Chunks text into smaller pieces, ensuring some overlap and tracking metadata.
    Uses tiktoken for token counting.
    """
    tokens = tokenizer.encode(text)
    chunks = []
    i = 0
    while i < len(tokens):
        chunk_tokens = tokens[i : i + max_tokens]
        chunk_text = tokenizer.decode(chunk_tokens)
        
        # Find start and end line numbers for better referencing
        # This is a simplification; a more robust solution might track line mappings during parsing
        start_line = text.count('\n', 0, text.find(chunk_text)) + 1 if text.find(chunk_text) != -1 else 1
        end_line = start_line + chunk_text.count('\n')

        chunks.append({
            "content": chunk_text,
            "metadata": {
                "filename": filename,
                "chapter_title": title,
                "start_line": start_line,
                "end_line": end_line,
            }
        })
        i += (max_tokens - overlap)
        if max_tokens - overlap <= 0: # Avoid infinite loop if overlap is too large
            break 
    return chunks

def initialize_qdrant_collection():
    """Initializes or re-creates the Qdrant collection."""
    qdrant_client.recreate_collection(
        collection_name=QDRANT_COLLECTION_NAME,
        vectors_config=models.VectorParams(size=VECTOR_SIZE, distance=models.Distance.COSINE),
    )
    print(f"Qdrant collection '{QDRANT_COLLECTION_NAME}' re-created.")

def upsert_to_qdrant(chunks):
    """Upserts document chunks and their embeddings to Qdrant."""
    texts = [chunk["content"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]
    embeddings = get_embeddings(texts)

    points = []
    for i, embedding in enumerate(embeddings):
        # Assign a unique ID for each point. Using hash of content for stability across runs.
        point_id = hash(chunks[i]["content"]) % (10**9) # Simple hash to integer
        points.append(
            models.PointStruct(
                id=point_id,
                vector=embedding,
                payload=metadatas[i]
            )
        )
    qdrant_client.upsert(
        collection_name=QDRANT_COLLECTION_NAME,
        wait=True,
        points=points,
    )
    print(f"Upserted {len(points)} points to Qdrant.")
    return [point.id for point in points] # Return Qdrant point IDs

def initialize_pg_table():
    """Initializes or re-creates the PostgreSQL metadata table."""
    conn = None
    try:
        conn = psycopg2.connect(NEON_PG_CONNECTION_STRING)
        cur = conn.cursor()
        cur.execute(f"""
            DROP TABLE IF EXISTS chapter_metadata;
            CREATE TABLE chapter_metadata (
                id SERIAL PRIMARY KEY,
                qdrant_point_id INTEGER,
                filename VARCHAR(255),
                chapter_title VARCHAR(255),
                start_line INTEGER,
                end_line INTEGER,
                chunk_content TEXT
            );
        """
        )
        conn.commit()
        print("PostgreSQL table 'chapter_metadata' re-created.")
    except Exception as e:
        print(f"Error initializing PostgreSQL table: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

def insert_to_pg(chunks, qdrant_point_ids):
    """Inserts chunk metadata into PostgreSQL."""
    conn = None
    try:
        conn = psycopg2.connect(NEON_PG_CONNECTION_STRING)
        cur = conn.cursor()
        for i, chunk in enumerate(chunks):
            metadata = chunk["metadata"]
            cur.execute(f"""
                INSERT INTO chapter_metadata (qdrant_point_id, filename, chapter_title, start_line, end_line, chunk_content)
                VALUES (%s, %s, %s, %s, %s, %s);
            """, (qdrant_point_ids[i], metadata["filename"], metadata["chapter_title"], metadata["start_line"], metadata["end_line"], chunk["content"]))
        conn.commit()
        print(f"Inserted {len(chunks)} metadata records into PostgreSQL.")
    except Exception as e:
        print(f"Error inserting into PostgreSQL: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

def ingest_documents():
    """
    Loads Markdown documents, chunks them, generates embeddings,
    and stores them in Qdrant and PostgreSQL.
    """
    print("Starting document ingestion...")
    all_chunks = []
    tokenizer = tiktoken.encoding_for_model(LLM_MODEL_NAME) # Using LLM_MODEL_NAME for tokenizer

    markdown_files = glob.glob(os.path.join(DOCS_PATH, "**", "*.md"), recursive=True) + \
                     glob.glob(os.path.join(DOCS_PATH, "**", "*.mdx"), recursive=True) + \
                     glob.glob(os.path.join(DOCS_PATH, "**", "*.pdf"), recursive=True)
    
    if not markdown_files:
        print(f"No Markdown or PDF files found in {DOCS_PATH}. Please check the path and file extensions.")
        return

    for filepath in markdown_files:
        print(f"Loading {filepath}...")
        # Use unstructured.partition.auto.partition for general file handling
        elements = partition(filename=filepath)
        # Filter elements to only include those with 'text' attribute and join them
        text_content = "\n\n".join([el.text for el in elements if hasattr(el, 'text') and el.text is not None])


        title = get_chapter_title_from_filepath(filepath)
        filename = os.path.basename(filepath)

        print(f"Processing {filename} (Title: {title})...")
        chunks = chunk_text(text_content, filename, title, tokenizer)
        all_chunks.extend(chunks)
    
    if not all_chunks:
        print("No chunks were generated from the documents.")
        return

    print(f"Total chunks generated: {len(all_chunks)}")

    # Initialize and upsert to Qdrant
    initialize_qdrant_collection()
    qdrant_ids = upsert_to_qdrant(all_chunks)

    # Initialize and insert to PostgreSQL
    initialize_pg_table()
    insert_to_pg(all_chunks, qdrant_ids)

    print("Document ingestion complete.")

def query_rag(question: str, selected_text: str = None):
    """
    Queries the RAG system to find relevant information and generate an answer.
    Supports full-book queries and queries with highlighted/selected text.
    """
    # 1. Embed the user's question
    query_embedding = get_embeddings([question])[0]

    # 2. Retrieve relevant chunks from Qdrant
    search_results = qdrant_client.search(
        collection_name=QDRANT_COLLECTION_NAME,
        query_vector=query_embedding,
        limit=5, # Retrieve top 5 relevant chunks
    )

    if not search_results:
        return "No relevant information found in the textbook."

    context_chunks = []
    references = set() # Use a set to store unique references
    for hit in search_results:
        payload = hit.payload
        context_chunks.append(payload["content"])
        references.add(f"{payload['chapter_title']} ({payload['filename']}) Line {payload['start_line']}-{payload['end_line']}")

    context = "\n\n".join(context_chunks)
    
    # Optional: If selected_text is provided, try to prioritize or filter
    # For simplicity, we'll just include it in the prompt if present
    if selected_text:
        context = f"User highlighted text: {selected_text}\n\n" + context

    # 3. Construct prompt for LLM
    prompt = f"""You are an AI assistant specialized in the \"Physical AI & Humanoid Robotics\" textbook.
    Answer the following question based ONLY on the provided context from the textbook.
    If the answer cannot be found in the context, respond with \"I cannot answer this question based on the provided textbook content.\"
    Reference the chapter name, filename, and line numbers for each piece of information you provide.
    
    Question: {question}
    
    Context:
    {context}
    
    References:
    {'; '.join(sorted(list(references)))}
    
    Answer:
    """

    # 4. Generate answer using LLM
    try:
        response = openai_client.chat.completions.create(
            model=LLM_MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7,
        )
        answer = response.choices[0].message.content
        return answer
    except Exception as e:
        return f"Error generating answer with LLM: {e}"

# --- Flask Routes ---
@app.route('/chat', methods=['POST'])
def rag_query_endpoint():
    try:
        data = request.json
        question = data.get('question')
        selected_text = data.get('selected_text')

        if not question:
            return jsonify({"error": "Question is required"}), 400

        print(f"API Call: Question='{question}', SelectedText='{selected_text}'")
        answer = query_rag(question, selected_text)
        return jsonify({"answer": answer})
    except Exception as e:
        print(f"Error in RAG query endpoint: {e}")
        return jsonify({"answer": "Sorry, an internal error occurred while processing your request. Please try again later."}), 500

# --- Main Execution ---
if __name__ == "__main__":
    # Ensure environment variables are loaded
    required_env_vars = ["QDRANT_URL", "QDRANT_API_KEY", "NEON_PG_CONNECTION_STRING", "OPENAI_API_KEY"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]

    if missing_vars:
        print(f"Error: The following required environment variables are not set: {', '.join(missing_vars)}")
        print("Please ensure they are defined in your .env file.")
        exit(1)

    print("--- RAG Agent Setup ---")
    
    # Commented out to avoid re-ingesting on every run. Run this once to populate DBs.
    # ingest_documents() 
    
    print("\n--- Starting RAG API ---")
    # To run with Gunicorn: gunicorn -w 4 -b 0.0.0.0:8000 main:app
    # For local development:
    app.run(host='0.0.0.0', port=8000, debug=True)