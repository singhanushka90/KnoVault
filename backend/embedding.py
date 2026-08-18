from sentence_transformers import SentenceTransformer
from config import MODEL_NAME

model=SentenceTransformer(MODEL_NAME)
def generate_embeddings(texts):
    embeddings=model.encode(texts,normalize_embeddings=True)
    return embeddings.tolist()
