import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shell, Loader2 } from 'lucide-react'
import { login as apiLogin } from '../api'
import { useAuth } from '../contexts/AuthContext'

const API_ROOT = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : `https://${window.location.hostname}:8000`

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [warmSec, setWarmSec] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    let elapsed = 0

    const tryPing = async () => {
      while (!cancelled) {
        try {
          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 5000)
          const res = await fetch(`${API_ROOT}/`, { signal: ctrl.signal })
          clearTimeout(timer)
          if (res.ok) {
            const data = await res.json().catch(() => null)
            if (data?.message) {
              if (!cancelled) setReady(true)
              return
            }
          }
        } catch {
          // still starting up
        }
        if (cancelled) return
        elapsed += 5
        setWarmSec(elapsed)
        await new Promise(r => setTimeout(r, 5000))
      }
    }

    tryPing()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(username, password)
      login(res.data.access_token)
      navigate('/')
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 401) {
        setError("Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe.")
      } else if (!status || status === 405 || status === 502 || status === 503) {
        setError('Le serveur démarre encore. Patientez quelques secondes et réessayez.')
      } else {
        setError(`Erreur serveur (${status}). Réessayez dans quelques secondes.`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <Shell size={36} className="text-green-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Escargot CRM</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion d'élevage d'escargots & hannetons</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nom d'utilisateur</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {!ready && (
            <div className="flex items-center gap-2 text-amber-600 text-xs justify-center">
              <Loader2 size={14} className="animate-spin" />
              <span>Démarrage du serveur{warmSec > 0 ? ` (${warmSec}s)` : '...'}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !ready}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {loading ? 'Connexion...' : !ready ? 'En attente du serveur...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Compte par défaut : admin / admin123
        </p>
      </div>
    </div>
  )
}
