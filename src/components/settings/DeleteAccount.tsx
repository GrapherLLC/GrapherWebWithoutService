import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'
import { deleteAccount } from '@/lib/firebase/auth'

export default function DeleteAccount() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      await deleteAccount()
      router.push('/') // Redirect to home after successful deletion
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  if (!showConfirmation) {
    return (
      <div className="border border-red-500/20 rounded-lg p-6 bg-red-500/5">
        <h3 className="text-lg font-medium text-red-400 mb-4">Delete Account</h3>
        <p className="text-dark-text-secondary mb-6">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowConfirmation(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Delete Account
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-card rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-medium">Confirm Account Deletion</h3>
        </div>
        
        <p className="text-dark-text-secondary mb-6">
          Are you sure you want to delete your account? This will:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Delete your user profile</li>
            <li>Remove all your portfolio files</li>
            <li>Delete all your professional/client data</li>
            <li>This action cannot be undone</li>
          </ul>
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4 mb-6">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="px-4 py-2 border border-dark-border text-dark-text-primary rounded-md hover:bg-dark-input transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Deleting...' : 'Yes, Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
} 