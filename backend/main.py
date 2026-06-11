import sys
from fastapi import FastAPI

app = FastAPI()
errors = {}
info = {"python": sys.version}

# Try each import and record what fails
for pkg, stmt in [
    ("sqlalchemy", "import sqlalchemy; info['sqlalchemy'] = sqlalchemy.__version__"),
    ("sqlalchemy_orm", "from sqlalchemy.orm import sessionmaker, DeclarativeBase"),
    ("database", "from database import engine; info['engine'] = str(engine.url)"),
    ("models", "from models import Base"),
    ("jwt", "import jwt; info['jwt'] = jwt.__version__"),
    ("auth", "import auth"),
    ("seed", "import seed"),
]:
    try:
        exec(stmt)
    except Exception as e:
        errors[pkg] = f"{type(e).__name__}: {e}"

@app.get("/")
def root():
    return {"python": info.get("python"), "errors": errors, "info": info}
