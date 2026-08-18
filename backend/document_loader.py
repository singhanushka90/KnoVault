from pypdf import PdfReader
from langchain_core.documents import Document

def load_pdf(file_path):
    reader=PdfReader(file_path)
    documents=[]
    for page_number,page in enumerate(reader.pages):
        page_text=page.extract_text()
        if page_text:
            document=Document(page_content=page_text,metadata={"source":file_path,"page":page_number+1})
            documents.append(document)
    return documents