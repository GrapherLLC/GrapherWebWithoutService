import { Location } from './common/location'

export interface UserContact {
  countryCode?: string | null
  phone?: string | null
  email?: string
  emailVerified: boolean
  phoneVerified: boolean
}

export interface UserRole {
  client: boolean
  professional: boolean
  admin?: boolean
}

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string | null
  profilePictureId?: string | null
  createdAt: string
  lastLogin: string
  updatedAt?: string
  contact: UserContact
  role: UserRole
  location?: Location
  isSetupCompleted: boolean
  isActive?: boolean
  isDeleted?: boolean
  deletedAt?: string
} 