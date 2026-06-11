import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || `https://${window.location.hostname}:8000/api`
const API_ROOT = API_URL.replace('/api', '')

export default function Debug() {
  const [results, setResults] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  const log = (msg: string) => setResults(prev => [...prev, `${new Date().toISOString().slice(11,19)} ${msg}`])

  const runTests = async () => {
    setResults([])
    setRunning(true)

    log(`VITE_API_URL = "${import.meta.env.VITE_API_URL}"`)
    log(`API_ROOT = "${API_ROOT}"`)
    log(`API_URL = "${API_URL}"`)
    log('---')

    // Test 1: GET /
    log('Test 1: GET backend root...')
    try {
      const r = await fetch(`${API_ROOT}/`, { signal: AbortSignal.timeout(15000) })
      const d = await r.json()
      log(`✓ GET / → ${r.status} : ${JSON.stringify(d)}`)
    } catch (e) {
      log(`✗ GET / → ERREUR: ${e}`)
    }

    // Test 2: OPTIONS preflight
    log('Test 2: OPTIONS preflight...')
    try {
      const r = await fetch(`${API_URL}/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        },
        signal: AbortSignal.timeout(10000)
      })
      log(`✓ OPTIONS → ${r.status}, CORS: ${r.headers.get('access-control-allow-origin')}`)
    } catch (e) {
      log(`✗ OPTIONS → ERREUR: ${e}`)
    }

    // Test 3: POST login
    log('Test 3: POST login admin/admin123...')
    try {
      const r = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        signal: AbortSignal.timeout(15000)
      })
      if (r.ok) {
        const d = await r.json()
        log(`✓ POST login → ${r.status}, token: ${d.access_token?.substring(0,20)}...`)
      } else {
        const txt = await r.text().catch(() => '')
        log(`✗ POST login → ${r.status}: ${txt.substring(0,100)}`)
      }
    } catch (e) {
      log(`✗ POST login → ERREUR RESEAU: ${e}`)
    }

    setRunning(false)
    log('--- TERMINÉ ---')
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2>Diagnostic page</h2>
      <button
        onClick={runTests}
        disabled={running}
        style={{ padding: '8px 16px', fontSize: 14, cursor: running ? 'not-allowed' : 'pointer', marginBottom: 16 }}
      >
        {running ? 'Tests en cours...' : 'Lancer les tests'}
      </button>
      <div style={{ background: '#1a1a1a', color: '#00ff00', padding: 16, borderRadius: 8, minHeight: 200, whiteSpace: 'pre-wrap', fontSize: 13 }}>
        {results.length === 0 ? 'Cliquez "Lancer les tests"...' : results.join('\n')}
      </div>
    </div>
  )
}
