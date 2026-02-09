from pydantic import BaseModel, constr

class SignupSchema(BaseModel):
    name: str
    mobile: constr(min_length=10, max_length=15)
    password: constr(min_length=6, max_length=72)

class LoginSchema(BaseModel):
    mobile: constr(min_length=10, max_length=15)
    password: constr(min_length=6, max_length=72)
