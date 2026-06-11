import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, ChevronDown, ChevronUp, UserPlus } from 'lucide-react'
import Modal from '../components/Modal'
import { getFormations, createFormation, updateFormation, deleteFormation, addParticipant, updateParticipant, removeParticipant, getClients } from '../api'
import type { Formation, Client } from '../types'

function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA' }

const emptyForm = { nom: '', date: '', lieu: '', prix: 0, description: '' }
const emptyPart = { formation_id: 0, client_id: 0, presence: false, paiement_statut: 'Non payé', montant_paye: 0 }

export default function Formations() {
  const [formations, setFormations] = useState<Formation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showPartModal, setShowPartModal] = useState(false)
  const [editing, setEditing] = useState<Formation | null>(null)
  const [currentFormation, setCurrentFormation] = useState<Formation | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [partForm, setPartForm] = useState({ ...emptyPart })
  const [expanded, setExpanded] = useState<number[]>([])

  const load = () => getFormations().then(r => setFormations(r.data))

  useEffect(() => {
    load()
    getClients().then(r => setClients(r.data))
  }, [])

  const toggle = (id: number) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true) }
  const openEdit = (f: Formation) => {
    setEditing(f)
    setForm({ nom: f.nom, date: f.date, lieu: f.lieu || '', prix: f.prix || 0, description: f.description || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.nom || !form.date) return
    try {
      if (editing) await updateFormation(editing.id, form)
      else await createFormation(form)
      setShowModal(false)
      load()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette formation ?')) return
    await deleteFormation(id)
    load()
  }

  const openAddPart = (f: Formation) => {
    setCurrentFormation(f)
    setPartForm({ ...emptyPart, formation_id: f.id })
    setShowPartModal(true)
  }

  const handleAddPart = async () => {
    if (!currentFormation || !partForm.client_id) return
    try {
      await addParticipant(currentFormation.id, { ...partForm, formation_id: currentFormation.id })
      setShowPartModal(false)
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      if (msg) alert(msg)
    }
  }

  const togglePresence = async (f: Formation, pId: number, current: boolean, rest: object) => {
    await updateParticipant(f.id, pId, { ...rest, presence: !current })
    load()
  }

  const handleRemovePart = async (f: Formation, pId: number) => {
    if (!confirm('Retirer ce participant ?')) return
    await removeParticipant(f.id, pId)
    load()
  }

  const F = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))
  const FP = (k: string, v: string | number | boolean) => setPartForm(f => ({ ...f, [k]: v }))

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formations</h1>
          <p className="text-sm text-gray-500">{formations.length} formation(s)</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Nouvelle formation</button>
      </div>

      <div className="space-y-4">
        {formations.map(f => {
          const isExpanded = expanded.includes(f.id)
          const isPast = f.date < today
          const totalPaye = f.participants.reduce((s, p) => s + p.montant_paye, 0)
          const nbPresents = f.participants.filter(p => p.presence).length

          return (
            <div key={f.id} className="card p-0 overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 cursor-pointer" onClick={() => toggle(f.id)}>
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{f.nom}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5 flex-wrap">
                        <span>{new Date(f.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        {f.lieu && <span>• {f.lieu}</span>}
                        {f.prix ? <span>• {fmt(f.prix)}</span> : null}
                        <span className={`badge ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                          {isPast ? 'Passée' : 'À venir'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span><Users size={12} className="inline mr-1" />{f.participants.length} inscrit(s)</span>
                        {isPast && <span>{nbPresents} présent(s)</span>}
                        <span className="text-green-600 font-medium">{fmt(totalPaye)} encaissé</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openAddPart(f)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600" title="Ajouter participant">
                    <UserPlus size={15} />
                  </button>
                  <button onClick={() => openEdit(f)} className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => toggle(f.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {f.participants.length === 0 ? (
                    <p className="text-center text-gray-400 py-6 text-sm">Aucun participant inscrit</p>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="table-header">Participant</th>
                          <th className="table-header">Présence</th>
                          <th className="table-header">Paiement</th>
                          <th className="table-header">Montant payé</th>
                          <th className="table-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {f.participants.map(p => {
                          const client = p.client
                          return (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="table-cell font-medium">{client ? `${client.nom} ${client.prenom || ''}` : `Client #${p.client_id}`}</td>
                              <td className="table-cell">
                                <button onClick={() => togglePresence(f, p.id, p.presence, { formation_id: p.formation_id, client_id: p.client_id, paiement_statut: p.paiement_statut, montant_paye: p.montant_paye })}
                                  className={`badge cursor-pointer ${p.presence ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {p.presence ? 'Présent' : 'Absent'}
                                </button>
                              </td>
                              <td className="table-cell">
                                <span className={`badge ${p.paiement_statut === 'Payé' ? 'bg-green-100 text-green-700' : p.paiement_statut === 'Partiel' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                  {p.paiement_statut}
                                </span>
                              </td>
                              <td className="table-cell">{fmt(p.montant_paye)}</td>
                              <td className="table-cell">
                                <button onClick={() => handleRemovePart(f, p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {formations.length === 0 && <div className="text-center py-12 text-gray-400 card">Aucune formation enregistrée</div>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Modifier la formation' : 'Nouvelle formation'} onClose={() => setShowModal(false)} onSubmit={handleSave} size="lg">
          <div className="space-y-4">
            <div><label className="label">Nom de la formation *</label><input className="input" value={form.nom} onChange={e => F('nom', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={e => F('date', e.target.value)} /></div>
              <div><label className="label">Prix (FCFA)</label><input type="number" min={0} className="input" value={form.prix} onChange={e => F('prix', parseFloat(e.target.value))} /></div>
            </div>
            <div><label className="label">Lieu</label><input className="input" value={form.lieu} onChange={e => F('lieu', e.target.value)} /></div>
            <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => F('description', e.target.value)} /></div>
          </div>
        </Modal>
      )}

      {showPartModal && currentFormation && (
        <Modal title="Ajouter un participant" onClose={() => setShowPartModal(false)} onSubmit={handleAddPart}>
          <div className="space-y-4">
            <div>
              <label className="label">Client *</label>
              <select className="input" value={partForm.client_id} onChange={e => FP('client_id', parseInt(e.target.value))}>
                <option value={0}>Choisir un client...</option>
                {clients.filter(c => !currentFormation.participants.find(p => p.client_id === c.id)).map(c => (
                  <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Statut paiement</label>
              <select className="input" value={partForm.paiement_statut} onChange={e => FP('paiement_statut', e.target.value)}>
                {['Non payé', 'Partiel', 'Payé'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Montant payé (FCFA)</label>
              <input type="number" min={0} className="input" value={partForm.montant_paye} onChange={e => FP('montant_paye', parseFloat(e.target.value))} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
