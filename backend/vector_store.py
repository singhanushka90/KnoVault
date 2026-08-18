import os 
from pinecone import Pinecone
from config import PINECONE_API_KEY,PINECONE_INDEX

pc=Pinecone(api_key=PINECONE_API_KEY)
index=pc.Index(PINECONE_INDEX)
def get_index():
    return index
if __name__=="__main__":
    print(index)
