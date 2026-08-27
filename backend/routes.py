from fastapi import APIRouter , HTTPException , Depends
from models import SignupRequest , CreateTeamMemberRequest
from database import users_collection , chats_collection
import shutil
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import UploadFile , File 
import os
from database import documents_collection
from auth import verify_password , create_access_token ,hash_password , get_current_user ,get_current_owner , require_role
from bson import ObjectId
from rag_pipeline import index_document , generate_answer , delete_documents_vectors
import uuid

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

@router.post("/team-members")
def create_team_member(user:CreateTeamMemberRequest,current_user=Depends(require_role("Owner"))):
    if user.role not in ["HR","Employee"]:
        raise HTTPException(status_code=400,detail="Role must be HR or Employee")
    existing_user=users_collection.find_one({"email":user.email})
    if existing_user:
        raise HTTPException(status_code=400,detail="Email  already exists")
    hashed_password=hash_password(user.password)
    users_collection.insert_one({
        "name":user.username,
        "email":user.email,
        "password":hashed_password,
        "role":user.role,
        "owner_id":current_user["user_id"]
    })
    return {
        "message":f"{user.role} created successfully"
    }

@router.get("/team-members")
def get_team_member(current_user=Depends(get_current_owner)):
    members=list(
        users_collection.find({"owner_id":current_user["user_id"]},{"password":0})
    )
    for member in members:
        member["_id"]=str(member["_id"])
    return members


@router.delete("/team-members/{user_id}")
def delete_team_member(user_id:str,current_user=Depends(get_current_owner)):
    member=users_collection.find_one({"_id":ObjectId(user_id),"owner_id":current_user["user_id"]})
    if not member:
        raise HTTPException(status_code=401,detail="Team member not found")
    users_collection.delete_one({"_id":ObjectId(user_id),"owner_id":current_user["user_id"]})
    return {
        "message":"Team member deleted successfully"
    }


@router.put("/team_members/{user_id}")
def update_team_members(user_id:str,user:CreateTeamMemberRequest,current_user=Depends(get_current_owner)):
    if user.role not in ["HR","Employee"]:
        raise HTTPException(status_code=400,detail="Role must be HR or Employee")
    existing_user=users_collection.find_one({"_id":ObjectId(user_id),"owner_id":current_user["user_id"]})
    if not existing_user:
        raise HTTPException(status_code=401,detail="Team member not found")
    users_collection.update_one({"_id":ObjectId(user_id),"owner_id":current_user["user_id"]},
                                {"$set":{"name":user.username,"email":user.email,"role":user.role}})

    return {"message":"Team member updated successfully"}


