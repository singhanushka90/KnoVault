import os

from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever
from config import PINECONE_API_KEY, PINECONE_INDEX,GROQ_API_KEY
from langchain_groq import ChatGroq
from langchain_classic.retrievers.multi_query import MultiQueryRetriever



embedding = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
llm = ChatGroq(model_name="llama-3.1-8b-instant",api_key=GROQ_API_KEY)
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
    multii_query_retriever= create_hybrid_retriever(file_path,document_id)
    documents=multii_query_retriever.invoke(query)
    return documents

