import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react'
import Modal from '../components/Modal'
import { getVentes, createVente, updateVente, deleteVente, addPaiement, getPaiements, getClients } from '../api'
import type { Vente, Client, Paiement } from '../types'

const PRODUITS = ['Achatines', 'Hannetons', 'Formation Achatines', 'Formation Hannetons', 'Autre']
const METHODES = ['Orange Money', 'MTN Money', 'Moov Money', 'Wave', 'Espèces', 'Virement']

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR')
}

const emptyForm = { client_id: 0, produit: 'Achatines', quantite: 1, prix_unitaire: 0, montant_paye: 0, notes: '' }
const emptyPay = { vente_id: 0, montant: 0, methode: 'Orange Money', notes: '' }

export default function Sales() {
  const [ventes, setVentes] = useState<Vente[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [editing, setEditing] = useState<Vente | null>(null)
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [form, setForm] = useState({ ...emptyForm })
  const [payForm, setPayForm] = useState({ ...emptyPay })

  const load = () => getVentes().then(r => setVentes(r.data))

  useEffect(() => {
    load()
    getClients().then(r => setClients(r.data))
  }, [])

  const totalCA = ventes.reduce((s, v) => s + v.montant_total, 0)
  const totalPaye = ventes.reduce((s, v) => s + v.montant_paye, 0)
  const totalReste = ventes.reduce((s, v) => s + v.reste_a_payer, 0)

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true) }
  const openEdit = (v: Vente) => {
    setEditing(v)
    setForm({ client_id: v.client_id, produit: v.produit, quantite: v.quantite, prix_unitaire: v.prix_unitaire, montant_paye: v.montant_paye, notes: v.notes || '' })
    setShowModal(true)
  }
  const openPay = (v: Vente) => {
    setSelectedVente(v)
    setPayForm({ vente_id: v.id, montant: v.reste_a_payer, methode: 'Orange Money', notes: '' })
    getPaiements(v.id).then(r => setPaiements(r.data))
    setShowPayModal(true)
  }

  const handleSave = async () => {
    if (!form.client_id || !form.produit) return
    try {
      if (editing) await updateVente(editing.id, form)
      else await createVente(form)
      setShowModal(false)
      load()
    } catch (e) { console.error(e) }
  }

  const handlePay = async () => {
    if (!selectedVente || payForm.montant <= 0) return
    await addPaiement(selectedVente.id, payForm)
    setShowPayModal(false)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette vente ?')) return
    await deleteVente(id)
    load()
  }

  const F = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))
  const FP = (k: string, v: string | number) => setPayForm(f => ({ ...f, [k]: v }))
  const preview = form.quantite * form.prix_unitaire

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ventes.length} vente(s)</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Nouvelle vente</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Chiffre d'affaires</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{fmt(totalCA)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total encaissé</p>
          <p className="text-xl font-bold text-green-600 mt-1">{fmt(totalPaye)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Reste à percevoir</p>
          <p className="text-xl font-bold text-red-600 mt-1">{fmt(totalReste)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-header">Client</th>
              <th className="table-header">Produit</th>
              <th className="table-header hidden md:table-cell">Qté</th>
              <th className="table-header">Montant</th>
              <th className="table-header hidden md:table-cell">Payé</th>
              <th className="table-header">Reste</th>
              <th className="table-header hidden lg:table-cell">Date</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ventes.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{v.client ? `${v.client.nom} ${v.client.prenom || ''}` : ''}</td>
                <td className="table-cell">{v.produit}</td>
                <td className="table-cell hidden md:table-cell">{v.quantite}</td>
                <td className="table-cell">{fmt(v.montant_total)}</td>
                <td className="table-cell hidden md:table-cell text-green-600">{fmt(v.montant_paye)}</td>
                <td className={`table-cell font-semibold ${v.reste_a_payer > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {v.reste_a_payer > 0 ? fmt(v.reste_a_payer) : '✓ Soldé'}
                </td>
                <td className="table-cell hidden lg:table-cell text-gray-400">{fmtDate(v.date)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    {v.reste_a_payer > 0 && (
                      <button onClick={() => openPay(v)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Enregistrer paiement">
                        <CreditCard size={15} />
                      </button>
                    )}
                    <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ventes.length === 0 && <div className="text-center py-12 text-gray-400">Aucune vente enregistrée</div>}
      </div>

      {/* Vente modal */}
      {showModal && (
        <Modal title={editing ? 'Modifier la vente' : 'Nouvelle vente'} onClose={() => setShowModal(false)} onSubmit={handleSave} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Client *</label>
              <select className="input" value={form.client_id} onChange={e => F('client_id', parseInt(e.target.value))}>
                <option value={0}>Choisir un client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Produit *</label>
              <select className="input" value={form.produit} onChange={e => F('produit', e.target.value)}>
                {PRODUITS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantité</label>
              <input type="number" min={1} className="input" value={form.quantite} onChange={e => F('quantite', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="label">Prix unitaire (FCFA)</label>
              <input type="number" min={0} className="input" value={form.prix_unitaire} onChange={e => F('prix_unitaire', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="label">Montant payé (FCFA)</label>
              <input type="number" min={0} className="input" value={form.montant_paye} onChange={e => F('montant_paye', parseFloat(e.target.value))} />
            </div>
            <div className="col-span-2 bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <strong>Montant total :</strong> {fmt(preview)} |
                <strong> Reste :</strong> {fmt(Math.max(0, preview - form.montant_paye))}
              </p>
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => F('notes', e.target.value)} />
            </div>
          </div>
        </Modal>
      )}

      {/* Payment modal */}
      {showPayModal && selectedVente && (
        <Modal title="Enregistrer un paiement" onClose={() => setShowPayModal(false)} onSubmit={handlePay} size="md">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p><strong>{selectedVente.client?.nom}</strong> — {selectedVente.produit}</p>
              <p className="text-gray-500">Reste à payer : <span className="font-semibold text-red-600">{fmt(selectedVente.reste_a_payer)}</span></p>
            </div>
            <div>
              <label className="label">Montant (FCFA) *</label>
              <input type="number" min={0} className="input" value={payForm.montant} onChange={e => FP('montant', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="label">Méthode de paiement</label>
              <select className="input" value={payForm.methode} onChange={e => FP('methode', e.target.value)}>
                {METHODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" value={payForm.notes} onChange={e => FP('notes', e.target.value)} />
            </div>
            {paiements.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Historique des paiements</p>
                {paiements.map(p => (
                  <div key={p.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                    <span>{fmtDate(p.date)} — {p.methode}</span>
                    <span className="font-medium text-green-600">{fmt(p.montant)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
