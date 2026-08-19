from fastapi import APIRouter , HTTPException , Depends
from models import SignupRequest , LoginRequest
from database import users_collection
import shutil
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import UploadFile , File 
import os
from database import documents_collection
from auth import verify_password , create_access_token ,hash_password , get_current_user ,get_current_owner
from bson import ObjectId
from rag_pipeline import index_document , generate_answer

router=APIRouter()

@router.get("/")
def home():
    return {"message":"KnowledgeOS API running"}


@router.post("/signup")
def signup(user:SignupRequest):
    existing_user=users_collection.find_one({"email":user.email})
    if existing_user:
        raise HTTPException(status_code=400,detail="Email already exists")
    hashed_password=hash_password(user.password)
    users_collection.insert_one({
        "name":user.username,
        "email":user.email,
        "password":hashed_password,
        "role":"Owner"
    })

    return{
        "message":"User registered successfully"
    }

@router.post("/login")
def login(form_data:OAuth2PasswordRequestForm=Depends()):
    db_user=users_collection.find_one({"email":form_data.username})
    if not db_user:
        raise HTTPException(status_code=401,detail="Invalid Email or password")
    if not verify_password(form_data.password,db_user["password"]):
        raise HTTPException(status_code=401,detail="Invalid Email or password")
    data={
        "user_id":str(db_user["_id"]),
        "role":db_user["role"]
    }
    token=create_access_token(data)
    return {
        "access_token":token,
        "token_type":"bearer"
    }


@router.get("/profile")
def profile(current_user=Depends(get_current_user)):
    return current_user


@router.post("/upload_documents")
async def upload_document(file: UploadFile = File(...),current_user=Depends(get_current_owner)):

    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads",file.filename)
    with open(file_path, "wb") as buffer:shutil.copyfileobj(file.file,buffer)
    rag_result = index_document(file_path,owner_id=current_user["user_id"])

    if "error" in rag_result:

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(status_code=400,detail=rag_result["error"])


    document = {
        "filename": file.filename,
        "file_path": file_path,
        "content_type": file.content_type,

        "uploaded_by": current_user["user_id"],
        "owner_id": current_user["user_id"],

        "allowed_roles": ["Owner","HR","Employee"],
        "document_id": rag_result["document_id"],
        "vectors_stored": rag_result["vectors_stored"],
        "status": "indexed"
    }

    documents_collection.insert_one(document)

    return {

        "message": "File uploaded and indexed successfully",
        "filename": file.filename,
        "document_id": rag_result["document_id"],
        "vectors_stored": rag_result["vectors_stored"]
    }


@router.get("/documents")
def get_document(current_user=Depends(get_current_owner)):
    documents=list(documents_collection.find({"uploaded_by":current_user["user_id"]}))
    for document in documents:
        document["_id"]=str(document["_id"])
    return documents


@router.delete("/documents/{document_id}")
def delete_documents(document_id:str,current_user=Depends(get_current_owner)):
    document=documents_collection.find_one({"_id":ObjectId(document_id),
    "uploaded_by":current_user["user_id"]})
    if not document:
        raise HTTPException(status_code=404,detail="Document not found")
    file_path=document["file_path"]
    if os.path.exists(file_path):
        os.remove(file_path)
    documents_collection.delete_one({"_id":ObjectId(document_id)})
    return {"message":"Document deleted successfully"}


@router.put("/documents/{doument_id}")
def update_document(document_id:str,title:str,description:str,current_user=Depends(get_current_owner)):
    document=documents_collection.find_one({"_id":ObjectId(document_id),"uploaded_by":current_user["user_id"]})
    if not document:
        raise HTTPException(status_code=404,detail="Document not found")
    documents_collection.update_one({"_id":ObjectId(document_id)},{"$set":{"title":title,"description":description}})
    return {"message":"Document updated successfully"}


@router.post("/ask")
def ask_question(question:str,current_user=Depends(get_current_user)):
    document=documents_collection.find_one({"uploaded_by":current_user["user_id"]})
    if not document:
        raise HTTPException(status_code=404,detail="Document not found")
    result=generate_answer(query=question,file_path=document["file_path"],document_id=str(document["_id"]))
    sources=[]
    for doc in result["documents"]:
        sources.append({
            "pages":doc.metadata.get("page"),
            "source":doc.metadata.get("source"),
            "rerank_score":doc.metadata.get("rerank_score")
        })
    return {
        "answer":result["answer"],
        "sources":sources
    }