 # KnoVault 🧠
 
KnoVault is an AI-powered document knowledge platform that allows users to upload PDF documents and ask natural-language questions. It uses a RAG (Retrieval-Augmented Generation) pipeline to retrieve relevant information from uploaded documents and generate grounded answers with source citations.
🚀 Current Features
🔐 JWT Authentication
👤 User Signup & Login
🛡️ Role-Based Access Control (RBAC)
Owner role implemented
Owner-only document management
📄 PDF Upload
🗄️ MongoDB document metadata storage
🧠 HuggingFace BGE Embeddings
🌲 Pinecone Vector Database
🔎 Semantic Vector Search
🔤 BM25 Keyword Search
🔀 Hybrid Search
Vector Search + BM25
🔁 Multi-Query Retrieval
🎯 Cross-Encoder Reranking
🤖 Groq LLM
📚 Context-based Answer Generation
📌 Source page & rerank score returned with answers
🏗️ Current RAG Pipeline

PDF Upload
    ↓
PDF Loader
    ↓
Text Splitting
    ↓
BGE Embeddings
    ↓
Pinecone
    ↓
        ┌───────────────┐
        │ Vector Search │
        │     +         │
        │ BM25 Search   │
        └───────┬───────┘
                ↓
          Hybrid Search
                ↓
        Multi-Query Retrieval
                ↓
           Reranking
                ↓
         Top Documents
                ↓
          Build Context
                ↓
            Groq LLM
                ↓
        Grounded Answer
                ↓
       Sources + Page Numbers

📁 Backend Structure

KnoVault/
│
├── backend/
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── rag_pipeline.py
│   ├── routes.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── uploads/
│
├── frontend/
│
├── README.md
└── .gitignore

🔐 Authentication
JWT-based authentication is implemented using:
Password hashing with bcrypt
JWT access tokens
Token verification
Current-user dependency
Owner authorization dependency
Example:
