from passlib.context import CryptContext
from jose import jwt , JWTError
from datetime import datetime , timedelta
from config import ACCESS_TOKEN_EXPIRE_MINUTES,SECRET_KEY,ALGORITHM

pwd_context=CryptContext(scheme=["bcrypt"],deprecated="auto")
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