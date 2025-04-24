'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star, Phone, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/user'
import type { ClientProfile } from '@/types/client'

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [clientData, setClientData] = useState<ClientProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        setError('No user logged in')
        setLoading(false)
        return
      }

      // Get user data from /users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        setError('User not found')
        setLoading(false)
        return
      }

      // Get client profile data from /profilesClients collection
      const clientDoc = await getDoc(doc(db, 'profilesClients', user.uid))
      if (!clientDoc.exists()) {
        setError('Client profile not found')
        setLoading(false)
        return
      }

      setUserData(userDoc.data() as User)
      setClientData(clientDoc.data() as ClientProfile)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!userData || !clientData) return <div>No profile found</div>

  return (
    <div className="container mx-auto p-4">
      {/* Switch To Professional Button */}
      {userData?.role.professional && (
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => router.push('/dashboard/professional/')}
            className="px-8 py-4 bg-primary-500 text-white text-lg font-bold rounded-lg hover:bg-primary-600 transition-colors"
          >
            Switch To Professional
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img
            src={userData.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{userData.displayName}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{userData.email}</span>
              {userData.contact.phone && (
                <>
                  <Phone className="w-4 h-4 ml-4" />
                  <span>{userData.contact.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => router.push('/pro-search')}>Find Professionals</Button>
      </div>

      {/*Stats Grid*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold">${clientData.usageStats.moneySpent}</p>
            </div>
            <div>
              <p className="text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold">{clientData.usageStats.completedOrders}</p>
            </div>
            <div>
              <p className="text-gray-600">Average Rating Given</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold mr-2">
                  {clientData.usageStats.averageRatingGiven.toFixed(1)}
                </p>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ranking</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Current Level</p>
              <p className="text-2xl font-bold">{clientData.ranking.level}</p>
            </div>
            <div>
              <p className="text-gray-600">Points</p>
              <p className="text-2xl font-bold">{clientData.ranking.points}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Email Status</p>
              <p className="text-lg font-semibold">
                {userData.contact.emailVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Phone Status</p>
              <p className="text-lg font-semibold">
                {userData.contact.phoneVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}