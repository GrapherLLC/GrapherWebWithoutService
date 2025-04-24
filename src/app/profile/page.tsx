'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Trash2, Mail, Phone, Camera, Edit2 } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import DeleteAccountModal from '@/components/common/DeleteAccountModal'
import { auth } from '@/lib/firebase'
import { getUser } from '@/lib/firebase/profiles'
import type { User } from '@/types/user'

import { useRouter } from 'next/navigation'
import type { User as FirebaseUser } from 'firebase/auth'
import { resetProfessionalProfile } from '@/lib/firebase/profiles'

export default function ProfilePage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
        try {
          const [userData] = await Promise.all([
            getUser(user.uid),
          ])
          setUserData(userData)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setError('Failed to load profile data')
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-dark-text-secondary">Loading...</div>
        </div>
      </MainLayout>
    )
  }

  if (!user || !userData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-dark-text-secondary">Please sign in to view your profile</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-dark-card rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="relative h-32 bg-gradient-to-r from-primary-600 to-primary-400">
            <div className="absolute -bottom-12 left-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-dark-card bg-dark-card">
                {userData.photoURL ? (
                  <Image
                    src={userData.photoURL}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-dark-input">
                    <Camera className="w-8 h-8 text-dark-text-muted" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-1 bg-dark-input rounded-full text-dark-text-secondary hover:text-dark-text-primary">
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-6 px-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-dark-text-primary">
                  {userData.displayName || 'No name set'}
                </h1>
                <p className="text-dark-text-secondary mt-1">
                  {userData.role?.professional && userData.role?.client ? 'Client & Professional' :
                   userData.role?.professional ? 'Professional' : 'Client'}
                </p>
              </div>
              <button
                onClick={() => router.push('/profile/edit')}
                className="px-4 py-2 bg-dark-input text-dark-text-primary rounded-md hover:bg-dark-border transition-colors flex items-center"
              >
                <Edit2 size={16} className="mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="md:col-span-2">
            <div className="bg-dark-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center text-dark-text-secondary">
                  <Mail className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-dark-text-primary">{user.email}</p>
                    <p className="text-sm">{userData.contact?.emailVerified ? 'Verified' : 'Not verified'}</p>
                  </div>
                </div>
                <div className="flex items-center text-dark-text-secondary">
                  <Phone className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-dark-text-primary">{userData.contact?.phone || 'No phone number'}</p>
                    <p className="text-sm">{userData.contact?.phoneVerified ? 'Verified' : 'Not verified'}</p>
                  </div>
                </div>
                {userData.contact?.phone && (
                  <button
                    className={`mt-4 px-4 py-2 rounded-md transition-colors ${
                      userData.contact?.phoneVerified
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-primary-600 hover:bg-primary-500 text-white'
                    }`}
                  >
                    {userData.contact?.phoneVerified ? 'Change Phone Number' : 'Verify Phone Number'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <div className="bg-dark-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Account Status</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-dark-text-secondary">Member since</p>
                  <p className="text-dark-text-primary">
                    {userData.createdAt ? 
                      new Date(userData.createdAt).toLocaleString()
                      : 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-dark-text-secondary">Account type</p>
                  <p className="text-dark-text-primary">
                    {userData.role?.professional && userData.role?.client ? 'Dual Account' :
                     userData.role?.professional ? 'Professional Account' : 'Client Account'}
                  </p>
                </div>
                {!userData.role?.professional && (
                  <div className="pt-3 border-t border-dark-border">
                    <p className="text-dark-text-secondary mb-2">Want to offer services?</p>
                    <button
                      onClick={async () => {
                        try {
                          if (!user) return;
                          
                          // Reset professional profile (delete and create new)
                          await resetProfessionalProfile(user.uid);
                          
                          // Redirect to professional profile setup
                          router.push('/pro-signup/create-profile/basic-info?from=new');
                        } catch (error) {
                          console.error('Error starting professional setup:', error);
                          setError(error instanceof Error ? error.message : 'Failed to start professional setup');
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors"
                    >
                      Become a Professional
                    </button>
                    <p className="text-xs text-dark-text-muted mt-2">
                      Create a professional profile and start offering your services
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8">
          <div className="bg-dark-card rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
            </div>
            <div className="p-6">
              <div className="bg-dark-input rounded-lg p-4 border border-dark-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-dark-text-primary">Delete Account</h3>
                    <p className="text-sm text-dark-text-secondary mt-1">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      </div>
    </MainLayout>
  )
} 