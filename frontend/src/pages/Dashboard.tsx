import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, TrendingUp, ShoppingCart, Bell, AlertTriangle, GraduationCap, DollarSign } from 'lucide-react'
import { getDashboardStats, getVentesMensuelles, getClientsParStatut, getNouveauxClients } from '../api'
import type { DashboardStats } from '../types'

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed']

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType, label: string, value: string | number, color: string, sub?: string
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [ventes, setVentes] = useState<{ mois: string; ventes: number; revenus: number }[]>([])
  const [statutData, setStatutData] = useState<{ statut: string; count: number }[]>([])
  const [clientsData, setClientsData] = useState<{ mois: string; clients: number }[]>([])

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data))
    getVentesMensuelles().then(r => setVentes(r.data))
    getClientsParStatut().then(r => setStatutData(r.data))
    getNouveauxClients().then(r => setClientsData(r.data))
  }, [])

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Alert banners */}
      {(stats.relances_en_retard > 0 || stats.relances_du_jour > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.relances_en_retard > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
              <AlertTriangle size={16} />
              <span><strong>{stats.relances_en_retard}</strong> relance(s) en retard</span>
            </div>
          )}
          {stats.relances_du_jour > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-lg text-sm">
              <Bell size={16} />
              <span><strong>{stats.relances_du_jour}</strong> relance(s) aujourd'hui</span>
            </div>
          )}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Clients" value={stats.total_clients} color="bg-green-600" sub={`${stats.total_prospects} prospects`} />
        <StatCard icon={ShoppingCart} label="Ventes" value={stats.total_ventes} color="bg-blue-600" />
        <StatCard icon={DollarSign} label="CA Total" value={fmt(stats.chiffre_affaires_total)} color="bg-purple-600" />
        <StatCard icon={TrendingUp} label="CA du mois" value={fmt(stats.chiffre_affaires_mois)} color="bg-orange-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bell} label="Relances du jour" value={stats.relances_du_jour} color="bg-amber-500" />
        <StatCard icon={AlertTriangle} label="Relances en retard" value={stats.relances_en_retard} color="bg-red-600" />
        <StatCard icon={GraduationCap} label="Formations à venir" value={stats.formations_a_venir} color="bg-teal-600" />
        <StatCard icon={Users} label="Prospects" value={stats.total_prospects} color="bg-indigo-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Revenus mensuels (FCFA)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ventes} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1000) + 'k'} />
              <Tooltip formatter={(v: number) => [fmt(v), 'Revenus']} />
              <Bar dataKey="revenus" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Nombre de ventes mensuelles</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ventes} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="ventes" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Ventes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Clients par statut</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statutData} dataKey="count" nameKey="statut" cx="50%" cy="50%" outerRadius={80} label={({ statut, count }) => `${statut}: ${count}`} labelLine={false}>
                {statutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Nouveaux clients par mois</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="clients" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Nouveaux clients" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
