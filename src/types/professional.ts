import { Location } from './common/location'
import { Ranking } from './common/ranking'
import { ServiceType as ProfessionalServiceType } from './common/services'


// Portfolio File
export interface PortfolioFile {
  id: string
  url: string
  type: 'image'
  mimeType?: string
  thumbnailUrl?: string
}

// External Link
export interface ProfileExternalLink {
  platform: string
  url: string
}

// Travel Settings
export interface TravelSettings {
  willingToTravel: boolean
  maxDistanceKm: number
}

// Professional Usage Stats
export interface ProfessionalUsageStats {
  moneyEarned: number
  completedOrders: number
  reviewsReceived: number
  averageRating: number
}

// ResponseTime
export const ProfileResponseTimeValues = [
  'Within 1 hour',
  'Within 4 hours',
  'Within 8 hours',
  'Within 12 hours',
  'Within 24 hours',
  'Within 3 days',
  'Within a week',
] as const;

// ResponseTimeType
export type ProfileResponseTimeType = (typeof ProfileResponseTimeValues)[number];

export interface ProfessionalAvailability {
  remoteWork: boolean
  responseTime: ProfileResponseTimeType
  locations: Location[]
  travel: TravelSettings
}

// Professional Profile
export interface ProfessionalProfile {
  uid: string
  bio: string
  skills: string[]
  services: ProfessionalServiceType[]
  coverImage?: {
    id: string
    url: string
  }
  portfolio: {
    files: PortfolioFile[]
    externalLinks: ProfileExternalLink[]
  }
  experience: {
    years: number
    completedProjects: number
  }
  availability: ProfessionalAvailability
  equipment: string[]
  usageStats: ProfessionalUsageStats
  ranking: Ranking
  createdAt: string
  isSetupCompleted: boolean
  isDeleted?: boolean
  deletedAt?: string
}
