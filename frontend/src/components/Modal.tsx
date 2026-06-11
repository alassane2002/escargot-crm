import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  onSubmit?: () => void
  children: React.ReactNode
  submitLabel?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ title, onClose, onSubmit, children, submitLabel = 'Enregistrer', size = 'md' }: ModalProps) {
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
        {onSubmit && (
          <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
            <button onClick={onClose} className="btn-secondary">Annuler</button>
            <button onClick={onSubmit} className="btn-primary">{submitLabel}</button>
          </div>
        )}
      </div>
    </div>
  )
}
