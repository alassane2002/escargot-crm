from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Evenement
from schemas import EvenementCreate, EvenementResponse
from auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[EvenementResponse])
def get_evenements(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Evenement).order_by(Evenement.date).all()


@router.post("/", response_model=EvenementResponse)
def create_evenement(evenement: EvenementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_evt = Evenement(**evenement.model_dump())
    db.add(db_evt)
    db.commit()
    db.refresh(db_evt)
    return db_evt


@router.put("/{evenement_id}", response_model=EvenementResponse)
def update_evenement(evenement_id: int, evenement: EvenementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_evt = db.query(Evenement).filter(Evenement.id == evenement_id).first()
    if not db_evt:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    for key, value in evenement.model_dump().items():
        setattr(db_evt, key, value)
    db.commit()
    db.refresh(db_evt)
    return db_evt


@router.delete("/{evenement_id}")
def delete_evenement(evenement_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_evt = db.query(Evenement).filter(Evenement.id == evenement_id).first()
    if not db_evt:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    db.delete(db_evt)
    db.commit()
    return {"message": "Événement supprimé"}
