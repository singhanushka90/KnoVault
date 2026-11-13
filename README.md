 KnoVault — Enterprise AI Knowledge Management Platform

An AI-powered enterprise knowledge management platform that enables organizations to securely upload documents, retrieve relevant information, and get contextual answers through Retrieval-Augmented Generation (RAG).

KnoVault transforms organizational documents into an intelligent, searchable knowledge base. Users can ask natural-language questions and receive context-aware answers grounded in uploaded documents, along with relevant source references.

---

Overview

Organizations often store important information across multiple documents, making it difficult for employees to find accurate information quickly.

KnoVault addresses this challenge by combining document management, semantic search, hybrid retrieval, and Large Language Models into a unified AI-powered platform.

Users can interact with organizational knowledge through a conversational AI interface while Role-Based Access Control (RBAC) ensures that users can access only the features and information permitted by their roles.

Key Features

1. AI-Powered Document Question Answering

- Upload organizational PDF documents.
- Extract and process document content.
- Generate embeddings from document chunks.
- Retrieve relevant context using hybrid retrieval.
- Generate contextual answers using an LLM.
- Display source documents and page references with answers.

2. Advanced RAG Pipeline

- PDF text extraction and document processing.
- Semantic chunking and text embeddings.
- Dense vector retrieval using Pinecone.
- Sparse retrieval using BM25.
- Hybrid retrieval combining dense and sparse search.
- Multi-query retrieval.
- Reranking of retrieved results.
- Context-aware answer generation.
- Source-based responses and citations.

3. Role-Based Access Control (RBAC)

KnoVault supports three user roles:

Feature| Owner| HR| Employee
Dashboard| Yes| Yes| Yes
Upload Documents| Yes| No| No
View Documents| Yes| Yes| No
Manage Documents| Yes| No| No
Ask AI Questions| Yes| Yes| Yes
Personal Chat History| Yes| Yes| Yes
Company Chat History| Yes| No| No
Manage Team Members| Yes| No| No
Profile| Yes| Yes| Yes

Permissions are enforced through backend authentication and authorization.

4. Authentication & Security

- JWT-based authentication.
- Password hashing.
- Secure login and signup.
- Role-based route protection.
- Protected API endpoints.
- User and organization-level access control.

5. Document Management

- Upload PDF documents.
- Process and index documents for retrieval.
- View available documents according to permissions.
- Replace existing documents.
- Delete documents and their associated Pinecone vectors.
- Maintain document ownership and access information.

6. Conversational AI

- Ask questions in natural language.
- Receive context-aware AI responses.
- Maintain conversation history.
- Group messages using conversation IDs.
- Retrieve previous conversations.
- Maintain personal chat history.
- Allow Owners to access company-wide chat history.

7. Role-Specific Dashboards

- Separate dashboard experiences for Owner, HR, and Employee.
- Relevant workspace information.
- Recent conversations.
- Role-specific navigation.
- Data-driven dashboard information.

---

Technology Stack

Category| Technologies
Frontend| React.js, Vite, JavaScript
UI| CSS, Lucide React
Backend| Python, FastAPI
Database| MongoDB Atlas
Vector Database| Pinecone
Embedding Model| BAAI/bge-small-en-v1.5
Embedding Dimensions| 384
Retrieval| Dense Search, BM25, Hybrid Retrieval
RAG| LangChain-based document retrieval pipeline
LLM| Groq
Authentication| JWT
Password Security| bcrypt / password hashing
API Communication| Axios
Version Control| Git, GitHub

---

System Architecture

                  USER
                    |
                    v
            React + Vite Frontend
                    |
                    v
             FastAPI Backend
                    |
           JWT Authentication
                    |
                    v
          Role-Based Access Control
             /      |       \
          Owner     HR    Employee
             \      |       /
                    |
                    v
            Document Management
                    |
                    v
           PDF Text Extraction
                    |
                    v
             Text Chunking
                    |
                    v
          BGE Embedding Model
                    |
                    v
               Pinecone
                    |
                    v
             User Question
                    |
                    v
          Query Processing
                    |
                    v
       Hybrid Retrieval (Dense + BM25)
                    |
                    v
             Multi-Query
                    |
                    v
                Reranking
                    |
                    v
           Relevant Context
                    |
                    v
             Groq LLM
                    |
                    v
          Contextual AI Answer
                    |
                    v
          Sources & Citations
                    |
                    v
             User Interface

---

Project Structure

KnoVault/
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── auth.py
│   ├── models.py
│   ├── routes.py
│   ├── rag_pipeline.py
│   ├── document_access.py
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── README.md

---

Getting Started

Prerequisites

Make sure you have the following installed:

- Python 3.10+
- Node.js and npm
- MongoDB Atlas account
- Pinecone account
- Groq API key

1. Clone the Repository

git clone YOUR_GITHUB_REPOSITORY_URL
cd KnoVault

2. Backend Setup

Navigate to the backend directory:

cd backend

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create a ".env" file and configure the required credentials:

MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=know_db
PINECONE_API_KEY=your_pinecone_api_key
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key

Use the exact environment variable names expected by your backend "config.py".

Start the backend:

uvicorn main:app --reload

Backend API:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

3. Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend:

http://localhost:5173

---

How KnoVault Works

1. The Owner uploads organizational PDF documents.
2. The backend extracts and processes document content.
3. Extracted text is divided into manageable chunks.
4. The BGE embedding model converts chunks into 384-dimensional vectors.
5. Vectors are stored in Pinecone.
6. A user submits a natural-language question.
7. The retrieval pipeline searches relevant document chunks using dense and sparse retrieval.
8. Multi-query retrieval and reranking improve the relevance of retrieved context.
9. The relevant context is passed to the Groq-powered LLM.
10. The LLM generates a contextual response grounded in retrieved information.
11. The answer and relevant source references are returned to the frontend.
12. Conversation history is stored for future access.

---

Security & Access Management

KnoVault follows a role-based access model:

- Owner: Manages organizational documents, team members, and company-level conversations.
- HR: Accesses permitted organizational documents and uses the AI assistant.
- Employee: Uses the AI assistant and accesses personal conversation history without document-management access.

Backend authorization remains the source of truth for access permissions.

---

Project Highlights

- Built an end-to-end enterprise AI knowledge management application.
- Implemented a document-based RAG pipeline.
- Combined dense vector search and BM25-based sparse retrieval.
- Integrated multi-query retrieval and reranking.
- Implemented JWT authentication and role-based authorization.
- Integrated MongoDB Atlas and Pinecone.
- Developed a conversational interface with persistent chat history.
- Implemented document lifecycle operations, including upload, replacement, and deletion.
- Built role-specific dashboards and interfaces.

---

Future Scope

Potential future improvements include:

- Support for additional document formats.
- Advanced document analytics.
- Improved retrieval evaluation and monitoring.
- More granular document-level permissions.
- Production cloud deployment.
- Advanced observability and performance optimization.

---

Author

Anushka Singh

B.Tech — Artificial Intelligence & Data Science

GitHub: "singhanushka90" (https://github.com/singhanushka90)

---

KnoVault — Turning Organizational Documents into Intelligent Knowledge.
