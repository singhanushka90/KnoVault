from fastapi import APIRouter , HTTPException , Depends
from models import SignupRequest , LoginRequest
from database import users_collection
from fastapi.security import OAuth2PasswordRequestForm
from auth import verify_password , create_access_token ,hash_password , get_current_user ,get_current_owner


router=APIRouter()

@router.get("/")
def home():
    return {"message":"KnowledgeOS API running"}

@router.get("/health")
def health():
    return {"status":"healthy"}


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
def upload_documents(current_user=Depends(get_current_owner)):
    return {"message":"Upload allowed"}


