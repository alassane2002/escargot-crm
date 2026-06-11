import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import Modal from '../components/Modal'
import { getRelances, createRelance, updateRelance, deleteRelance, getClients } from '../api'
import type { Relance, Client } from '../types'

const PRIORITES = ['Haute', 'Normale', 'Basse']
const STATUTS = ['En attente', 'Fait', 'Annulé']

const priorityColor: Record<string, string> = {
  'Haute': 'bg-red-100 text-red-700',
  'Normale': 'bg-amber-100 text-amber-700',
  'Basse': 'bg-blue-100 text-blue-700',
}

const emptyForm = { client_id: 0, date_relance: '', priorite: 'Normale', motif: '', statut: 'En attente' }

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Relances() {
  const [relances, setRelances] = useState<Relance[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Relance | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  const today = new Date().toISOString().split('T')[0]

  const load = () => getRelances().then(r => setRelances(r.data))

  useEffect(() => {
    load()
    getClients().then(r => setClients(r.data))
  }, [])

  const overdue = relances.filter(r => r.date_relance < today && r.statut === 'En attente')
  const todayList = relances.filter(r => r.date_relance === today && r.statut === 'En attente')
  const upcoming = relances.filter(r => r.date_relance > today && r.statut === 'En attente')
  const done = relances.filter(r => r.statut !== 'En attente')

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true) }
  const openEdit = (r: Relance) => {
    setEditing(r)
    setForm({ client_id: r.client_id, date_relance: r.date_relance, priorite: r.priorite, motif: r.motif || '', statut: r.statut })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.client_id || !form.date_relance) return
    try {
      if (editing) await updateRelance(editing.id, form)
      else await createRelance(form)
      setShowModal(false)
      load()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette relance ?')) return
    await deleteRelance(id)
    load()
  }

  const markDone = async (r: Relance) => {
    await updateRelance(r.id, { statut: 'Fait' })
    load()
  }

  const F = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const RelanceRow = ({ r }: { r: Relance }) => {
    const clientName = r.client ? `${r.client.nom} ${r.client.prenom || ''}` : clients.find(c => c.id === r.client_id)?.nom || ''
    return (
      <div className={`flex items-start gap-3 p-3.5 rounded-lg border ${r.statut !== 'En attente' ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-200'}`}>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${r.priorite === 'Haute' ? 'bg-red-500' : r.priorite === 'Normale' ? 'bg-amber-500' : 'bg-blue-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{clientName}</span>
            <span className={`badge ${priorityColor[r.priorite] || ''}`}>{r.priorite}</span>
            <span className="text-xs text-gray-400">{fmtDate(r.date_relance)}</span>
          </div>
          {r.motif && <p className="text-sm text-gray-600 mt-0.5 truncate">{r.motif}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {r.statut === 'En attente' && (
            <button onClick={() => markDone(r)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Marquer comme fait">
              <CheckCircle size={15} />
            </button>
          )}
          <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    )
  }

  const Section = ({ title, items, icon: Icon, iconClass }: { title: string; items: Relance[]; icon: React.ElementType; iconClass: string }) => (
    items.length > 0 ? (
      <div>
        <div className={`flex items-center gap-2 mb-3 ${iconClass}`}>
          <Icon size={16} />
          <h3 className="font-semibold text-sm">{title} ({items.length})</h3>
        </div>
        <div className="space-y-2">
          {items.map(r => <RelanceRow key={r.id} r={r} />)}
        </div>
      </div>
    ) : null
  )

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relances</h1>
          <p className="text-sm text-gray-500 mt-0.5">{relances.filter(r => r.statut === 'En attente').length} en attente</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Nouvelle relance</button>
      </div>

      <div className="space-y-6">
        <Section title="En retard" items={overdue} icon={AlertTriangle} iconClass="text-red-600" />
        <Section title="Aujourd'hui" items={todayList} icon={Clock} iconClass="text-amber-600" />
        <Section title="À venir" items={upcoming} icon={Clock} iconClass="text-blue-600" />
        <Section title="Traitées" items={done} icon={CheckCircle} iconClass="text-gray-500" />
        {relances.length === 0 && <p className="text-center text-gray-400 py-12">Aucune relance enregistrée</p>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Modifier la relance' : 'Nouvelle relance'} onClose={() => setShowModal(false)} onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="label">Client *</label>
              <select className="input" value={form.client_id} onChange={e => F('client_id', parseInt(e.target.value))}>
                <option value={0}>Choisir un client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date de relance *</label>
              <input type="date" className="input" value={form.date_relance} onChange={e => F('date_relance', e.target.value)} />
            </div>
            <div>
              <label className="label">Priorité</label>
              <select className="input" value={form.priorite} onChange={e => F('priorite', e.target.value)}>
                {PRIORITES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Motif</label>
              <textarea className="input resize-none" rows={3} value={form.motif} onChange={e => F('motif', e.target.value)} />
            </div>
            <div>
              <label className="label">Statut</label>
              <select className="input" value={form.statut} onChange={e => F('statut', e.target.value)}>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
