export default async function handler(req, res) {
  try {
    const response = await fetch('https://escargot-crm-backend.onrender.com/', {
      signal: AbortSignal.timeout(70000)
    })
    const data = await response.json()
    res.status(200).json({ ok: true, backend: data.message, ts: new Date().toISOString() })
  } catch (err) {
    res.status(200).json({ ok: false, error: String(err), ts: new Date().toISOString() })
  }
}
