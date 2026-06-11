import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Bell, ShoppingCart, GraduationCap,
  Package, Calendar, BarChart3, Settings, LogOut, Menu, X, Shell
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/relances', icon: Bell, label: 'Relances' },
  { to: '/ventes', icon: ShoppingCart, label: 'Ventes' },
  { to: '/formations', icon: GraduationCap, label: 'Formations' },
  { to: '/stock', icon: Package, label: 'Stock Élevage' },
  { to: '/calendrier', icon: Calendar, label: 'Calendrier' },
  { to: '/rapports', icon: BarChart3, label: 'Rapports' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-green-900 text-white flex flex-col transition-all duration-200 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-green-800">
          <Shell size={28} className="text-green-300 flex-shrink-0" />
          {sidebarOpen && (
            <div>
              <div className="font-bold text-white text-sm leading-tight">Escargot CRM</div>
              <div className="text-green-400 text-xs">Gestion d'élevage</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-green-700 text-white font-medium'
                    : 'text-green-200 hover:bg-green-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-green-800 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{username}</div>
                <div className="text-xs text-green-400">Administrateur</div>
              </div>
              <button onClick={handleLogout} className="p-1.5 hover:bg-green-800 rounded-lg" title="Déconnexion">
                <LogOut size={15} className="text-green-300" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center p-2 hover:bg-green-800 rounded-lg">
              <LogOut size={18} className="text-green-300" />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
