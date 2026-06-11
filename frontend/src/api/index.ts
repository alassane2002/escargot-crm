import axios from 'axios'

// En production : VITE_API_URL pointe vers le backend Render
// En local : utilise l'IP/hostname courant sur le port 8000
const BASE_URL = import.meta.env.VITE_API_URL || `https://${window.location.hostname}:8000/api`

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password })

export const changePassword = (current_password: string, new_password: string) =>
  api.post('/auth/change-password', { current_password, new_password })

export const getMe = () => api.get('/auth/me')

// Clients
export const getClients = (params?: { search?: string; statut?: string }) =>
  api.get('/clients', { params })

export const getClient = (id: number) => api.get(`/clients/${id}`)
export const createClient = (data: unknown) => api.post('/clients', data)
export const updateClient = (id: number, data: unknown) => api.put(`/clients/${id}`, data)
export const deleteClient = (id: number) => api.delete(`/clients/${id}`)

// Discussions
export const getDiscussions = (clientId: number) => api.get(`/clients/${clientId}/discussions`)
export const addDiscussion = (clientId: number, data: unknown) => api.post(`/clients/${clientId}/discussions`, data)
export const deleteDiscussion = (clientId: number, discId: number) => api.delete(`/clients/${clientId}/discussions/${discId}`)

// Relances
export const getRelances = () => api.get('/relances')
export const getTodayRelances = () => api.get('/relances/today')
export const getOverdueRelances = () => api.get('/relances/overdue')
export const createRelance = (data: unknown) => api.post('/relances', data)
export const updateRelance = (id: number, data: unknown) => api.put(`/relances/${id}`, data)
export const deleteRelance = (id: number) => api.delete(`/relances/${id}`)

// Ventes
export const getVentes = () => api.get('/ventes')
export const createVente = (data: unknown) => api.post('/ventes', data)
export const updateVente = (id: number, data: unknown) => api.put(`/ventes/${id}`, data)
export const deleteVente = (id: number) => api.delete(`/ventes/${id}`)
export const getPaiements = (venteId: number) => api.get(`/ventes/${venteId}/paiements`)
export const addPaiement = (venteId: number, data: unknown) => api.post(`/ventes/${venteId}/paiements`, data)

// Formations
export const getFormations = () => api.get('/formations')
export const getFormation = (id: number) => api.get(`/formations/${id}`)
export const createFormation = (data: unknown) => api.post('/formations', data)
export const updateFormation = (id: number, data: unknown) => api.put(`/formations/${id}`, data)
export const deleteFormation = (id: number) => api.delete(`/formations/${id}`)
export const addParticipant = (formationId: number, data: unknown) => api.post(`/formations/${formationId}/participants`, data)
export const updateParticipant = (formationId: number, participantId: number, data: unknown) =>
  api.put(`/formations/${formationId}/participants/${participantId}`, data)
export const removeParticipant = (formationId: number, participantId: number) =>
  api.delete(`/formations/${formationId}/participants/${participantId}`)

// Stock
export const getStockEscargots = () => api.get('/stock/escargots')
export const createStockEscargot = (data: unknown) => api.post('/stock/escargots', data)
export const updateStockEscargot = (id: number, data: unknown) => api.put(`/stock/escargots/${id}`, data)
export const deleteStockEscargot = (id: number) => api.delete(`/stock/escargots/${id}`)
export const getStockHannetons = () => api.get('/stock/hannetons')
export const createStockHanneton = (data: unknown) => api.post('/stock/hannetons', data)
export const updateStockHanneton = (id: number, data: unknown) => api.put(`/stock/hannetons/${id}`, data)
export const deleteStockHanneton = (id: number) => api.delete(`/stock/hannetons/${id}`)

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getVentesMensuelles = () => api.get('/dashboard/ventes-mensuelles')
export const getClientsParStatut = () => api.get('/dashboard/clients-par-statut')
export const getNouveauxClients = () => api.get('/dashboard/nouveaux-clients')

// Calendar
export const getEvenements = () => api.get('/calendar')
export const createEvenement = (data: unknown) => api.post('/calendar', data)
export const updateEvenement = (id: number, data: unknown) => api.put(`/calendar/${id}`, data)
export const deleteEvenement = (id: number) => api.delete(`/calendar/${id}`)

// Exports
export const exportClientsExcel = () =>
  api.get('/exports/clients/excel', { responseType: 'blob' })
export const exportVentesExcel = () =>
  api.get('/exports/ventes/excel', { responseType: 'blob' })
export const exportFormationsExcel = () =>
  api.get('/exports/formations/excel', { responseType: 'blob' })
export const exportStockExcel = () =>
  api.get('/exports/stock/excel', { responseType: 'blob' })
