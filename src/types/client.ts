import { Ranking } from './common/ranking'

export interface Contact {
  phone?: string
  emailVerified: boolean
  phoneVerified: boolean
}

// Client Usage Stats
export interface ClientUsageStats {
  moneySpent: number
  completedOrders: number
  reviewsGiven: number
  averageRatingGiven: number
}

// Client Profile
export interface ClientProfile {
  uid: string
  createdAt: string
  usageStats: ClientUsageStats
  ranking: Ranking
  isSetupCompleted: boolean
  isDeleted?: boolean
  deletedAt?: string
} 