from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Formation, FormationParticipant
from schemas import (FormationCreate, FormationUpdate, FormationResponse,
                     FormationParticipantCreate, FormationParticipantResponse)
from auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[FormationResponse])
def get_formations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Formation).order_by(Formation.date.desc()).all()


@router.post("/", response_model=FormationResponse)
def create_formation(formation: FormationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_formation = Formation(**formation.model_dump())
    db.add(db_formation)
    db.commit()
    db.refresh(db_formation)
    return db_formation


@router.get("/{formation_id}", response_model=FormationResponse)
def get_formation(formation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    formation = db.query(Formation).filter(Formation.id == formation_id).first()
    if not formation:
        raise HTTPException(status_code=404, detail="Formation non trouvée")
    return formation


@router.put("/{formation_id}", response_model=FormationResponse)
def update_formation(formation_id: int, formation_update: FormationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    formation = db.query(Formation).filter(Formation.id == formation_id).first()
    if not formation:
        raise HTTPException(status_code=404, detail="Formation non trouvée")
    for key, value in formation_update.model_dump(exclude_none=True).items():
        setattr(formation, key, value)
    db.commit()
    db.refresh(formation)
    return formation


@router.delete("/{formation_id}")
def delete_formation(formation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    formation = db.query(Formation).filter(Formation.id == formation_id).first()
    if not formation:
        raise HTTPException(status_code=404, detail="Formation non trouvée")
    db.delete(formation)
    db.commit()
    return {"message": "Formation supprimée"}


@router.post("/{formation_id}/participants", response_model=FormationParticipantResponse)
def add_participant(formation_id: int, participant: FormationParticipantCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    existing = db.query(FormationParticipant).filter(
        FormationParticipant.formation_id == formation_id,
        FormationParticipant.client_id == participant.client_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce client est déjà inscrit")
    db_p = FormationParticipant(**participant.model_dump())
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p


@router.put("/{formation_id}/participants/{participant_id}", response_model=FormationParticipantResponse)
def update_participant(formation_id: int, participant_id: int, participant: FormationParticipantCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_p = db.query(FormationParticipant).filter(FormationParticipant.id == participant_id).first()
    if not db_p:
        raise HTTPException(status_code=404, detail="Participant non trouvé")
    for key, value in participant.model_dump(exclude_none=True).items():
        setattr(db_p, key, value)
    db.commit()
    db.refresh(db_p)
    return db_p


@router.delete("/{formation_id}/participants/{participant_id}")
def remove_participant(formation_id: int, participant_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_p = db.query(FormationParticipant).filter(FormationParticipant.id == participant_id).first()
    if not db_p:
        raise HTTPException(status_code=404, detail="Participant non trouvé")
    db.delete(db_p)
    db.commit()
    return {"message": "Participant retiré"}
