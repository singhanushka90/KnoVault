from passlib.context import CryptContext
from jose import jwt , JWTError
from datetime import datetime , timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends , HTTPException
from config import ACCESS_TOKEN_EXPIRE_MINUTES,SECRET_KEY,ALGORITHM

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")
def hash_password(password:str)->str:
    return pwd_context.hash(password)

def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context.verify(plain_password,hashed_password)

def create_access_token(data:dict)->str:
    to_encode=data.copy()
    expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    token=jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return token

def verify_access_token(token:str)->dict|None:
    try:
        payload=jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        return None


oauth2_scheme=OAuth2PasswordBearer(tokenUrl="login")
def get_current_user(token:str=Depends(oauth2_scheme)):
    payload=verify_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401,detail="Invalid Token")
    return payload


def get_current_owner(current_user=Depends(get_current_user)):
    print(current_user)
    if current_user["role"]!="Owner":
        raise HTTPException(status_code=403,detail="Only owner can access this source")
    return current_user


def required_role(*allowed_roles):
    def role_checker(current_user=Depends(get_current_user)):
        if current_user['role'] not in allowed_roles:
            raise HTTPException(status_code=403,detail="You do not have  permission to access this resource")
        return current_user
    return role_checker