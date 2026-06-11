import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
import auth
import seed

app = FastAPI()
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router, prefix="/api/auth")

@app.get("/")
def root():
    return {"status": "ok", "step": "database+models+auth+seed"}
