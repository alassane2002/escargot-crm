import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Download } from 'lucide-react'
import Modal from '../components/Modal'
import { getEvenements, createEvenement, deleteEvenement, getClients } from '../api'
import type { Evenement, Client } from '../types'

// Génère un fichier ICS importable dans Google Calendar, iPhone Calendar, etc.
function exportToICS(evenements: Evenement[]) {
  const fmt = (d: string, h?: string) => {
    const [y, m, day] = d.split('-')
    if (h) {
      const [hh, mm] = h.split(':')
      return `${y}${m}${day}T${hh}${mm}00`
    }
    return `${y}${m}${day}`
  }
  const escape = (s: string) => s.replace(/[,;\\]/g, c => '\\' + c).replace(/\n/g, '\\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Escargot CRM//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const e of evenements) {
    const dtStart = e.heure ? fmt(e.date, e.heure) : fmt(e.date)
    const allDay = !e.heure
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:escargot-crm-${e.id}@local`)
    lines.push(`SUMMARY:${escape(e.titre)}`)
    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`)
      lines.push(`DTEND;VALUE=DATE:${dtStart}`)
    } else {
      lines.push(`DTSTART:${dtStart}`)
      lines.push(`DTEND:${dtStart}`)
    }
    if (e.description) lines.push(`DESCRIPTION:${escape(e.description)}`)
    lines.push(`CATEGORIES:${escape(e.type)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'escargot-crm-calendrier.ics'
  a.click()
  URL.revokeObjectURL(url)
}

const TYPES = ['Relance', 'Formation', 'Rendez-vous', 'Livraison', 'Autre']
const TYPE_COLORS: Record<string, string> = {
  'Relance': 'bg-amber-500',
  'Formation': 'bg-blue-500',
  'Rendez-vous': 'bg-purple-500',
  'Livraison': 'bg-green-500',
  'Autre': 'bg-gray-500',
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const emptyForm = { titre: '', type: 'Rendez-vous', date: '', heure: '', description: '', client_id: undefined as number | undefined }

export default function Calendar() {
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [form, setForm] = useState({ ...emptyForm })
  const [view, setView] = useState<'month' | 'list'>('month')

  const load = () => getEvenements().then(r => setEvenements(r.data))
  useEffect(() => { load(); getClients().then(r => setClients(r.data)) }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const todayStr = new Date().toISOString().split('T')[0]

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return evenements.filter(e => e.date === dateStr)
  }

  const openAdd = (dateStr?: string) => {
    const d = dateStr || new Date().toISOString().split('T')[0]
    setSelectedDate(d)
    setForm({ ...emptyForm, date: d })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.titre || !form.date) return
    const payload = { ...form, client_id: form.client_id || null }
    await createEvenement(payload)
    setShowModal(false)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet événement ?')) return
    await deleteEvenement(id)
    load()
  }

  const F = (k: string, v: string | number | undefined) => setForm(f => ({ ...f, [k]: v }))

  const upcomingEvents = evenements
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            <button onClick={() => setView('month')} className={`px-3 py-1.5 ${view === 'month' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Mois</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 ${view === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Liste</button>
          </div>
          <button onClick={() => exportToICS(evenements)} className="btn-secondary text-sm" title="Exporter vers Google Calendar / iPhone Calendar">
            <Download size={15} /> Exporter .ics
          </button>
          <button className="btn-primary" onClick={() => openAdd()}><Plus size={16} /> Ajouter</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {TYPES.map(t => (
          <div key={t} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[t]}`} />
            {t}
          </div>
        ))}
      </div>

      {view === 'month' && (
        <div className="card p-0 overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} /></button>
            <h2 className="font-semibold text-gray-900">{MONTHS_FR[month]} {year}</h2>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS_FR.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] border-r border-b border-gray-50 bg-gray-50/50" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const events = getEventsForDay(day)
              const isToday = dateStr === todayStr

              return (
                <div key={day}
                  className={`min-h-[90px] border-r border-b border-gray-50 p-1.5 cursor-pointer hover:bg-green-50/50 transition-colors ${isToday ? 'bg-green-50' : ''}`}
                  onClick={() => openAdd(dateStr)}
                >
                  <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-green-600 text-white' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map(e => (
                      <div key={e.id}
                        className={`text-xs text-white px-1.5 py-0.5 rounded truncate ${TYPE_COLORS[e.type] || 'bg-gray-500'}`}
                        onClick={ev => { ev.stopPropagation(); handleDelete(e.id) }}
                        title={`${e.titre} (cliquer pour supprimer)`}
                      >
                        {e.heure && <span className="opacity-80">{e.heure} </span>}{e.titre}
                      </div>
                    ))}
                    {events.length > 3 && <div className="text-xs text-gray-400 px-1">+{events.length - 3} autres</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500">Événements à venir ({upcomingEvents.length})</h3>
          {upcomingEvents.length === 0 ? (
            <div className="card text-center text-gray-400 py-8">Aucun événement à venir</div>
          ) : (
            upcomingEvents.map(e => {
              const client = e.client_id ? clients.find(c => c.id === e.client_id) : null
              return (
                <div key={e.id} className="card flex items-start gap-4 py-3">
                  <div className={`w-1 self-stretch rounded-full ${TYPE_COLORS[e.type] || 'bg-gray-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{e.titre}</span>
                      <span className={`badge text-white text-xs ${TYPE_COLORS[e.type] || 'bg-gray-500'}`}>{e.type}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(e.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {e.heure && ` à ${e.heure}`}
                      {client && ` — ${client.nom} ${client.prenom || ''}`}
                    </div>
                    {e.description && <p className="text-sm text-gray-500 mt-1">{e.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {showModal && (
        <Modal title="Nouvel événement" onClose={() => setShowModal(false)} onSubmit={handleSave}>
          <div className="space-y-4">
            <div><label className="label">Titre *</label><input className="input" value={form.titre} onChange={e => F('titre', e.target.value)} autoFocus /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => F('type', e.target.value)}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={e => F('date', e.target.value)} /></div>
            </div>
            <div><label className="label">Heure</label><input type="time" className="input" value={form.heure} onChange={e => F('heure', e.target.value)} /></div>
            <div>
              <label className="label">Client associé</label>
              <select className="input" value={form.client_id || ''} onChange={e => F('client_id', e.target.value ? parseInt(e.target.value) : undefined)}>
                <option value="">Aucun</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>)}
              </select>
            </div>
            <div><label className="label">Description</label><textarea className="input resize-none" rows={2} value={form.description} onChange={e => F('description', e.target.value)} /></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