@router.post("/login")
def login(form_data:OAuth2PasswordRequestForm=Depends()):
  
    db_user=users_collection.find_one({"email":form_data.username})

    if not db_user:
        raise HTTPException(status_code=401,detail="Invalid Email or password")
    if not verify_password(form_data.password,db_user["password"]):
        raise HTTPException(status_code=401,detail="Invalid Email or password")
    data={
        "user_id":str(db_user["_id"]),
        "role":db_user["role"],
        "owner_id":db_user.get("owner_id",str(db_user["_id"]))
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
async def upload_document(file: UploadFile = File(...),current_user=Depends(require_role("Owner"))):

    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads",file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file,buffer)
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

        "allowed_roles": ["Owner","HR",],
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
def get_document(current_user=Depends(require_role("Owner","HR"))):
    documents=list(documents_collection.find({"owner_id":current_user["user_id"]}))
    for document in documents:
        document["_id"]=str(document["_id"])
    return documents


@router.delete("/documents/{document_id}")
def delete_documents(document_id:str,current_user=Depends(require_role("Owner"))):
    document=documents_collection.find_one({"_id":ObjectId(document_id),
    "uploaded_by":current_user["user_id"]})
    if not document:
        raise HTTPException(status_code=404,detail="Document not found")
    rag_document_id=document["document_id"]
    delete_documents_vectors(rag_document_id)
    file_path=document["file_path"]
    if os.path.exists(file_path):
        os.remove(file_path)
    documents_collection.delete_one({"_id":ObjectId(document_id)})
    return {"message":"Document and its vectors deleted successfully"}


@router.put("/documents/{doument_id}")
def update_document(document_id:str,title:str,description:str,current_user=Depends(require_role("Owner"))):
    document=documents_collection.find_one({"_id":ObjectId(document_id),"uploaded_by":current_user["user_id"]})
    if not document:
        raise HTTPException(status_code=404,detail="Document not found")
    documents_collection.update_one({"_id":ObjectId(document_id)},{"$set":{"title":title,"description":description}})
    return {"message":"Document updated successfully"}



@router.put("/documents/{document_id}/file")
async def replace_document(document_id:str,file:UploadFile=File(...),current_user=Depends(require_role("Owner"))):
    document=documents_collection.find_one({"_id":ObjectId(document_id),"uploaded_by":current_user["user_id"]})
    if not document:
        raise HTTPException(status_code=404,detail="Document not found")
    os.makedirs("uploads",exist_ok=True)
    new_file_path=os.path.join("uploads",f"{uuid.uuid4()}_{file.filename}")
    with open(new_file_path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)
    rag_result = index_document(new_file_path,owner_id=current_user["user_id"])
    if "error" in rag_result:
        if os.path.exists(new_file_path):
            os.remove(new_file_path)
        raise HTTPException(status_code=400,detail=rag_result["error"])
    delete_documents_vectors(document["document_id"])
    old_file_path=document["file_path"]
    if os.path.exists(old_file_path):
        os.remove(old_file_path)
    documents_collection.update_one(
        {
            "_id":ObjectId(document_id)
        },
        {
            "$set":{
                "filename": file.filename,
                "file_path": new_file_path,
                "content_type": file.content_type,
                "uploaded_by": current_user["user_id"],
                "document_id": rag_result["document_id"],
                "owner_id":current_user["user_id"],
                "vectors_stored": rag_result["vectors_stored"],
                "status": "indexed"
                }
        }
    )
    return {
        "message": "Document replaced and indexed successfully",
        "filename": file.filename,
        "document_id": rag_result["document_id"],
        "vectors_stored": rag_result["vectors_stored"]
        }
    
    

    

@router.post("/ask")
def ask_question(question:str,conversation_id:str=None,current_user=Depends(require_role("Owner","HR","Employee"))):
    print("Current user:",current_user)
    document=documents_collection.find_one({"owner_id":current_user["owner_id"],"allowed_roles":current_user["role"]})
    print("Document found:",document)
    if not document:
        raise HTTPException(status_code=403,detail="You don't have access to this document")
    if conversation_id is None:
        conversation_id=str(uuid.uuid4())
    chat_history=list(
        chats_collection.find(
            {
                "conversation_id":conversation_id,"user_id":current_user["user_id"]
            },
            {
                "_id":0,
                "question":1,
                "answer":1
            }
        ).sort("_id",1)
    )
    history_text=""
    for chat in chat_history:
        history_text+=f"""User:{chat.get("question","")}Assistant:{chat.get("answer","")}"""
    print("CHAT HISTORY:")
    print(history_text)
    result=generate_answer(query=question,file_path=document["file_path"],document_id=document["document_id"])
    sources=[]
    for doc in result["documents"]:
        sources.append({
            "pages":doc.metadata.get("page"),
            "source":doc.metadata.get("source"),
            "rerank_score":doc.metadata.get("rerank_score")
        })
    chats_collection.insert_one({
        "user_id":current_user["user_id"],
        "owner_id":current_user["owner_id"],
        "role":current_user["role"],
        "conversation_id":conversation_id,
        "question":question,
        "answer":result["answer"],
        "document_id":document["document_id"],
        "filename":document["filename"]
    })
    return {
        "answer":result["answer"],
        "sources":sources
    }



@router.get("/chats")
def get_chats(current_user=Depends(require_role("Owner","HR","Employee"))):
    chats=list(chats_collection.find({
        "user_id":current_user["user_id"]
    },
    {
        "_id":0
    }).sort("_id",-1))
    return chats


@router.get("/company/chats")
def get_company_chats(current_user=Depends(require_role("Owner"))):
    chats=list(chats_collection.find({
        "owner_id":current_user["user_id"]
    },
    {
        "_id":0
    }).sort("_id",-1))
    return chats

