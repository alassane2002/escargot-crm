import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, MessageSquare, ShoppingCart, Bell, MessageCircle, Phone, Camera, X } from 'lucide-react'
import Modal from '../components/Modal'
import { getClient, getDiscussions, addDiscussion, deleteDiscussion, getVentes, getRelances, getClientPhotos, addClientPhoto, deleteClientPhoto } from '../api'
import type { Client, ClientPhoto, Discussion, Vente, Relance } from '../types'

function openWhatsApp(phone: string, name: string) {
  const clean = phone.replace(/[\s\-().+]/g, '')
  const num = clean.startsWith('00') ? clean.slice(2) : clean.startsWith('0') ? '225' + clean.slice(1) : clean
  const msg = encodeURIComponent(`Bonjour ${name}, `)
  window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
}

const statutColor: Record<string, string> = {
  'Prospect': 'bg-blue-100 text-blue-700',
  'Intéressé': 'bg-yellow-100 text-yellow-700',
  'Client': 'bg-green-100 text-green-700',
  'Client fidèle': 'bg-emerald-100 text-emerald-700',
  'À relancer': 'bg-red-100 text-red-700',
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [ventes, setVentes] = useState<Vente[]>([])
  const [relances, setRelances] = useState<Relance[]>([])
  const [showDiscModal, setShowDiscModal] = useState(false)
  const [discText, setDiscText] = useState('')
  const [activeTab, setActiveTab] = useState<'discussions' | 'ventes' | 'relances'>('discussions')
  const [photos, setPhotos] = useState<ClientPhoto[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    const cid = parseInt(id)
    getClient(cid).then(r => setClient(r.data))
    getDiscussions(cid).then(r => setDiscussions(r.data))
    getVentes().then(r => setVentes(r.data.filter((v: Vente) => v.client_id === cid)))
    getRelances().then(r => setRelances(r.data.filter((rel: Relance) => rel.client_id === cid)))
    getClientPhotos(cid).then(r => setPhotos(r.data))
  }, [id])

  const handleAddDisc = async () => {
    if (!discText.trim() || !id) return
    await addDiscussion(parseInt(id), { contenu: discText })
    setDiscText('')
    setShowDiscModal(false)
    getDiscussions(parseInt(id)).then(r => setDiscussions(r.data))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !id) return
    setUploadingPhoto(true)
    for (const file of files) {
      await new Promise<void>(resolve => {
        const reader = new FileReader()
        reader.onload = async () => {
          const base64 = reader.result as string
          const res = await addClientPhoto(parseInt(id), base64)
          setPhotos(prev => [res.data, ...prev])
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }
    setUploadingPhoto(false)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const handleDeletePhoto = async (photoId: number) => {
    if (!id || !confirm('Supprimer cette photo ?')) return
    await deleteClientPhoto(parseInt(id), photoId)
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const handleDeleteDisc = async (discId: number) => {
    if (!id || !confirm('Supprimer cette note ?')) return
    await deleteDiscussion(parseInt(id), discId)
    getDiscussions(parseInt(id)).then(r => setDiscussions(r.data))
  }

  if (!client) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const tabs = [
    { key: 'discussions', label: 'Discussions', icon: MessageSquare, count: discussions.length },
    { key: 'ventes', label: 'Ventes', icon: ShoppingCart, count: ventes.length },
    { key: 'relances', label: 'Relances', icon: Bell, count: relances.length },
  ] as const

  return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft size={16} /> Retour aux clients
      </button>

      {/* Client info card */}
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">
              {client.nom[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{client.nom} {client.prenom}</h1>
              <p className="text-gray-500 text-sm">{client.profession}</p>
              <span className={`badge ${statutColor[client.statut] || 'bg-gray-100 text-gray-600'} mt-1`}>{client.statut}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right text-sm text-gray-500">
              <div>Ajouté le {fmtDate(client.date_ajout)}</div>
              {client.source && <div>Source: {client.source}</div>}
            </div>
            <div className="flex gap-2">
              {client.telephone && (
                <a href={`tel:${client.telephone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
                  <Phone size={14} /> Appeler
                </a>
              )}
              {(client.whatsapp || client.telephone) && (
                <button onClick={() => openWhatsApp(client.whatsapp || client.telephone || '', client.nom)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100">
                  <MessageCircle size={14} /> WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {client.telephone && <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Téléphone</p><p className="text-sm text-gray-700 mt-0.5">{client.telephone}</p></div>}
          {client.whatsapp && <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">WhatsApp</p><p className="text-sm text-gray-700 mt-0.5">{client.whatsapp}</p></div>}
          {client.ville && <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Localisation</p><p className="text-sm text-gray-700 mt-0.5">{[client.ville, client.commune].filter(Boolean).join(', ')}</p></div>}
          {client.pays && <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pays</p><p className="text-sm text-gray-700 mt-0.5">{client.pays}</p></div>}
        </div>
        {client.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700">{client.notes}</p>
          </div>
        )}

        {/* Photos de la ferme */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Photos de la ferme {photos.length > 0 && <span className="ml-1 bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">{photos.length}</span>}
            </p>
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50"
            >
              <Camera size={13} />
              {uploadingPhoto ? 'Envoi...' : 'Ajouter des photos'}
            </button>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          {photos.length === 0 ? (
            <div
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center justify-center h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm cursor-pointer hover:border-green-300 hover:text-green-500 transition-colors"
            >
              <div className="text-center">
                <Camera size={24} className="mx-auto mb-1 opacity-50" />
                <span>Cliquez pour ajouter des photos</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map(p => (
                <div key={p.id} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square">
                  <img
                    src={p.photo}
                    alt="Ferme"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setViewPhoto(p.photo)}
                  />
                  <button
                    onClick={() => handleDeletePhoto(p.id)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <div
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center justify-center aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 cursor-pointer hover:border-green-300 hover:text-green-500 transition-colors"
              >
                <Plus size={24} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="flex border-b border-gray-100">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Discussions tab */}
          {activeTab === 'discussions' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button className="btn-primary text-sm" onClick={() => setShowDiscModal(true)}>
                  <Plus size={15} /> Ajouter une note
                </button>
              </div>
              {discussions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucune discussion enregistrée</p>
              ) : (
                discussions.map(d => (
                  <div key={d.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <div className="w-0.5 flex-1 bg-gray-100 mt-1" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-medium text-gray-400">{fmtDate(d.date)}</span>
                        <button onClick={() => handleDeleteDisc(d.id)} className="p-1 hover:bg-red-50 rounded text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 bg-gray-50 rounded-lg p-3">{d.contenu}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Ventes tab */}
          {activeTab === 'ventes' && (
            <div>
              {ventes.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucune vente enregistrée</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100">
                    <th className="table-header">Produit</th>
                    <th className="table-header">Qté</th>
                    <th className="table-header">Total</th>
                    <th className="table-header">Payé</th>
                    <th className="table-header">Reste</th>
                    <th className="table-header">Date</th>
                  </tr></thead>
                  <tbody>
                    {ventes.map(v => (
                      <tr key={v.id} className="border-b border-gray-50">
                        <td className="table-cell font-medium">{v.produit}</td>
                        <td className="table-cell">{v.quantite}</td>
                        <td className="table-cell">{fmt(v.montant_total)}</td>
                        <td className="table-cell text-green-600">{fmt(v.montant_paye)}</td>
                        <td className={`table-cell font-medium ${v.reste_a_payer > 0 ? 'text-red-600' : 'text-gray-400'}`}>{fmt(v.reste_a_payer)}</td>
                        <td className="table-cell text-gray-400">{fmtDate(v.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Relances tab */}
          {activeTab === 'relances' && (
            <div>
              {relances.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucune relance enregistrée</p>
              ) : (
                <div className="space-y-3">
                  {relances.map(r => (
                    <div key={r.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${r.priorite === 'Haute' ? 'bg-red-500' : r.priorite === 'Normale' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{r.date_relance}</span>
                          <span className={`badge text-xs ${r.statut === 'En attente' ? 'bg-yellow-100 text-yellow-700' : r.statut === 'Fait' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.statut}</span>
                          <span className={`badge text-xs ${r.priorite === 'Haute' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{r.priorite}</span>
                        </div>
                        {r.motif && <p className="text-sm text-gray-600 mt-0.5">{r.motif}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDiscModal && (
        <Modal title="Nouvelle note de discussion" onClose={() => setShowDiscModal(false)} onSubmit={handleAddDisc}>
          <textarea
            className="input resize-none"
            rows={5}
            placeholder="Décrivez votre échange avec ce client..."
            value={discText}
            onChange={e => setDiscText(e.target.value)}
            autoFocus
          />
        </Modal>
      )}

      {viewPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewPhoto(null)}
        >
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full">
            <X size={24} />
          </button>
          <img src={viewPhoto} alt="Ferme" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}
