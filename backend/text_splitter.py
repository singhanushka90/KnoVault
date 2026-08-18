from langchain_text_splitters import RecursiveCharacterTextSplitter

def split_documents(documents):
    splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
    chunks=splitter.split_documents(documents)
    return chunks

if __name__=="__main__":
    from document_loader import load_pdf
    file_path="uploads/A_Brief_Introduction_To_AI.pdf"
    documents=load_pdf(file_path)
    print(len(documents))
    chunks=split_documents(documents)
    print(len(chunks))
    for i,chunk in enumerate(chunks[:3]):
        print({i+1})
        print(chunk.metadata)


