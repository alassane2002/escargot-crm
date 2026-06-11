from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Vente, Paiement
from schemas import VenteCreate, VenteUpdate, VenteResponse, PaiementCreate, PaiementResponse
from auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[VenteResponse])
def get_ventes(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Vente).order_by(Vente.date.desc()).all()


@router.post("/", response_model=VenteResponse)
def create_vente(vente: VenteCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    montant_total = vente.quantite * vente.prix_unitaire
    montant_paye = vente.montant_paye or 0
    data = vente.model_dump()
    db_vente = Vente(
        **data,
        montant_total=montant_total,
        reste_a_payer=montant_total - montant_paye
    )
    db.add(db_vente)
    db.commit()
    db.refresh(db_vente)
    return db_vente


@router.get("/{vente_id}", response_model=VenteResponse)
def get_vente(vente_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vente = db.query(Vente).filter(Vente.id == vente_id).first()
    if not vente:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    return vente


@router.put("/{vente_id}", response_model=VenteResponse)
def update_vente(vente_id: int, vente_update: VenteUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vente = db.query(Vente).filter(Vente.id == vente_id).first()
    if not vente:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    for key, value in vente_update.model_dump(exclude_none=True).items():
        setattr(vente, key, value)
    vente.montant_total = vente.quantite * vente.prix_unitaire
    vente.reste_a_payer = max(0, vente.montant_total - vente.montant_paye)
    db.commit()
    db.refresh(vente)
    return vente


@router.delete("/{vente_id}")
def delete_vente(vente_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vente = db.query(Vente).filter(Vente.id == vente_id).first()
    if not vente:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    db.delete(vente)
    db.commit()
    return {"message": "Vente supprimée"}


@router.get("/{vente_id}/paiements", response_model=List[PaiementResponse])
def get_paiements(vente_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Paiement).filter(Paiement.vente_id == vente_id).order_by(Paiement.date.desc()).all()


@router.post("/{vente_id}/paiements", response_model=PaiementResponse)
def add_paiement(vente_id: int, paiement: PaiementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vente = db.query(Vente).filter(Vente.id == vente_id).first()
    if not vente:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    db_paiement = Paiement(vente_id=vente_id, montant=paiement.montant, methode=paiement.methode, notes=paiement.notes)
    db.add(db_paiement)
    vente.montant_paye = (vente.montant_paye or 0) + paiement.montant
    vente.reste_a_payer = max(0, vente.montant_total - vente.montant_paye)
    db.commit()
    db.refresh(db_paiement)
    return db_paiement
