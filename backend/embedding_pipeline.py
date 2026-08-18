from document_loader import load_pdf
from text_splitter import split_documents
from embedding import generate_embeddings
from vector_store import upsert_embeddings
import uuid

def create_embedding_for_documents(file_path):
    document_id=str(uuid.uuid4())
    documents=load_pdf(file_path)
    chunks=split_documents(documents)
    texts=[chunk.page_content for chunk in chunks]
    vectors=generate_embeddings(texts)
    embedded_chunks=[]
    for i , (chunk,vector) in enumerate(zip(chunks,vectors)):
        metadata={**chunk.metadata,"document_id":document_id,"chunk_id":i}
        embedded_chunks.append({
            "text":chunk.page_content,
            "embedding":vector,
            "metadata":metadata
        })
    count=upsert_embeddings(embedded_chunks,document_id)
    return document_id,count
