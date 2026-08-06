from pymongo import MongoClient
from config import MONGODB_URI , DATABASE_NAME

client=MongoClient(MONGODB_URI)
db=client[DATABASE_NAME]

users_collection=db["users"]
documents_collection=db["documents"]
chats_collection=db["chats"]
feedback_collection=db["feedback"]

