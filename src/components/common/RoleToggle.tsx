import { useState, useEffect } from 'react'
import { Camera, Briefcase } from 'lucide-react'
import { auth } from '@/lib/firebase'

interface RoleToggleProps {
  onModeChange: (mode: 'professional' | 'client') => void
  initialMode?: 'professional' | 'client'
}

export default function RoleToggle({ onModeChange, initialMode = 'client' }: RoleToggleProps) {
  const [mode, setMode] = useState<'professional' | 'client'>(initialMode)
  const [showToggle, setShowToggle] = useState(false)

  useEffect(() => {
    // Check if user has both roles
    const checkRoles = async () => {
      const { claims } = await auth.currentUser?.getIdTokenResult() || {}
      setShowToggle(claims?.role === 'both')
    }

    checkRoles()
  }, [])

  const handleModeChange = (newMode: 'professional' | 'client') => {
    setMode(newMode)
    onModeChange(newMode)
  }

  if (!showToggle) return null

  return (
    <div className="flex items-center justify-center space-x-2 bg-dark-card rounded-full p-1 border border-dark-border">
      <button
        onClick={() => handleModeChange('client')}
        className={`flex items-center px-4 py-2 rounded-full transition-colors ${
          mode === 'client'
            ? 'bg-primary-600 text-white'
            : 'text-dark-text-secondary hover:text-dark-text-primary'
        }`}
      >
        <Briefcase className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Client</span>
      </button>
      <button
        onClick={() => handleModeChange('professional')}
        className={`flex items-center px-4 py-2 rounded-full transition-colors ${
          mode === 'professional'
            ? 'bg-primary-600 text-white'
            : 'text-dark-text-secondary hover:text-dark-text-primary'
        }`}
      >
        <Camera className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Professional</span>
      </button>
    </div>
  )
} 