from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True)
    nom = Column(String, index=True)
    prenom = Column(String)
    telephone = Column(String)
    whatsapp = Column(String)
    ville = Column(String)
    commune = Column(String)
    pays = Column(String, default="Côte d'Ivoire")
    profession = Column(String)
    source = Column(String)
    date_ajout = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    statut = Column(String, default="Prospect")
    photo_ferme = Column(Text, nullable=True)

    discussions = relationship("Discussion", back_populates="client", cascade="all, delete-orphan")
    relances = relationship("Relance", back_populates="client", cascade="all, delete-orphan")
    ventes = relationship("Vente", back_populates="client", cascade="all, delete-orphan")


class Discussion(Base):
    __tablename__ = "discussions"
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    contenu = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    client = relationship("Client", back_populates="discussions")


class Relance(Base):
    __tablename__ = "relances"
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    date_relance = Column(Date)
    priorite = Column(String, default="Normale")
    motif = Column(Text)
    statut = Column(String, default="En attente")
    created_at = Column(DateTime, default=datetime.utcnow)
    client = relationship("Client", back_populates="relances")


class Vente(Base):
    __tablename__ = "ventes"
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    produit = Column(String)
    quantite = Column(Integer)
    prix_unitaire = Column(Float)
    montant_total = Column(Float)
    montant_paye = Column(Float, default=0)
    reste_a_payer = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    client = relationship("Client", back_populates="ventes")
    paiements = relationship("Paiement", back_populates="vente", cascade="all, delete-orphan")


class Paiement(Base):
    __tablename__ = "paiements"
    id = Column(Integer, primary_key=True)
    vente_id = Column(Integer, ForeignKey("ventes.id"))
    montant = Column(Float)
    methode = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    vente = relationship("Vente", back_populates="paiements")


class Formation(Base):
    __tablename__ = "formations"
    id = Column(Integer, primary_key=True)
    nom = Column(String)
    date = Column(Date)
    lieu = Column(String)
    prix = Column(Float)
    description = Column(Text)
    participants = relationship("FormationParticipant", back_populates="formation", cascade="all, delete-orphan")


class FormationParticipant(Base):
    __tablename__ = "formation_participants"
    id = Column(Integer, primary_key=True)
    formation_id = Column(Integer, ForeignKey("formations.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    presence = Column(Boolean, default=False)
    paiement_statut = Column(String, default="Non payé")
    montant_paye = Column(Float, default=0)
    formation = relationship("Formation", back_populates="participants")
    client = relationship("Client")


class StockEscargot(Base):
    __tablename__ = "stock_escargots"
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    reproducteurs = Column(Integer, default=0)
    juveniles = Column(Integer, default=0)
    naissances = Column(Integer, default=0)
    mortalite = Column(Integer, default=0)
    notes = Column(Text)


class StockHanneton(Base):
    __tablename__ = "stock_hannetons"
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    stock_actuel = Column(Integer, default=0)
    production = Column(Integer, default=0)
    mortalite = Column(Integer, default=0)
    notes = Column(Text)


class Evenement(Base):
    __tablename__ = "evenements"
    id = Column(Integer, primary_key=True)
    titre = Column(String)
    type = Column(String)
    date = Column(Date)
    heure = Column(String)
    description = Column(Text)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
