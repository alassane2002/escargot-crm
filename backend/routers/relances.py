from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Relance
from schemas import RelanceCreate, RelanceUpdate, RelanceResponse
from auth import get_current_user
from datetime import date

router = APIRouter()


@router.get("/", response_model=List[RelanceResponse])
def get_relances(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Relance).order_by(Relance.date_relance).all()


@router.get("/today", response_model=List[RelanceResponse])
def get_today_relances(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Relance).filter(Relance.date_relance == date.today(), Relance.statut == "En attente").all()


@router.get("/overdue", response_model=List[RelanceResponse])
def get_overdue_relances(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Relance).filter(Relance.date_relance < date.today(), Relance.statut == "En attente").all()


@router.post("/", response_model=RelanceResponse)
def create_relance(relance: RelanceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_relance = Relance(**relance.model_dump())
    db.add(db_relance)
    db.commit()
    db.refresh(db_relance)
    return db_relance


@router.put("/{relance_id}", response_model=RelanceResponse)
def update_relance(relance_id: int, relance_update: RelanceUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    relance = db.query(Relance).filter(Relance.id == relance_id).first()
    if not relance:
        raise HTTPException(status_code=404, detail="Relance non trouvée")
    for key, value in relance_update.model_dump(exclude_none=True).items():
        setattr(relance, key, value)
    db.commit()
    db.refresh(relance)
    return relance


@router.delete("/{relance_id}")
def delete_relance(relance_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    relance = db.query(Relance).filter(Relance.id == relance_id).first()
    if not relance:
        raise HTTPException(status_code=404, detail="Relance non trouvée")
    db.delete(relance)
    db.commit()
    return {"message": "Relance supprimée"}
