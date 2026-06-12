import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shell, Loader2 } from 'lucide-react'
import { login as apiLogin } from '../api'
import { useAuth } from '../contexts/AuthContext'

const MAX_RETRIES = 15
const RETRY_DELAY_MS = 8000

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryInfo, setRetryInfo] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const isTransient = (status: number | undefined) =>
    !status || status === 405 || (status >= 500 && status <= 599)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setRetryInfo('')
    setLoading(true)

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await apiLogin(username, password)
        login(res.data.access_token)
        navigate('/')
        return
      } catch (err: unknown) {
        const status = (err as { response?: { status: number } })?.response?.status
        if (status === 401) {
          setError("Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe.")
          break
        }
        if (isTransient(status)) {
          if (attempt < MAX_RETRIES - 1) {
            const elapsed = (attempt + 1) * RETRY_DELAY_MS / 1000
            setRetryInfo(`Serveur en démarrage... ${elapsed}s écoulées, tentative ${attempt + 2}/${MAX_RETRIES}`)
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
            continue
          }
          setError('Le serveur est trop long à démarrer. Réessayez dans 30 secondes.')
          break
        }
        setError(`Erreur serveur (${status}). Réessayez.`)
        break
      }
    }

    setLoading(false)
    setRetryInfo('')
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

          {retryInfo && (
            <div className="flex items-center gap-2 text-amber-600 text-xs justify-center bg-amber-50 rounded-lg px-3 py-2">
              <Loader2 size={13} className="animate-spin flex-shrink-0" />
              <span>{retryInfo}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Compte par défaut : admin / admin123
        </p>
        <p className="hidden" aria-hidden="true">v20260612b</p>
      </div>
    </div>
  )
}
