'use client'

import { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react'
import type { ProfessionalProfile } from '@/types/professional'
import { getProfessionalProfile } from '@/lib/firebase/profiles'
import { auth } from '@/lib/firebase'
import { User } from 'firebase/auth'

// Define the context shape
interface ProfessionalProfileContextType {
  professionalProfileData: ProfessionalProfile | null
  loading: boolean
  error: string | null
  setProfessionalProfileData: (data: ProfessionalProfile | null) => void
  updateProfessionalProfileData: (partialData: Partial<ProfessionalProfile>) => void
  refresh: () => Promise<void>
}

// Create context with default values
const ProfessionalProfileContext = createContext<ProfessionalProfileContextType>({
  professionalProfileData: null,
  loading: false,
  error: null,
  setProfessionalProfileData: () => {},
  updateProfessionalProfileData: () => {},
  refresh: async () => {}
})

// Hook to use the context
export const useProfessionalProfileData = () => useContext(ProfessionalProfileContext)

// Provider component
export function ProfessionalProfileProvider({ children }: { children: ReactNode }) {
  const [professionalProfileData, setProfessionalProfileData] = useState<ProfessionalProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser)
    })
    return () => unsubscribe()
  }, [])

  // Method to set profile data
  const setProfessionalProfileDataExternal = useCallback((data: ProfessionalProfile | null) => {
    setProfessionalProfileData(data)
    setLoading(false)
    setError(null)
  }, [])

  // Method to update partial profile data
  const updateProfessionalProfileData = useCallback((partialData: Partial<ProfessionalProfile>) => {
    setProfessionalProfileData(prevData => {
      if (!prevData) return null
      return {
        ...prevData,
        ...partialData
      } as ProfessionalProfile
    })
  }, [])

  // Method to refresh data from Firebase
  const refreshProfileData = useCallback(async () => {
    if (!user) {
      console.warn('No authenticated user found')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const data = await getProfessionalProfile(user.uid)
      setProfessionalProfileData(data)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load data when user changes
  useEffect(() => {
    if (user) {
      refreshProfileData()
    } else {
      setProfessionalProfileData(null)
    }
  }, [user, refreshProfileData])

  // Context value
  const value = {
    professionalProfileData,
    loading,
    error,
    setProfessionalProfileData: setProfessionalProfileDataExternal,
    updateProfessionalProfileData,
    refresh: refreshProfileData
  }

  return (
    <ProfessionalProfileContext.Provider value={value}>
      {children}
    </ProfessionalProfileContext.Provider>
  )
} 