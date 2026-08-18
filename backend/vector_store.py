import os 
from pinecone import Pinecone
from config import PINECONE_API_KEY,PINECONE_INDEX

pc=Pinecone(api_key=PINECONE_API_KEY)
index=pc.Index(PINECONE_INDEX)
def get_index():
    return index
def upsert_embeddings(embedded_chunks,document_id):
    vectors=[]
    for chunk in embedded_chunks:
        chunk_id=chunk['metadata']['chunk_id']
        vectors.append({
            "id":f"{document_id}-chunk-{chunk_id}",
            "values":chunk["embedding"],
            "metadata":{"text":chunk["text"],**chunk["metadata"]}
        })
        index.upsert(vectors=vectors)
    return len(vectors)
def delete_all_vectors():
    index.delete(delete_all=True)
    print("all vectors deleted")
