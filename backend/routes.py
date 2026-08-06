from fastapi import APIRouter , HTTPException
from models import SignupRequest , LoginRequest
from database import users_collection
from auth import verify_password , create_access_token ,hash_password

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
        "password":hashed_password
    })

    return{
        "message":"User registered successfully"
    }

@router.post("/login")
def login(user:LoginRequest):
    db_user=users_collection.find_one({"email":user.email})
    if not db_user:
        raise HTTPException(status_code=401,detail="Invalid Email or password")
    if not verify_password(user.password,db_user["password"]):
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



