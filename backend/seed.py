from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import (Base, User, Client, Discussion, Relance, Vente,
                    Paiement, Formation, FormationParticipant,
                    StockEscargot, StockHanneton, Evenement)
from auth import hash_password
from datetime import date, datetime, timedelta
import random


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        admin = User(username="admin", password_hash=hash_password("admin123"))
        db.add(admin)
        db.commit()

        clients_data = [
            {"nom": "Koné", "prenom": "Amadou", "telephone": "+225 07 12 34 56", "whatsapp": "+225 07 12 34 56",
             "ville": "Abidjan", "commune": "Cocody", "profession": "Commerçant", "source": "WhatsApp", "statut": "Client"},
            {"nom": "Bamba", "prenom": "Fatoumata", "telephone": "+225 05 67 89 01", "whatsapp": "+225 05 67 89 01",
             "ville": "Abidjan", "commune": "Yopougon", "profession": "Restauratrice", "source": "Facebook", "statut": "Client fidèle"},
            {"nom": "Traoré", "prenom": "Ibrahim", "telephone": "+225 01 23 45 67",
             "ville": "Bouaké", "commune": "Bouaké", "profession": "Éleveur", "source": "Référence", "statut": "Prospect"},
            {"nom": "Ouattara", "prenom": "Mariam", "telephone": "+225 07 98 76 54", "whatsapp": "+225 07 98 76 54",
             "ville": "Abidjan", "commune": "Abobo", "profession": "Ménagère", "source": "WhatsApp", "statut": "Intéressé"},
            {"nom": "Diallo", "prenom": "Moussa", "telephone": "+225 05 11 22 33",
             "ville": "Daloa", "profession": "Agriculteur", "source": "Terrain", "statut": "À relancer"},
            {"nom": "Coulibaly", "prenom": "Aissatou", "telephone": "+225 07 44 55 66", "whatsapp": "+225 07 44 55 66",
             "ville": "Abidjan", "commune": "Marcory", "profession": "Hôtelière", "source": "Instagram", "statut": "Client"},
            {"nom": "Yao", "prenom": "Kouadio", "telephone": "+225 01 77 88 99",
             "ville": "San Pedro", "profession": "Chef cuisinier", "source": "Facebook", "statut": "Client"},
            {"nom": "Dembélé", "prenom": "Salimata", "telephone": "+225 05 33 44 55",
             "ville": "Abidjan", "commune": "Plateau", "profession": "Directrice", "source": "LinkedIn", "statut": "Prospect"},
            {"nom": "Soro", "prenom": "Lacina", "telephone": "+225 07 55 66 77",
             "ville": "Korhogo", "profession": "Éleveur", "source": "Terrain", "statut": "Intéressé"},
            {"nom": "Touré", "prenom": "Aminata", "telephone": "+225 05 88 99 00", "whatsapp": "+225 05 88 99 00",
             "ville": "Abidjan", "commune": "Treichville", "profession": "Commerçante", "source": "WhatsApp", "statut": "Client"},
        ]

        clients = []
        for i, data in enumerate(clients_data):
            client = Client(
                **data,
                pays="Côte d'Ivoire",
                date_ajout=datetime.utcnow() - timedelta(days=random.randint(10, 200))
            )
            db.add(client)
            clients.append(client)
        db.commit()

        disc_contents = [
            "Premier contact établi. Très intéressé par les achatines.",
            "Demande de devis pour 50 kg d'achatines.",
            "A confirmé sa commande. Livraison prévue la semaine prochaine.",
            "Paiement partiel reçu via Orange Money.",
            "Relance effectuée. Souhaite une formation.",
            "Commande livrée avec succès. Client satisfait.",
        ]
        for client in clients[:5]:
            for j, content in enumerate(random.sample(disc_contents, 3)):
                db.add(Discussion(
                    client_id=client.id,
                    contenu=content,
                    date=datetime.utcnow() - timedelta(days=j * 7 + random.randint(0, 5))
                ))
        db.commit()

        today = date.today()
        relances_data = [
            {"client_id": clients[2].id, "date_relance": today, "priorite": "Haute", "motif": "Relance formation escargot", "statut": "En attente"},
            {"client_id": clients[3].id, "date_relance": today - timedelta(days=2), "priorite": "Normale", "motif": "Suivi commande hannetons", "statut": "En attente"},
            {"client_id": clients[4].id, "date_relance": today + timedelta(days=3), "priorite": "Basse", "motif": "Proposition offre spéciale", "statut": "En attente"},
            {"client_id": clients[7].id, "date_relance": today - timedelta(days=1), "priorite": "Haute", "motif": "Confirmation inscription formation", "statut": "En attente"},
            {"client_id": clients[8].id, "date_relance": today + timedelta(days=7), "priorite": "Normale", "motif": "Envoi catalogue produits", "statut": "En attente"},
        ]
        for data in relances_data:
            db.add(Relance(**data))
        db.commit()

        produits = ["Achatines", "Hannetons", "Formation Achatines", "Achatines", "Hannetons", "Formation Hannetons"]
        for i, client in enumerate(clients[:6]):
            qty = random.randint(10, 100)
            prix = random.choice([2500, 3000, 5000, 50000])
            total = qty * prix
            paye_ratio = random.choice([0.5, 0.75, 1.0])
            paye = total * paye_ratio
            vente = Vente(
                client_id=client.id,
                produit=produits[i],
                quantite=qty,
                prix_unitaire=prix,
                montant_total=total,
                montant_paye=paye,
                reste_a_payer=total - paye,
                date=datetime.utcnow() - timedelta(days=random.randint(1, 60))
            )
            db.add(vente)
        db.commit()

        for month_offset in range(6):
            for _ in range(random.randint(3, 6)):
                client = random.choice(clients)
                qty = random.randint(5, 80)
                prix = random.choice([2500, 3000, 5000])
                total = qty * prix
                vente = Vente(
                    client_id=client.id,
                    produit=random.choice(["Achatines", "Hannetons"]),
                    quantite=qty,
                    prix_unitaire=prix,
                    montant_total=total,
                    montant_paye=total,
                    reste_a_payer=0,
                    date=datetime.utcnow() - timedelta(days=30 * month_offset + random.randint(1, 25))
                )
                db.add(vente)
        db.commit()

        formation1 = Formation(nom="Formation Élevage d'Achatines - Niveau 1", date=today + timedelta(days=15),
                               lieu="Abidjan, Cocody", prix=50000, description="Formation complète sur l'élevage des escargots géants africains.")
        formation2 = Formation(nom="Formation Élevage de Hannetons", date=today + timedelta(days=30),
                               lieu="Abidjan, Yopougon", prix=45000, description="Techniques d'élevage des hannetons pour la consommation.")
        formation3 = Formation(nom="Formation Achatines - Niveau 2", date=today - timedelta(days=20),
                               lieu="Bouaké", prix=60000, description="Formation avancée pour les éleveurs confirmés.")
        db.add_all([formation1, formation2, formation3])
        db.commit()

        for client in clients[:4]:
            db.add(FormationParticipant(
                formation_id=formation1.id, client_id=client.id,
                presence=random.choice([True, False]),
                paiement_statut=random.choice(["Payé", "Non payé", "Partiel"]),
                montant_paye=random.choice([0, 25000, 50000])
            ))
        for client in clients[3:7]:
            db.add(FormationParticipant(
                formation_id=formation2.id, client_id=client.id,
                presence=False, paiement_statut="Non payé", montant_paye=0
            ))
        for client in clients[5:9]:
            db.add(FormationParticipant(
                formation_id=formation3.id, client_id=client.id,
                presence=True, paiement_statut="Payé", montant_paye=60000
            ))
        db.commit()

        for i in range(6):
            db.add(StockEscargot(
                date=today - timedelta(days=i * 30),
                reproducteurs=random.randint(200, 600),
                juveniles=random.randint(500, 2500),
                naissances=random.randint(100, 600),
                mortalite=random.randint(5, 60),
                notes=f"Relevé mensuel - mois {i+1}"
            ))
            db.add(StockHanneton(
                date=today - timedelta(days=i * 30),
                stock_actuel=random.randint(1000, 6000),
                production=random.randint(200, 900),
                mortalite=random.randint(10, 120),
                notes=f"Relevé mensuel - mois {i+1}"
            ))
        db.commit()

        evenements = [
            {"titre": "Livraison achatines - Koné", "type": "Livraison", "date": today + timedelta(days=2),
             "heure": "09:00", "client_id": clients[0].id, "description": "50 kg d'achatines"},
            {"titre": "Formation Achatines Niveau 1", "type": "Formation", "date": today + timedelta(days=15),
             "heure": "08:00", "description": "20 participants attendus"},
            {"titre": "Relance Ibrahim Traoré", "type": "Relance", "date": today,
             "heure": "14:00", "client_id": clients[2].id},
            {"titre": "RDV Ouattara Mariam", "type": "Rendez-vous", "date": today + timedelta(days=5),
             "heure": "10:30", "client_id": clients[3].id, "description": "Présentation des produits"},
            {"titre": "Formation Hannetons", "type": "Formation", "date": today + timedelta(days=30),
             "heure": "08:00", "description": "15 participants inscrits"},
        ]
        for evt in evenements:
            db.add(Evenement(**evt))
        db.commit()

        print("[OK] Base de donnees initialisee avec les donnees de demonstration")
        print("   Login: admin / admin123")
    except Exception as e:
        print(f"[ERR] Erreur lors de l'initialisation: {e}")
        db.rollback()
        raise
    finally:
        db.close()
