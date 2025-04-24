'use client'

// This is now a proxy to the context
import { useUserProfileData as useProfileContext } from '@/contexts/UserProfileContext'
import type { User } from '@/types/user'

// Keep the old interface for backward compatibility
export interface UserProfileDataProvider {
  loadUserProfileData: () => Promise<User | null>;
}

// This function now just forwards to the context version
// We no longer need the dataProvider parameter as the context handles loading
export function useUserProfileData() {
  // Get the context implementation
  const context = useProfileContext()

  // The context automatically handles data loading
  return context
} 