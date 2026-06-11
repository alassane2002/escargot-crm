from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from models import Client, Vente, Relance, Formation
from schemas import DashboardStats
from auth import get_current_user
from datetime import date

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    first_of_month = today.replace(day=1)

    total_clients = db.query(Client).count()
    total_prospects = db.query(Client).filter(Client.statut == "Prospect").count()
    total_ventes = db.query(Vente).count()

    ca_total = db.query(func.sum(Vente.montant_total)).scalar() or 0
    ca_mois = db.query(func.sum(Vente.montant_total)).filter(
        func.date(Vente.date) >= first_of_month
    ).scalar() or 0

    relances_aujourd_hui = db.query(Relance).filter(
        Relance.date_relance == today, Relance.statut == "En attente"
    ).count()

    relances_en_retard = db.query(Relance).filter(
        Relance.date_relance < today, Relance.statut == "En attente"
    ).count()

    formations_a_venir = db.query(Formation).filter(Formation.date >= today).count()

    return DashboardStats(
        total_clients=total_clients,
        total_prospects=total_prospects,
        total_ventes=total_ventes,
        chiffre_affaires_total=float(ca_total),
        chiffre_affaires_mois=float(ca_mois),
        relances_du_jour=relances_aujourd_hui,
        formations_a_venir=formations_a_venir,
        relances_en_retard=relances_en_retard
    )


@router.get("/ventes-mensuelles")
def get_ventes_mensuelles(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    yr = extract('year', Vente.date)
    mo = extract('month', Vente.date)
    results = db.query(
        yr.label('annee'),
        mo.label('mois'),
        func.count(Vente.id).label('count'),
        func.sum(Vente.montant_total).label('total')
    ).group_by(yr, mo).order_by(yr, mo).all()

    months_fr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return [
        {"mois": months_fr[int(r.mois) - 1], "ventes": int(r.count), "revenus": float(r.total or 0)}
        for r in results
    ]


@router.get("/clients-par-statut")
def get_clients_par_statut(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    results = db.query(Client.statut, func.count(Client.id)).group_by(Client.statut).all()
    return [{"statut": r[0], "count": r[1]} for r in results]


@router.get("/nouveaux-clients")
def get_nouveaux_clients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    yr = extract('year', Client.date_ajout)
    mo = extract('month', Client.date_ajout)
    results = db.query(
        yr.label('annee'),
        mo.label('mois'),
        func.count(Client.id).label('count')
    ).group_by(yr, mo).order_by(yr, mo).all()

    months_fr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return [
        {"mois": months_fr[int(r.mois) - 1], "clients": int(r.count)}
        for r in results
    ]
