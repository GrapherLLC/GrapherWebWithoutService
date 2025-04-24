'use client'

// This is now a proxy to the context
import { useProfessionalProfileData as useProfileContext } from '@/contexts/ProfessionalProfileContext'
import type { ProfessionalProfile } from '@/types/professional'

// Keep the old interface for backward compatibility
export interface ProfessionalProfileDataProvider {
  loadProfessionalProfileData: () => Promise<ProfessionalProfile | null>;
}

// This function now just forwards to the context version
// We no longer need the dataProvider parameter as the context handles loading
export function useProfessionalProfileData() {
  // Get the context implementation
  const context = useProfileContext()
  
  // The context automatically handles data loading
  return context
} 