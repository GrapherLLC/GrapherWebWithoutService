'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Briefcase, Users } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { auth } from '@/lib/firebase'
import { resetProfessionalProfile, getOrCreateClientProfile, updateClientProfile } from '@/lib/firebase/profiles'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type UserRole = 'client' | 'professional' | 'both'

export default function SelectRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRoleSelect = async (role: UserRole) => {
    setLoading(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Update user role in Firestore - only set client role to true
      // Professional role will be set to true only when profile setup is completed
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        'role.client': role === 'client' || role === 'both',
        // Don't set professional role to true here
        updatedAt: new Date().toISOString()
      })
      
      console.log(`Updated user role for client: ${role === 'client' || role === 'both'}`)

      // Get or create client profile
      const { profile: clientProfile } = await getOrCreateClientProfile(user.uid)
      if (!clientProfile.isSetupCompleted) {
        await updateClientProfile(user.uid, {
          isSetupCompleted: true
        })
      }

      // Create or fetch professional profile if applicable
      if (role === 'professional' || role === 'both') {
        // Reset professional profile (delete existing one including images, and create new)
        await resetProfessionalProfile(user.uid)
        console.log('Reset professional profile')

        // Always redirect to setup since we've reset the profile
        console.log('Redirecting to pro-signup/create-profile/basic-info for professional setup')
        router.push('/pro-signup/create-profile/basic-info?from=new')
      } else if (role === 'client') {
        console.log('Redirecting to client dashboard')
        router.push('/dashboard/client')
      }
    } catch (error) {
      console.error('Error setting role:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Choose Your Role"
      subtitle={`Select how you want to use ${process.env.NEXT_PUBLIC_COMPANY_NAME}`}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => handleRoleSelect('client')}
          disabled={loading}
          className="w-full p-6 bg-dark-card border-2 border-dark-border rounded-lg hover:border-primary-500 transition-colors relative"
        >
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-primary-500" />
            <div className="ml-4 text-left">
              <h3 className="text-lg font-medium text-dark-text-primary">I want to hire</h3>
              <p className="text-sm text-dark-text-secondary">
                Find and hire photographers, videographers, and editors
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRoleSelect('professional')}
          disabled={loading}
          className="w-full p-6 bg-dark-card border-2 border-dark-border rounded-lg hover:border-primary-500 transition-colors relative"
        >
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-primary-500" />
            <div className="ml-4 text-left">
              <h3 className="text-lg font-medium text-dark-text-primary">I want to offer services</h3>
              <p className="text-sm text-dark-text-secondary">
                Create your portfolio and find new clients
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRoleSelect('both')}
          disabled={loading}
          className="w-full p-6 bg-dark-card border-2 border-dark-border rounded-lg hover:border-primary-500 transition-colors relative"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-500" />
            <div className="ml-4 text-left">
              <h3 className="text-lg font-medium text-dark-text-primary">I want to do both</h3>
              <p className="text-sm text-dark-text-secondary">
                Hire professionals and offer your own services
              </p>
            </div>
          </div>
        </button>
      </div>
    </AuthLayout>
  )
} 