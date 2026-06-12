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

    const rawUrl = import.meta.env.VITE_API_URL || ''
    const firstCharCode = rawUrl.charCodeAt(0)
    log(`VITE_API_URL = "${rawUrl}"`)
    log(`Premier char code: ${firstCharCode} (doit être 104='h', si 65279=BOM problème)`)
    log(`API_ROOT = "${API_ROOT}"`)
    log('---')

    // Test 1: GET /
    log('Test 1: GET backend root...')
    try {
      const r = await fetch(`${API_ROOT}/`, { signal: AbortSignal.timeout(60000) })
      const txt = await r.text()
      if (txt.includes('{')) {
        log(`✓ GET / → ${r.status} JSON: ${txt.substring(0, 80)}`)
      } else {
        log(`✗ GET / → ${r.status} HTML (backend endormi): ${txt.substring(0, 120).replace(/\s+/g, ' ')}`)
      }
    } catch (e) {
      log(`✗ GET / → ERREUR RESEAU: ${e}`)
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
        signal: AbortSignal.timeout(60000)
      })
      const txt = await r.text().catch(() => '')
      if (r.ok) {
        log(`✓ POST login → ${r.status}, réponse: ${txt.substring(0,80)}`)
      } else {
        log(`✗ POST login → ${r.status}: "${txt.substring(0,150).replace(/\s+/g,' ')}"`)
      }
    } catch (e) {
      log(`✗ POST login → ERREUR RESEAU: ${e}`)
    }

    // Test 4: Direct URL test
    log('Test 4: URL directe hardcodée...')
    try {
      const r = await fetch('https://escargot-crm-backend.onrender.com/', {
        signal: AbortSignal.timeout(60000)
      })
      const txt = await r.text()
      log(`URL directe → ${r.status}: ${txt.substring(0,80)}`)
    } catch (e) {
      log(`URL directe → ERREUR: ${e}`)
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
