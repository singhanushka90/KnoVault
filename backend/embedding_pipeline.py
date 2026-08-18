from document_loader import load_pdf
from text_splitter import split_documents
from embedding import generate_embeddings


def create_embedding_for_documents(file_path):
    documents=load_pdf(file_path)
    chunks=split_documents(documents)
    texts=[chunk.page_content for chunk in chunks]
    vectors=generate_embeddings(texts)
    embedded_chunks=[]
    for chunk,vector in zip(chunks,vectors):
        embedded_chunks.append({"text":chunk.page_content,"embedding":vector,"metadata":chunk.metadata})
    return embedded_chunks
if __name__=="__main__":
    file_path="uploads/A_Brief_Introduction_To_AI.pdf"
    embedded_chunks=create_embedding_for_documents(file_path)
    print(len(embedded_chunks))
    print(embedded_chunks[0]["text"])
    print(embedded_chunks[0]["metadata"])
    print(len(embedded_chunks[0]["embedding"]))