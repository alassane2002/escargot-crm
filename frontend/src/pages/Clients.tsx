import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2, Filter, Smartphone, MessageCircle } from 'lucide-react'
import Modal from '../components/Modal'
import { getClients, createClient, updateClient, deleteClient } from '../api'
import type { Client } from '../types'

// Ouvre WhatsApp avec un numéro et un message optionnel
function openWhatsApp(phone: string, name: string) {
  const clean = phone.replace(/[\s\-().+]/g, '')
  const num = clean.startsWith('00') ? clean.slice(2) : clean.startsWith('0') ? '225' + clean.slice(1) : clean
  const msg = encodeURIComponent(`Bonjour ${name}, `)
  window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
}

// Importe des contacts depuis le téléphone via Contact Picker API
async function importPhoneContacts(): Promise<{ nom: string; prenom: string; telephone: string; whatsapp: string }[]> {
  if (!('contacts' in navigator)) {
    throw new Error('Contact Picker API non supportée sur ce navigateur.\nUtilisez Chrome sur Android ou Safari sur iOS.')
  }
  // @ts-expect-error - Contact Picker API non encore dans les types TypeScript
  const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true })
  return contacts.map((c: { name: string[]; tel: string[] }) => {
    const fullName = (c.name?.[0] || '').trim()
    const parts = fullName.split(' ')
    const tel = c.tel?.[0] || ''
    return {
      nom: parts[0] || '',
      prenom: parts.slice(1).join(' ') || '',
      telephone: tel,
      whatsapp: tel,
    }
  })
}

const STATUTS = ['Prospect', 'Intéressé', 'Client', 'Client fidèle', 'À relancer']
const SOURCES = ['WhatsApp', 'Facebook', 'Instagram', 'LinkedIn', 'Référence', 'Terrain', 'Autre']

const statutColor: Record<string, string> = {
  'Prospect': 'bg-blue-100 text-blue-700',
  'Intéressé': 'bg-yellow-100 text-yellow-700',
  'Client': 'bg-green-100 text-green-700',
  'Client fidèle': 'bg-emerald-100 text-emerald-700',
  'À relancer': 'bg-red-100 text-red-700',
}

const emptyForm = {
  nom: '', prenom: '', telephone: '', whatsapp: '', ville: '', commune: '',
  pays: "Côte d'Ivoire", profession: '', source: '', notes: '', statut: 'Prospect'
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [importMsg, setImportMsg] = useState('')
  const navigate = useNavigate()

  const load = (s?: string, st?: string) => {
    getClients({ search: s, statut: st || undefined }).then(r => setClients(r.data))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (val: string) => {
    setSearch(val)
    load(val, filterStatut)
  }

  const handleFilter = (val: string) => {
    setFilterStatut(val)
    load(search, val)
  }

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true) }
  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({
      nom: c.nom, prenom: c.prenom || '', telephone: c.telephone || '',
      whatsapp: c.whatsapp || '', ville: c.ville || '', commune: c.commune || '',
      pays: c.pays || "Côte d'Ivoire", profession: c.profession || '',
      source: c.source || '', notes: c.notes || '', statut: c.statut
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.nom.trim()) return
    try {
      if (editing) {
        await updateClient(editing.id, form)
      } else {
        await createClient(form)
      }
      setShowModal(false)
      load(search, filterStatut)
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce client ? Cette action supprimera aussi ses discussions, relances et ventes.')) return
    await deleteClient(id)
    load(search, filterStatut)
  }

  const handleImportContacts = async () => {
    setImportMsg('')
    try {
      const contacts = await importPhoneContacts()
      if (contacts.length === 0) { setImportMsg('Aucun contact sélectionné.'); return }
      let added = 0
      for (const c of contacts) {
        if (!c.nom) continue
        await createClient({ ...c, statut: 'Prospect', source: 'Contacts téléphone', pays: "Côte d'Ivoire" })
        added++
      }
      setImportMsg(`${added} contact(s) importé(s) avec succès !`)
      load(search, filterStatut)
    } catch (e: unknown) {
      setImportMsg((e as Error).message || 'Erreur lors de l\'importation.')
    }
  }

  const F = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} contact(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary text-sm" onClick={handleImportContacts} title="Importer depuis les contacts du téléphone">
            <Smartphone size={15} /> Importer contacts
          </button>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Nouveau client
          </button>
        </div>
      </div>

      {importMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${importMsg.includes('succès') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          {importMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher..." value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="input pl-9 pr-8 appearance-none" value={filterStatut} onChange={e => handleFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-header">Nom</th>
              <th className="table-header hidden md:table-cell">Téléphone</th>
              <th className="table-header hidden lg:table-cell">Ville</th>
              <th className="table-header hidden lg:table-cell">Source</th>
              <th className="table-header">Statut</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{c.nom} {c.prenom}</div>
                  <div className="text-xs text-gray-400">{c.profession}</div>
                </td>
                <td className="table-cell hidden md:table-cell">{c.telephone}</td>
                <td className="table-cell hidden lg:table-cell">{[c.ville, c.commune].filter(Boolean).join(', ')}</td>
                <td className="table-cell hidden lg:table-cell">{c.source}</td>
                <td className="table-cell">
                  <span className={`badge ${statutColor[c.statut] || 'bg-gray-100 text-gray-600'}`}>{c.statut}</span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/clients/${c.id}`)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600" title="Voir détails">
                      <Eye size={15} />
                    </button>
                    {(c.whatsapp || c.telephone) && (
                      <button onClick={() => openWhatsApp(c.whatsapp || c.telephone || '', c.nom)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Envoyer WhatsApp">
                        <MessageCircle size={15} />
                      </button>
                    )}
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600" title="Modifier">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600" title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-400">Aucun client trouvé</div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Modifier le client' : 'Nouveau client'} onClose={() => setShowModal(false)} onSubmit={handleSave} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Nom *</label><input className="input" value={form.nom} onChange={e => F('nom', e.target.value)} /></div>
            <div><label className="label">Prénom</label><input className="input" value={form.prenom} onChange={e => F('prenom', e.target.value)} /></div>
            <div><label className="label">Téléphone</label><input className="input" value={form.telephone} onChange={e => F('telephone', e.target.value)} /></div>
            <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp} onChange={e => F('whatsapp', e.target.value)} /></div>
            <div><label className="label">Ville</label><input className="input" value={form.ville} onChange={e => F('ville', e.target.value)} /></div>
            <div><label className="label">Commune</label><input className="input" value={form.commune} onChange={e => F('commune', e.target.value)} /></div>
            <div><label className="label">Pays</label><input className="input" value={form.pays} onChange={e => F('pays', e.target.value)} /></div>
            <div><label className="label">Profession</label><input className="input" value={form.profession} onChange={e => F('profession', e.target.value)} /></div>
            <div>
              <label className="label">Source du contact</label>
              <select className="input" value={form.source} onChange={e => F('source', e.target.value)}>
                <option value="">Choisir...</option>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Statut</label>
              <select className="input" value={form.statut} onChange={e => F('statut', e.target.value)}>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => F('notes', e.target.value)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
