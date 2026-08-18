from vector_store import get_index
from embedding import generate_embeddings

def retriever_documents(query,top_k=5):
    query_embedding=generate_embeddings([query])[0]
    index=get_index()
    results=index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    return results