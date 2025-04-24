'use client'

import { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react'
import type { User as OurUser } from '@/types/user'
import { getUser } from '@/lib/firebase/profiles'
import { auth } from '@/lib/firebase'
import { User } from 'firebase/auth'

// Define the context shape
interface UserProfileContextType {
  userProfileData: OurUser | null
  loading: boolean
  error: string | null
  setUserProfileData: (data: OurUser | null) => void
  updateUserProfileData: (partialData: Partial<OurUser>) => void
  refresh: () => Promise<void>
}

// Create context with default values
const UserProfileContext = createContext<UserProfileContextType>({
  userProfileData: null,
  loading: false,
  error: null,
  setUserProfileData: () => { },
  updateUserProfileData: () => { },
  refresh: async () => { }
})

// Hook to use the context
export const useUserProfileData = () => useContext(UserProfileContext)

// Provider component
export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [userProfileData, setUserProfileData] = useState<OurUser | null>(null)
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
  const setUserProfileDataExternal = useCallback((data: OurUser | null) => {
    setUserProfileData(data)
    setLoading(false)
    setError(null)
  }, [])

  // Method to update partial profile data
  const updateUserProfileData = useCallback((partialData: Partial<OurUser>) => {
    setUserProfileData(prevData => {
      if (!prevData) return null
      return {
        ...prevData,
        ...partialData
      } as OurUser
    })
  }, [])

  // Method to refresh data from Firebase
  const refreshUserProfileData = useCallback(async () => {
    if (!user) {
      console.warn('No authenticated user found')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await getUser(user.uid)
      setUserProfileData(data)
    } catch (err) {
      console.error('Error loading user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load data when user changes
  useEffect(() => {
    if (user) {
      refreshUserProfileData()
    } else {
      setUserProfileData(null)
    }
  }, [user, refreshUserProfileData])

  // Context value
  const value = {
    userProfileData,
    loading,
    error,
    setUserProfileData: setUserProfileDataExternal,
    updateUserProfileData,
    refresh: refreshUserProfileData
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
} 