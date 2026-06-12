from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Client, Discussion, ClientPhoto
from schemas import ClientCreate, ClientUpdate, ClientResponse, DiscussionCreate, DiscussionResponse, ClientPhotoResponse, ClientPhotoCreate
from auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ClientResponse])
def get_clients(
    search: Optional[str] = None,
    statut: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Client)
    if search:
        term = f"%{search}%"
        query = query.filter(
            Client.nom.ilike(term) | Client.prenom.ilike(term) |
            Client.telephone.ilike(term) | Client.ville.ilike(term)
        )
    if statut:
        query = query.filter(Client.statut == statut)
    return query.order_by(Client.date_ajout.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client_update: ClientUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    for key, value in client_update.model_dump(exclude_none=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    db.delete(client)
    db.commit()
    return {"message": "Client supprimé"}


@router.get("/{client_id}/discussions", response_model=List[DiscussionResponse])
def get_discussions(client_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Discussion).filter(Discussion.client_id == client_id).order_by(Discussion.date.desc()).all()


@router.post("/{client_id}/discussions", response_model=DiscussionResponse)
def add_discussion(client_id: int, discussion: DiscussionCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not db.query(Client).filter(Client.id == client_id).first():
        raise HTTPException(status_code=404, detail="Client non trouvé")
    db_disc = Discussion(client_id=client_id, contenu=discussion.contenu)
    if discussion.date:
        db_disc.date = discussion.date
    db.add(db_disc)
    db.commit()
    db.refresh(db_disc)
    return db_disc


@router.delete("/{client_id}/discussions/{discussion_id}")
def delete_discussion(client_id: int, discussion_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    disc = db.query(Discussion).filter(Discussion.id == discussion_id, Discussion.client_id == client_id).first()
    if not disc:
        raise HTTPException(status_code=404, detail="Discussion non trouvée")
    db.delete(disc)
    db.commit()
    return {"message": "Discussion supprimée"}


@router.get("/{client_id}/photos", response_model=List[ClientPhotoResponse])
def get_photos(client_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(ClientPhoto).filter(ClientPhoto.client_id == client_id).order_by(ClientPhoto.date_ajout.desc()).all()


@router.post("/{client_id}/photos", response_model=ClientPhotoResponse)
def add_photo(client_id: int, payload: ClientPhotoCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not db.query(Client).filter(Client.id == client_id).first():
        raise HTTPException(status_code=404, detail="Client non trouvé")
    p = ClientPhoto(client_id=client_id, photo=payload.photo)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{client_id}/photos/{photo_id}")
def delete_photo(client_id: int, photo_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = db.query(ClientPhoto).filter(ClientPhoto.id == photo_id, ClientPhoto.client_id == client_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Photo non trouvée")
    db.delete(p)
    db.commit()
    return {"message": "Photo supprimée"}
