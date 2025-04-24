'use client'

import { Star, Clock, CheckCircle, MapPin, Globe, Briefcase } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import VerificationBadge from './VerificationBadge'
import type { VerificationStatus } from '@/types/professional'

interface ProfessionalCardProps {
  id: string
  name: string
  title: string
  description: string
  price: number
  rating: number
  completedJobs: number
  category: string
  subcategory: string
  services: string[]
  availability: 'available' | 'busy' | 'offline'
  locations: {
    cities: string[]
    remote: boolean
    maxTravelDistance?: number // in miles
  }
  imageUrl?: string
  verification: VerificationStatus
}

export default function ProfessionalCard({
  id,
  name,
  title,
  description,
  price,
  rating,
  completedJobs,
  category,
  subcategory,
  services,
  availability,
  locations,
  imageUrl = 'https://picsum.photos/200',
  verification,
}: ProfessionalCardProps) {
  const availabilityColor = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-500',
  }

  const availabilityText = {
    available: 'Available Now',
    busy: 'Currently Busy',
    offline: 'Offline',
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden hover:border-primary-500 transition-colors">
      <div className="relative aspect-video">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 px-3 py-1.5 rounded-full bg-dark-bg/90 text-dark-text-primary text-sm font-medium">
          ${price}/hr
        </div>
        <div className={`absolute top-2 left-2 px-3 py-1.5 rounded-full bg-dark-bg/90 text-dark-text-primary text-sm font-medium flex items-center gap-1.5`}>
          <div className={`w-2 h-2 rounded-full ${availabilityColor[availability]}`} />
          <span>{availabilityText[availability]}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-dark-text-primary">{name}</h3>
              <p className="text-dark-text-secondary text-sm">{title}</p>
            </div>
            <VerificationBadge status={verification} />
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-3 text-sm">
          <div className="flex items-center text-dark-text-secondary">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center text-dark-text-secondary">
            <CheckCircle className="w-4 h-4 text-primary-500 mr-1" />
            <span>{completedJobs} jobs</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-dark-text-muted mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{category} • {subcategory}</span>
          </div>
          <p className="text-sm text-dark-text-secondary line-clamp-2">
            {description}
          </p>
        </div>

        {/* Location Information */}
        <div className="mb-4 space-y-1.5">
          {locations.cities.length > 0 && (
            <div className="flex items-center text-sm text-dark-text-secondary">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">
                {locations.cities.slice(0, 2).join(', ')}
                {locations.cities.length > 2 && ' + ' + (locations.cities.length - 2) + ' more'}
              </span>
            </div>
          )}
          {locations.remote && (
            <div className="flex items-center text-sm text-dark-text-secondary">
              <Globe className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>Available for remote work</span>
            </div>
          )}
          {locations.maxTravelDistance && (
            <div className="text-sm text-dark-text-muted flex items-center">
              <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>Willing to travel up to {locations.maxTravelDistance} miles</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {services.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-dark-input text-dark-text-secondary text-xs rounded-full whitespace-nowrap"
              >
                {service}
              </span>
            ))}
            {services.length > 3 && (
              <span className="px-2.5 py-1 text-dark-text-muted text-xs whitespace-nowrap">
                +{services.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <Link
            href={`/professionals/${id}`}
            className="flex-1 px-4 py-2 bg-primary-600 text-dark-text-primary text-center rounded-md hover:bg-primary-500 transition-colors"
          >
            View Profile
          </Link>
          <button
            className="px-4 py-2 border border-dark-border text-dark-text-secondary rounded-md hover:bg-dark-input transition-colors"
            title="Schedule a booking"
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 