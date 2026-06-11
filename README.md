# Escargot CRM

Plateforme de gestion pour l'activité d'élevage d'escargots, d'hannetons, de formations et de clients.

## Identifiants par défaut

- **Utilisateur** : `admin`
- **Mot de passe** : `admin123`

## Prérequis

- Python 3.10+
- Node.js 18+
- npm

## Installation & Lancement

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

La base de données SQLite est créée et peuplée automatiquement au premier démarrage.

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## URLs d'accès

| Service     | URL                          |
|-------------|------------------------------|
| Application | http://localhost:5173        |
| API Backend | http://localhost:8000        |
| Swagger UI  | http://localhost:8000/docs   |

## Fonctionnalités

- **Authentification** : Connexion sécurisée JWT, changement de mot de passe
- **Tableau de bord** : KPIs, graphiques ventes/clients/revenus
- **Clients** : CRUD complet, recherche, filtrage par statut
- **Discussions** : Historique chronologique par client
- **Relances** : Gestion avec priorités, alertes retards/aujourd'hui
- **Ventes** : Produits (Achatines, Hannetons, Formations), suivi paiements
- **Formations** : Gestion participants, présences, paiements
- **Stock Élevage** : Suivi escargots (reproducteurs/juvéniles) et hannetons
- **Calendrier** : Vue mensuelle et liste, gestion événements
- **Exports** : Excel pour Clients, Ventes, Formations, Stock

## Stack technique

- **Backend** : Python, FastAPI, SQLAlchemy, SQLite
- **Frontend** : React 18, TypeScript, Tailwind CSS, Recharts
- **Auth** : JWT (python-jose), bcrypt
