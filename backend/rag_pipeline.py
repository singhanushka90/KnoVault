from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
import uuid
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever
from config import PINECONE_API_KEY, PINECONE_INDEX,GROQ_API_KEY
from langchain_groq import ChatGroq
from langchain_classic.retrievers.multi_query import MultiQueryRetriever
from sentence_transformers import CrossEncoder
from langchain_core.prompts import ChatPromptTemplate


embedding = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

llm = ChatGroq(model_name="openai/gpt-oss-20b",api_key=GROQ_API_KEY)

reranker=CrossEncoder("BAAI/bge-reranker-base")

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)

vectorstore = PineconeVectorStore(index=index,embedding=embedding)

splitter = RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)

def load_pdf(file_path):
    reader = PdfReader(file_path)
    documents = []
    for page_number, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            document = Document(
                page_content=page_text,
                metadata={
                    "source": file_path,
                    "page": page_number + 1
                }
            )
            documents.append(document)
    return documents


def split_documents(documents):
    chunks = splitter.split_documents(documents)
    return chunks


def index_document(file_path, owner_id):
    documents = load_pdf(file_path)
    chunks = split_documents(documents)
    if not chunks:
        return {"error": "Document is empty"}
    document_id = str(uuid.uuid4())
    ids = []

    for i, chunk in enumerate(chunks):

        chunk.metadata["document_id"] = document_id
        chunk.metadata["chunk_id"] = i
        chunk.metadata["owner_id"] = owner_id
        chunk.metadata["allowed_roles"] = ["Owner","HR","Employee"]
        ids.append(f"{document_id}-chunk-{i}")

    vectorstore.add_documents(documents=chunks,ids=ids)

    return {"document_id": document_id,"vectors_stored": len(chunks)}
    

retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
def retrieve_documents(query):
    documents = retriever.invoke(query)
    return documents

def create_bm25_retriever(file_path, document_id):
    documents = load_pdf(file_path)

    chunks = split_documents(documents)

    for i, chunk in enumerate(chunks):

        chunk.metadata["chunk_id"] = i
        chunk.metadata["document_id"] = document_id

    bm25 = BM25Retriever.from_documents(chunks)
    bm25.k = 5
    return bm25

def create_hybrid_retriever(file_path,document_id):

    bm25 = create_bm25_retriever(file_path,document_id)

    hybrid_retriever = EnsembleRetriever(retrievers=[retriever,bm25],weights=[0.6,0.4])
    return hybrid_retriever

def create_multi_query_retreiver(file_path,document_id):
    hybrid_retriever = create_hybrid_retriever(file_path,document_id)
    multi_query_retriever=MultiQueryRetriever.from_llm(retriever=hybrid_retriever,llm=llm)
    return multi_query_retriever

def multi_query_search(query,file_path,document_id):
    multi_query_retriever= create_multi_query_retreiver(file_path,document_id)
    documents=multi_query_retriever.invoke(query)
    return documents

def rerank_documents(query, documents, top_k=3):
    pairs = []

    for document in documents:
        pairs.append([query,document.page_content])
    scores = reranker.predict(pairs)

    ranked_documents = sorted(zip(documents, scores),key=lambda x: x[1],reverse=True)
    results = []
    for document, score in ranked_documents[:top_k]:
        document.metadata["rerank_score"] = float(score)

        results.append(document)

    return results

def retrieve_and_rerank(query,file_path,document_id,top_k=3):

    documents = multi_query_search(query,file_path,document_id)

    ranked_documents = rerank_documents(
        query,
        documents,
        top_k=top_k
    )

    return ranked_documents

rag_prompt = ChatPromptTemplate.from_messages([

    (
        "system",
        """
You are an AI assistant for KnoVault.

Answer the user's question ONLY using the provided context.

Rules:
1. Do not use outside knowledge.
2. Do not make up information.
3. If the answer is not present in the context,
   say: "I don't know based on the uploaded documents."
4. Keep the answer clear and concise.
5. When possible, mention the source page.
6. Do not mention information that is not present in the context.

Context:
{context}
"""
    ),

    (
        "human",
        "{question}"
    )

])


def build_context(documents):
    context_parts = []

    for document in documents:
        text = document.page_content
        source = document.metadata.get("source")
        page = document.metadata.get("page")

        context_parts.append(
            f"""Source: {source}Page: {page}{text}""")

    context = "\n\n".join(context_parts)

    return context


def generate_answer(query,file_path,document_id
):

    documents = retrieve_and_rerank(query,file_path,document_id,top_k=3)
    context = build_context(documents)
    messages = rag_prompt.format_messages(
        context=context,
        question=query
    )

    response = llm.invoke(messages)

    return {
        "answer": response.content,
        "documents": documents
    }

