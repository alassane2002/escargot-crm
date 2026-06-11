import { useState } from 'react'
import { Lock, CheckCircle, Info } from 'lucide-react'
import { changePassword } from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { username } = useAuth()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPw.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (newPw !== confirmPw) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await changePassword(currentPw, newPw)
      setSuccess(true)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail || 'Erreur lors du changement de mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez votre compte administrateur</p>
      </div>

      {/* Account info */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">
            {username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{username}</h2>
            <p className="text-sm text-gray-500">Compte Administrateur</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-900">Changer le mot de passe</h2>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
            <CheckCircle size={16} />
            Mot de passe modifié avec succès !
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Mot de passe actuel</label>
            <input
              type="password"
              className="input"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input
              type="password"
              className="input"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              className="input"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? 'Modification...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>

      {/* App info */}
      <div className="card bg-gray-50">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-700">Informations de l'application</h3>
            <div className="text-sm text-gray-500 mt-2 space-y-1">
              <p><strong>Application :</strong> Escargot CRM v1.0</p>
              <p><strong>Backend :</strong> FastAPI + PostgreSQL (Render)</p>
              <p><strong>Frontend :</strong> React + TypeScript + Tailwind CSS (Vercel)</p>
              <p><strong>Base de données :</strong> PostgreSQL — escargot_crm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
