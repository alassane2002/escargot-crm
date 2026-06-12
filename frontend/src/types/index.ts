export interface Client {
  id: number
  nom: string
  prenom?: string
  telephone?: string
  whatsapp?: string
  ville?: string
  commune?: string
  pays?: string
  profession?: string
  source?: string
  date_ajout: string
  notes?: string
  statut: string
  photo_ferme?: string
}

export interface Discussion {
  id: number
  client_id: number
  contenu: string
  date: string
}

export interface Relance {
  id: number
  client_id: number
  date_relance: string
  priorite: string
  motif?: string
  statut: string
  created_at: string
  client?: Client
}

export interface Vente {
  id: number
  client_id: number
  produit: string
  quantite: number
  prix_unitaire: number
  montant_total: number
  montant_paye: number
  reste_a_payer: number
  date: string
  notes?: string
  client?: Client
}

export interface Paiement {
  id: number
  vente_id: number
  montant: number
  methode: string
  date: string
  notes?: string
}

export interface Formation {
  id: number
  nom: string
  date: string
  lieu?: string
  prix?: number
  description?: string
  participants: FormationParticipant[]
}

export interface FormationParticipant {
  id: number
  formation_id: number
  client_id: number
  presence: boolean
  paiement_statut: string
  montant_paye: number
  client?: Client
}

export interface StockEscargot {
  id: number
  date: string
  reproducteurs: number
  juveniles: number
  naissances: number
  mortalite: number
  notes?: string
}

export interface StockHanneton {
  id: number
  date: string
  stock_actuel: number
  production: number
  mortalite: number
  notes?: string
}

export interface Evenement {
  id: number
  titre: string
  type: string
  date: string
  heure?: string
  description?: string
  client_id?: number
}

export interface DashboardStats {
  total_clients: number
  total_prospects: number
  total_ventes: number
  chiffre_affaires_total: number
  chiffre_affaires_mois: number
  relances_du_jour: number
  formations_a_venir: number
  relances_en_retard: number
}
