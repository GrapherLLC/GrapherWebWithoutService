'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { deleteAccount } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (!isOpen) return null

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await deleteAccount()
      router.push('/auth/signin')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete account')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        
        <div className="relative bg-dark-card rounded-lg w-full max-w-md p-6">
          <div className="mb-6 flex items-center justify-center text-red-500">
            <AlertTriangle size={48} />
          </div>
          
          <h3 className="text-xl font-semibold text-dark-text-primary mb-2 text-center">
            Delete Account
          </h3>
          
          <p className="text-dark-text-secondary mb-4 text-center">
            This action cannot be undone. All your data will be permanently deleted.
          </p>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-dark-text-primary mb-2">
              The following data will be deleted:
            </h4>
            <ul className="text-sm text-dark-text-secondary space-y-1 list-disc list-inside">
              <li>Your profile and account information</li>
              <li>All uploaded photos and files</li>
              <li>Messages and booking history</li>
              <li>Reviews and ratings</li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
              placeholder="DELETE"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-dark-border text-dark-text-primary rounded-md hover:bg-dark-input transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmation !== 'DELETE'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 