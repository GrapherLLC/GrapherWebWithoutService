'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Calendar } from 'lucide-react'
import type { ClientProfile } from '@/types/client'

export default function ClientProfilePage() {
  const params = useParams<{ id: string }>()
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!params?.id) {
        setError('Invalid profile ID')
        setLoading(false)
        return
      }

      try {
        const docRef = doc(db, 'profilesClients', params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProfile(docSnap.data() as ClientProfile)
        } else {
          setError('Profile not found')
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-dark-text-secondary">Loading profile...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-red-500">{error || 'Profile not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-dark-card rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 text-dark-text-secondary">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-dark-text-primary">
              {profile.usageStats.completedOrders}
            </div>
            <div className="text-dark-text-secondary text-sm">Completed Orders</div>
          </div>
          <div className="bg-dark-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-dark-text-primary">
              {profile.usageStats.averageRatingGiven.toFixed(1)}
            </div>
            <div className="text-dark-text-secondary text-sm">Average Rating Given</div>
          </div>
          <div className="bg-dark-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-dark-text-primary">
              {profile.usageStats.moneySpent.toLocaleString()}
            </div>
            <div className="text-dark-text-secondary text-sm">Money Spent</div>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Ranking</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-dark-text-primary mb-2">Level</h3>
              <div className="text-dark-text-secondary">
                {profile.ranking.level}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-dark-text-primary mb-2">Points</h3>
              <div className="text-dark-text-secondary">
                {profile.ranking.points}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 