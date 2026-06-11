from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import StockEscargot, StockHanneton
from schemas import (StockEscargotCreate, StockEscargotResponse,
                     StockHannetonCreate, StockHannetonResponse)
from auth import get_current_user

router = APIRouter()


@router.get("/escargots", response_model=List[StockEscargotResponse])
def get_stock_escargots(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(StockEscargot).order_by(StockEscargot.date.desc()).all()


@router.post("/escargots", response_model=StockEscargotResponse)
def create_stock_escargot(stock: StockEscargotCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_stock = StockEscargot(**stock.model_dump())
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


@router.put("/escargots/{stock_id}", response_model=StockEscargotResponse)
def update_stock_escargot(stock_id: int, stock: StockEscargotCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_stock = db.query(StockEscargot).filter(StockEscargot.id == stock_id).first()
    if not db_stock:
        raise HTTPException(status_code=404, detail="Entrée non trouvée")
    for key, value in stock.model_dump().items():
        setattr(db_stock, key, value)
    db.commit()
    db.refresh(db_stock)
    return db_stock


@router.delete("/escargots/{stock_id}")
def delete_stock_escargot(stock_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_stock = db.query(StockEscargot).filter(StockEscargot.id == stock_id).first()
    if not db_stock:
        raise HTTPException(status_code=404, detail="Entrée non trouvée")
    db.delete(db_stock)
    db.commit()
    return {"message": "Entrée supprimée"}


@router.get("/hannetons", response_model=List[StockHannetonResponse])
def get_stock_hannetons(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(StockHanneton).order_by(StockHanneton.date.desc()).all()


@router.post("/hannetons", response_model=StockHannetonResponse)
def create_stock_hanneton(stock: StockHannetonCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_stock = StockHanneton(**stock.model_dump())
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


@router.put("/hannetons/{stock_id}", response_model=StockHannetonResponse)
def update_stock_hanneton(stock_id: int, stock: StockHannetonCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_stock = db.query(StockHanneton).filter(StockHanneton.id == stock_id).first()
    if not db_stock:
        raise HTTPException(status_code=404, detail="Entrée non trouvée")
    for key, value in stock.model_dump().items():
        setattr(db_stock, key, value)
    db.commit()
    db.refresh(db_stock)
    return db_stock


@router.delete("/hannetons/{stock_id}")
def delete_stock_hanneton(stock_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_stock = db.query(StockHanneton).filter(StockHanneton.id == stock_id).first()
    if not db_stock:
        raise HTTPException(status_code=404, detail="Entrée non trouvée")
    db.delete(db_stock)
    db.commit()
    return {"message": "Entrée supprimée"}
