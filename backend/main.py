import os
import logging
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

logger.info(f"Python version: {sys.version}")
logger.info(f"Starting Escargot CRM...")

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


@app.on_event("startup")
async def startup_event():
    logger.info("Startup event running...")
    try:
        from database import engine
        from models import Base
        Base.metadata.create_all(bind=engine)
        logger.info("DB tables OK")
    except Exception as e:
        logger.error(f"DB init error: {e}")

    try:
        import seed
        seed.seed_database()
        logger.info("Seed OK")
    except Exception as e:
        logger.error(f"Seed error: {e}")

    try:
        from routers import clients, sales, formations, stock, relances, dashboard, exports, calendar_events
        import auth
        app.include_router(auth.router, prefix="/api/auth", tags=["Authentification"])
        app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
        app.include_router(sales.router, prefix="/api/ventes", tags=["Ventes"])
        app.include_router(formations.router, prefix="/api/formations", tags=["Formations"])
        app.include_router(stock.router, prefix="/api/stock", tags=["Stock"])
        app.include_router(relances.router, prefix="/api/relances", tags=["Relances"])
        app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
        app.include_router(exports.router, prefix="/api/exports", tags=["Exports"])
        app.include_router(calendar_events.router, prefix="/api/calendar", tags=["Calendrier"])
        logger.info("Routers registered OK")
    except Exception as e:
        logger.error(f"Router registration error: {e}")

    logger.info("Startup complete.")


@app.get("/")
def root():
    return {"message": "Escargot CRM API v1.0", "docs": "/docs"}
