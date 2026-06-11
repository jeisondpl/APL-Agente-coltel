from pydantic import BaseModel


class UserContext(BaseModel):
    id: str
    first_name: str
    last_name: str
    username: str
    role: str


class UserInput(BaseModel):
    username: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str


class NewUser(BaseModel):
    username: str
    first_name: str
    last_name: str
    role: str = "user"
