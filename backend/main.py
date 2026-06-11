from fastapi import FastAPI
from database import engine
from models import Base

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok", "step": "database+models only"}
