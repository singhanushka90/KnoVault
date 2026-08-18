 # KnoVault 🧠

KnowledgeOS is an AI-powered document question-answering system that uses
Retrieval-Augmented Generation (RAG) to answer questions from uploaded documents
with relevant source information.

## 🚀 Current Features

- PDF document ingestion
- Text extraction and chunking
- 384-dimensional BGE embeddings
- Pinecone vector storage
- Semantic vector search
- BM25 keyword search
- Hybrid retrieval
- Multi-query retrieval
- BGE cross-encoder reranking
- Context building
- Groq LLM-based answer generation
- Source and page metadata
- Citation-aware responses

## 🏗️ Current RAG Pipeline

```text
PDF
 ↓
Document Loader
 ↓
Text Splitter
 ↓
BGE Embeddings (384-d)
 ↓
Pinecone
 ↓
Semantic Search + BM25
 ↓
Hybrid Retrieval
 ↓
MultiQuery Retrieval
 ↓
BGE Reranker
 ↓
Top Relevant Chunks
 ↓
Context Builder
 ↓
Groq LLM
 ↓
Answer + Sources
