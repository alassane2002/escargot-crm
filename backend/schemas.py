from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ClientBase(BaseModel):
    nom: str
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    whatsapp: Optional[str] = None
    ville: Optional[str] = None
    commune: Optional[str] = None
    pays: Optional[str] = "Côte d'Ivoire"
    profession: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    statut: Optional[str] = "Prospect"
    photo_ferme: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    whatsapp: Optional[str] = None
    ville: Optional[str] = None
    commune: Optional[str] = None
    pays: Optional[str] = None
    profession: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    statut: Optional[str] = None
    photo_ferme: Optional[str] = None

class ClientPhotoResponse(BaseModel):
    id: int
    client_id: int
    photo: str
    date_ajout: datetime
    class Config:
        from_attributes = True

class ClientResponse(ClientBase):
    id: int
    date_ajout: datetime
    class Config:
        from_attributes = True


class DiscussionCreate(BaseModel):
    contenu: str
    date: Optional[datetime] = None

class DiscussionResponse(BaseModel):
    id: int
    client_id: int
    contenu: str
    date: datetime
    class Config:
        from_attributes = True


class RelanceBase(BaseModel):
    client_id: int
    date_relance: date
    priorite: Optional[str] = "Normale"
    motif: Optional[str] = None
    statut: Optional[str] = "En attente"

class RelanceCreate(RelanceBase):
    pass

class RelanceUpdate(BaseModel):
    date_relance: Optional[date] = None
    priorite: Optional[str] = None
    motif: Optional[str] = None
    statut: Optional[str] = None

class RelanceResponse(RelanceBase):
    id: int
    created_at: datetime
    client: Optional[ClientResponse] = None
    class Config:
        from_attributes = True


class VenteBase(BaseModel):
    client_id: int
    produit: str
    quantite: int
    prix_unitaire: float
    montant_paye: Optional[float] = 0
    date: Optional[datetime] = None
    notes: Optional[str] = None

class VenteCreate(VenteBase):
    pass

class VenteUpdate(BaseModel):
    produit: Optional[str] = None
    quantite: Optional[int] = None
    prix_unitaire: Optional[float] = None
    montant_paye: Optional[float] = None
    notes: Optional[str] = None

class VenteResponse(VenteBase):
    id: int
    montant_total: float
    reste_a_payer: float
    client: Optional[ClientResponse] = None
    class Config:
        from_attributes = True


class PaiementCreate(BaseModel):
    vente_id: int
    montant: float
    methode: str
    notes: Optional[str] = None

class PaiementResponse(PaiementCreate):
    id: int
    date: datetime
    class Config:
        from_attributes = True


class FormationBase(BaseModel):
    nom: str
    date: date
    lieu: Optional[str] = None
    prix: Optional[float] = 0
    description: Optional[str] = None

class FormationCreate(FormationBase):
    pass

class FormationUpdate(BaseModel):
    nom: Optional[str] = None
    date: Optional[date] = None
    lieu: Optional[str] = None
    prix: Optional[float] = None
    description: Optional[str] = None

class FormationParticipantCreate(BaseModel):
    formation_id: int
    client_id: int
    presence: Optional[bool] = False
    paiement_statut: Optional[str] = "Non payé"
    montant_paye: Optional[float] = 0

class FormationParticipantResponse(FormationParticipantCreate):
    id: int
    client: Optional[ClientResponse] = None
    class Config:
        from_attributes = True

class FormationResponse(FormationBase):
    id: int
    participants: List[FormationParticipantResponse] = []
    class Config:
        from_attributes = True


class StockEscargotCreate(BaseModel):
    date: date
    reproducteurs: int = 0
    juveniles: int = 0
    naissances: int = 0
    mortalite: int = 0
    notes: Optional[str] = None

class StockEscargotResponse(StockEscargotCreate):
    id: int
    class Config:
        from_attributes = True


class StockHannetonCreate(BaseModel):
    date: date
    stock_actuel: int = 0
    production: int = 0
    mortalite: int = 0
    notes: Optional[str] = None

class StockHannetonResponse(StockHannetonCreate):
    id: int
    class Config:
        from_attributes = True


class EvenementCreate(BaseModel):
    titre: str
    type: str
    date: date
    heure: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[int] = None

class EvenementResponse(EvenementCreate):
    id: int
    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_clients: int
    total_prospects: int
    total_ventes: int
    chiffre_affaires_total: float
    chiffre_affaires_mois: float
    relances_du_jour: int
    formations_a_venir: int
    relances_en_retard: int
