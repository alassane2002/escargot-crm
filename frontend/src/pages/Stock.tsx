import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Modal from '../components/Modal'
import {
  getStockEscargots, createStockEscargot, updateStockEscargot, deleteStockEscargot,
  getStockHannetons, createStockHanneton, updateStockHanneton, deleteStockHanneton
} from '../api'
import type { StockEscargot, StockHanneton } from '../types'

const emptyE = { date: '', reproducteurs: 0, juveniles: 0, naissances: 0, mortalite: 0, notes: '' }
const emptyH = { date: '', stock_actuel: 0, production: 0, mortalite: 0, notes: '' }

export default function Stock() {
  const [escargots, setEscargots] = useState<StockEscargot[]>([])
  const [hannetons, setHannetons] = useState<StockHanneton[]>([])
  const [activeTab, setActiveTab] = useState<'escargots' | 'hannetons'>('escargots')
  const [showModal, setShowModal] = useState(false)
  const [editingE, setEditingE] = useState<StockEscargot | null>(null)
  const [editingH, setEditingH] = useState<StockHanneton | null>(null)
  const [formE, setFormE] = useState({ ...emptyE })
  const [formH, setFormH] = useState({ ...emptyH })

  const loadE = () => getStockEscargots().then(r => setEscargots(r.data))
  const loadH = () => getStockHannetons().then(r => setHannetons(r.data))

  useEffect(() => { loadE(); loadH() }, [])

  const latestE = escargots[0]
  const latestH = hannetons[0]

  const chartDataE = [...escargots].reverse().slice(-6).map(s => ({
    date: s.date, reproducteurs: s.reproducteurs, juveniles: s.juveniles, naissances: s.naissances, mortalite: s.mortalite
  }))
  const chartDataH = [...hannetons].reverse().slice(-6).map(s => ({
    date: s.date, stock: s.stock_actuel, production: s.production, mortalite: s.mortalite
  }))

  const openAddE = () => { setEditingE(null); setFormE({ ...emptyE, date: new Date().toISOString().split('T')[0] }); setShowModal(true) }
  const openEditE = (s: StockEscargot) => {
    setEditingE(s)
    setFormE({ date: s.date, reproducteurs: s.reproducteurs, juveniles: s.juveniles, naissances: s.naissances, mortalite: s.mortalite, notes: s.notes || '' })
    setShowModal(true)
  }
  const openAddH = () => { setEditingH(null); setFormH({ ...emptyH, date: new Date().toISOString().split('T')[0] }); setShowModal(true) }
  const openEditH = (s: StockHanneton) => {
    setEditingH(s)
    setFormH({ date: s.date, stock_actuel: s.stock_actuel, production: s.production, mortalite: s.mortalite, notes: s.notes || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (activeTab === 'escargots') {
        if (editingE) await updateStockEscargot(editingE.id, formE)
        else await createStockEscargot(formE)
        setShowModal(false); loadE()
      } else {
        if (editingH) await updateStockHanneton(editingH.id, formH)
        else await createStockHanneton(formH)
        setShowModal(false); loadH()
      }
    } catch (e) { console.error(e) }
  }

  const handleDeleteE = async (id: number) => {
    if (!confirm('Supprimer ?')) return
    await deleteStockEscargot(id); loadE()
  }
  const handleDeleteH = async (id: number) => {
    if (!confirm('Supprimer ?')) return
    await deleteStockHanneton(id); loadH()
  }

  const FE = (k: string, v: string | number) => setFormE(f => ({ ...f, [k]: v }))
  const FH = (k: string, v: string | number) => setFormH(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Stock Élevage</h1>

      {/* Summary cards */}
      {latestE && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Reproducteurs', value: latestE.reproducteurs, color: 'text-green-700' },
            { label: 'Juvéniles', value: latestE.juveniles, color: 'text-blue-700' },
            { label: 'Naissances (dernier)', value: latestE.naissances, color: 'text-emerald-700' },
            { label: 'Mortalité (dernier)', value: latestE.mortalite, color: 'text-red-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Escargots - {label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value.toLocaleString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}

      {latestH && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Stock actuel', value: latestH.stock_actuel, color: 'text-amber-700' },
            { label: 'Production (dernier)', value: latestH.production, color: 'text-green-700' },
            { label: 'Mortalité (dernier)', value: latestH.mortalite, color: 'text-red-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Hannetons - {label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value.toLocaleString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['escargots', 'hannetons'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab === 'escargots' ? 'Escargots (Achatines)' : 'Hannetons'}
          </button>
        ))}
      </div>

      {activeTab === 'escargots' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Évolution du stock escargots</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartDataE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="reproducteurs" fill="#16a34a" name="Reproducteurs" />
                <Bar dataKey="juveniles" fill="#2563eb" name="Juvéniles" />
                <Bar dataKey="naissances" fill="#10b981" name="Naissances" />
                <Bar dataKey="mortalite" fill="#dc2626" name="Mortalité" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary" onClick={openAddE}><Plus size={16} /> Nouvelle entrée</button>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Reproducteurs</th>
                  <th className="table-header">Juvéniles</th>
                  <th className="table-header">Naissances</th>
                  <th className="table-header">Mortalité</th>
                  <th className="table-header hidden lg:table-cell">Notes</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {escargots.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{s.date}</td>
                    <td className="table-cell text-green-700">{s.reproducteurs}</td>
                    <td className="table-cell text-blue-700">{s.juveniles}</td>
                    <td className="table-cell text-emerald-700">{s.naissances}</td>
                    <td className="table-cell text-red-600">{s.mortalite}</td>
                    <td className="table-cell hidden lg:table-cell text-gray-400 truncate max-w-xs">{s.notes}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => openEditE(s)} className="p-1.5 hover:bg-amber-50 rounded text-amber-600"><Pencil size={13} /></button>
                        <button onClick={() => handleDeleteE(s.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'hannetons' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Évolution du stock hannetons</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartDataH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#d97706" name="Stock" />
                <Bar dataKey="production" fill="#16a34a" name="Production" />
                <Bar dataKey="mortalite" fill="#dc2626" name="Mortalité" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary" onClick={openAddH}><Plus size={16} /> Nouvelle entrée</button>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Stock actuel</th>
                  <th className="table-header">Production</th>
                  <th className="table-header">Mortalité</th>
                  <th className="table-header hidden lg:table-cell">Notes</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hannetons.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{s.date}</td>
                    <td className="table-cell text-amber-700">{s.stock_actuel}</td>
                    <td className="table-cell text-green-700">{s.production}</td>
                    <td className="table-cell text-red-600">{s.mortalite}</td>
                    <td className="table-cell hidden lg:table-cell text-gray-400 truncate max-w-xs">{s.notes}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => openEditH(s)} className="p-1.5 hover:bg-amber-50 rounded text-amber-600"><Pencil size={13} /></button>
                        <button onClick={() => handleDeleteH(s.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          title={activeTab === 'escargots' ? (editingE ? 'Modifier entrée escargots' : 'Nouvelle entrée escargots') : (editingH ? 'Modifier entrée hannetons' : 'Nouvelle entrée hannetons')}
          onClose={() => setShowModal(false)} onSubmit={handleSave}
        >
          {activeTab === 'escargots' ? (
            <div className="space-y-3">
              <div><label className="label">Date *</label><input type="date" className="input" value={formE.date} onChange={e => FE('date', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Reproducteurs</label><input type="number" min={0} className="input" value={formE.reproducteurs} onChange={e => FE('reproducteurs', parseInt(e.target.value))} /></div>
                <div><label className="label">Juvéniles</label><input type="number" min={0} className="input" value={formE.juveniles} onChange={e => FE('juveniles', parseInt(e.target.value))} /></div>
                <div><label className="label">Naissances</label><input type="number" min={0} className="input" value={formE.naissances} onChange={e => FE('naissances', parseInt(e.target.value))} /></div>
                <div><label className="label">Mortalité</label><input type="number" min={0} className="input" value={formE.mortalite} onChange={e => FE('mortalite', parseInt(e.target.value))} /></div>
              </div>
              <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={formE.notes} onChange={e => FE('notes', e.target.value)} /></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div><label className="label">Date *</label><input type="date" className="input" value={formH.date} onChange={e => FH('date', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Stock actuel</label><input type="number" min={0} className="input" value={formH.stock_actuel} onChange={e => FH('stock_actuel', parseInt(e.target.value))} /></div>
                <div><label className="label">Production</label><input type="number" min={0} className="input" value={formH.production} onChange={e => FH('production', parseInt(e.target.value))} /></div>
                <div className="col-span-2"><label className="label">Mortalité</label><input type="number" min={0} className="input" value={formH.mortalite} onChange={e => FH('mortalite', parseInt(e.target.value))} /></div>
              </div>
              <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={formH.notes} onChange={e => FH('notes', e.target.value)} /></div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
