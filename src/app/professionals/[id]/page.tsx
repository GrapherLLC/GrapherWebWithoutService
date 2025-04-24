'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { MapPin, Clock, Globe, Camera, Link as LinkIcon } from 'lucide-react'
import type { ProfessionalProfile } from '@/types/professional'

export default function ProfessionalProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!id) {
        setError('Invalid profile ID')
        setLoading(false)
        return
      }

      try {
        const docRef = doc(db, 'profilesProfessionals', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfessionalProfile)
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
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-dark-text-secondary">Loading profile...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error || 'Profile not found'}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-dark-card rounded-lg overflow-hidden">
        <div className="relative h-48 w-full">
          {profile.coverImage ? (
            <Image
              src={profile.coverImage.url}
              alt="Cover"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-dark-input" />
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex items-start space-x-4">
              <div className="relative -mt-16 w-32 h-32">
                <Image
                  src={profile.photoURL || '/default-avatar.png'}
                  alt={profile.displayName}
                  fill
                  className="rounded-lg object-cover border-4 border-dark-card"
                />
              </div>
              <div className="pt-4">
                <h1 className="text-2xl font-bold text-dark-text-primary">
                  {profile.displayName}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-dark-text-secondary">
                  {profile.location && (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location.city}, {profile.location.country}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-dark-input text-dark-text-secondary text-sm rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                  {profile.services.length > 3 && (
                    <span className="text-dark-text-muted text-sm">
                      +{profile.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <p className="text-dark-text-secondary">{profile.bio}</p>
          </div>

          {/* Availability Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-dark-text-secondary">
              <Clock className="w-5 h-5 text-primary-500" />
              <span>Response time: {profile.availability.responseTime}</span>
            </div>
            {profile.availability.remoteWork && (
              <div className="flex items-center gap-2 text-dark-text-secondary">
                <Globe className="w-5 h-5 text-primary-500" />
                <span>Available for remote work</span>
              </div>
            )}
            {profile.availability.travel.willingToTravel && (
              <div className="flex items-center gap-2 text-dark-text-secondary">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span>Willing to travel up to {profile.availability.travel.maxDistanceKm}km</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="mt-8 bg-dark-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-6">Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.portfolio.files.map((file) => (
            <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={file.url}
                alt="Portfolio item"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {profile.portfolio.externalLinks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-dark-text-primary mb-4">External Links</h3>
            <div className="space-y-2">
              {profile.portfolio.externalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-400 hover:text-primary-300"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>{link.platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Equipment Section */}
      <div className="mt-8 bg-dark-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-6">Equipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.equipment.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-dark-text-secondary">
              <Camera className="w-5 h-5 text-primary-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 