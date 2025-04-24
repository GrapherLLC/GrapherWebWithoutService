'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import DeleteAccount from '@/components/settings/DeleteAccount'

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark-text-primary mb-8">Account Settings</h1>

      <div className="space-y-8">
        {/* Profile Settings Section */}
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Profile Settings</h2>
          <p className="text-dark-text-secondary">
            Manage your profile information and preferences.
          </p>
          {/* Add profile settings components here */}
        </div>

        {/* Security Settings Section */}
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Security</h2>
          <p className="text-dark-text-secondary">
            Manage your account security and privacy settings.
          </p>
          {/* Add security settings components here */}
        </div>

        {/* Danger Zone */}
        <div>
          <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Danger Zone</h2>
          <DeleteAccount />
        </div>
      </div>
    </div>
  )
} 