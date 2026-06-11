import os
import asyncio
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import clients, sales, formations, stock, relances, dashboard, exports, calendar_events
import auth
import seed

app = FastAPI(
    title="Escargot CRM",
    description="CRM pour l'élevage d'escargots et hannetons",
    version="1.0.0"
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentification"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(sales.router, prefix="/api/ventes", tags=["Ventes"])
app.include_router(formations.router, prefix="/api/formations", tags=["Formations"])
app.include_router(stock.router, prefix="/api/stock", tags=["Stock"])
app.include_router(relances.router, prefix="/api/relances", tags=["Relances"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(exports.router, prefix="/api/exports", tags=["Exports"])
app.include_router(calendar_events.router, prefix="/api/calendar", tags=["Calendrier"])


def _init_db():
    try:
        Base.metadata.create_all(bind=engine)
        seed.seed_database()
        print("DB init complete.")
    except Exception as e:
        print(f"DB init error (non-fatal): {e}")


@app.on_event("startup")
async def startup_event():
    # Run DB init in background thread — never blocks the event loop
    t = threading.Thread(target=_init_db, daemon=True)
    t.start()


@app.get("/")
def root():
    return {"message": "Escargot CRM API v1.0", "docs": "/docs"}
