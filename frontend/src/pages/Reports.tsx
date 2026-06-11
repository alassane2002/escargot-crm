import { useState } from 'react'
import { Download, FileSpreadsheet, Users, ShoppingCart, GraduationCap, Package } from 'lucide-react'
import { exportClientsExcel, exportVentesExcel, exportFormationsExcel, exportStockExcel } from '../api'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

interface ExportCard {
  label: string
  description: string
  icon: React.ElementType
  color: string
  fn: () => Promise<{ data: Blob }>
  filename: string
}

const exports: ExportCard[] = [
  {
    label: 'Clients',
    description: 'Exporter la liste complète des clients avec leurs informations',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
    fn: exportClientsExcel,
    filename: 'clients.xlsx',
  },
  {
    label: 'Ventes',
    description: 'Exporter toutes les ventes avec montants et statuts de paiement',
    icon: ShoppingCart,
    color: 'bg-green-100 text-green-600',
    fn: exportVentesExcel,
    filename: 'ventes.xlsx',
  },
  {
    label: 'Formations',
    description: 'Exporter les formations avec la liste des participants',
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-600',
    fn: exportFormationsExcel,
    filename: 'formations.xlsx',
  },
  {
    label: 'Stock Élevage',
    description: 'Exporter l\'historique du stock escargots et hannetons',
    icon: Package,
    color: 'bg-amber-100 text-amber-600',
    fn: exportStockExcel,
    filename: 'stock.xlsx',
  },
]

export default function Reports() {
  const [loading, setLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleExport = async (exp: ExportCard) => {
    setLoading(exp.label)
    setSuccess(null)
    try {
      const res = await exp.fn()
      downloadBlob(res.data, exp.filename)
      setSuccess(exp.label)
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      console.error(e)
      alert('Erreur lors de l\'export')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports & Exports</h1>
        <p className="text-sm text-gray-500 mt-1">Téléchargez vos données au format Excel</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Export "{success}" téléchargé avec succès !
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-900">Exports Excel</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exports.map(exp => (
            <div key={exp.label} className="card flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${exp.color}`}>
                <exp.icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{exp.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{exp.description}</p>
                <button
                  onClick={() => handleExport(exp)}
                  disabled={loading === exp.label}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-60"
                >
                  <Download size={15} />
                  {loading === exp.label ? 'Génération...' : 'Télécharger .xlsx'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-gray-50">
        <h3 className="font-medium text-gray-700 mb-2">À propos des exports</h3>
        <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
          <li>Les fichiers sont au format Excel (.xlsx) compatibles avec Microsoft Excel et LibreOffice</li>
          <li>Toutes les données sont exportées sans limite de lignes</li>
          <li>Les en-têtes sont colorés en vert pour faciliter la lecture</li>
          <li>Les exports incluent toutes les données actuelles de la base</li>
        </ul>
      </div>
    </div>
  )
}
