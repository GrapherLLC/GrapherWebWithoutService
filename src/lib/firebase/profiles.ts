import { db } from '@/lib/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  DocumentReference,
} from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { reload } from 'firebase/auth'
import { getStorage, ref, deleteObject } from 'firebase/storage'
import type { User } from '@/types/user'
import type { ClientProfile } from '@/types/client'
import type { ProfessionalProfile } from '@/types/professional'
import type { BasicInfoFormData } from '@/app/pro-signup/create-profile/basic-info/page'
import { updateUserRole } from './auth'
import { removeUndefinedFields } from './firebaseUtils'

// Types for profile operations
// Note: This interface is used for documentation purposes
// and to define the expected shape of data in functions
interface PortfolioData {
  files: ProfessionalProfile['portfolio']['files']
  externalLinks: ProfessionalProfile['portfolio']['externalLinks']
}

interface AvailabilityData {
  remoteWork: boolean
  responseTime: string
  locations: ProfessionalProfile['availability']['locations']
  travel: ProfessionalProfile['availability']['travel']
}

// User Profile Operations
export const createUser = async (userData: Partial<User> & { uid: string, email: string }): Promise<void> => {
  const userRef = doc(db, 'users', userData.uid)
  
  const baseUser: Partial<User> = {
    uid: userData.uid,
    email: userData.email,
    displayName: userData.displayName || undefined,
    photoURL: userData.photoURL || undefined,
    contact: {
      emailVerified: userData.contact?.emailVerified || false,
      phoneVerified: userData.contact?.phoneVerified || false,
      phone: userData.contact?.phone || undefined,
    },
    location: userData.location || undefined,
    role: {
      client: true,
      professional: false,
    },
    isSetupCompleted: false,
  }

  const userWithTimestamps = {
    ...baseUser,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  }

  await setDoc(userRef, userWithTimestamps)
}

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    return userSnap.data() as User
  }
  
  return null
}

export const updateUser = async (uid: string, userData: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  const cleanUserData = removeUndefinedFields(userData)
  await updateDoc(userRef, cleanUserData)
}

export const updateLastLogin = async (uid: string): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    lastLogin: serverTimestamp()
  })
}

export const syncEmailVerificationState = async (uid: string): Promise<void> => {
  if (auth.currentUser) {
    await reload(auth.currentUser)
    const isEmailVerified = auth.currentUser.emailVerified

    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      verified: isEmailVerified,
      contact: {
        emailVerified: isEmailVerified,
      },
      lastLogin: serverTimestamp()
    })
  }
}

// Professional Profile Operations
export async function getOrCreateProfessionalProfile(uid: string): Promise<{ profile: ProfessionalProfile, isNew: boolean }> {
  const profileRef = doc(db, 'profilesProfessionals', uid)
  const profileSnap = await getDoc(profileRef)

  if (!profileSnap.exists()) {
    const initialProfile = await createProfessionalProfile(uid);
    return { profile: initialProfile, isNew: true }
  }

  return { 
    profile: profileSnap.data() as ProfessionalProfile, 
    isNew: false 
  }
}

export async function updateProfessionalProfile(uid: string, data: Partial<ProfessionalProfile>): Promise<void> {
  const profileRef = doc(db, 'profilesProfessionals', uid)
  await updateDoc(profileRef, data)
}

export async function updateProfessionalBasicInfo(uid: string, formData: BasicInfoFormData): Promise<void> {
  const existingProfile = await getProfessionalProfile(uid)
  const profileData = {
    ...existingProfile,
    uid,
    bio: formData.bio,
    skills: formData.skills,
    services: formData.services,
    equipment: formData.equipment,
    experience: formData.experience,
    coverImage: formData.coverImage || null,
    // Only set these if they don't exist
    portfolio: existingProfile?.portfolio || {
      files: [],
      externalLinks: []
    },
    availability: existingProfile?.availability || {
      remoteWork: false,
      responseTime: '24 hours',
      locations: [],
      travel: {
        willingToTravel: false,
        maxDistanceKm: 0
      }
    },
    usageStats: existingProfile?.usageStats || {
      moneyEarned: 0,
      completedOrders: 0,
      reviewsReceived: 0,
      averageRating: 0
    },
    ranking: existingProfile?.ranking || {
      level: 'Bronze',
      points: 0
    }
  }

  await setDoc(doc(db, 'profilesProfessionals', uid), profileData)
}

export async function updateProfessionalPortfolio(uid: string, portfolioData: PortfolioData): Promise<void> {
  const profileRef = doc(db, 'profilesProfessionals', uid)
  await updateDoc(profileRef, {
    portfolio: portfolioData
  })
}

export async function updateProfessionalAvailability(uid: string, availabilityData: AvailabilityData): Promise<void> {
  const profileRef = doc(db, 'profilesProfessionals', uid)
  await updateDoc(profileRef, {
    availability: availabilityData
  })
}

export async function completeProfessionalProfile(uid: string): Promise<void> {
  try {
    console.log(`Completing professional profile for user ${uid}`);
    
    // Update professional profile
    const profileRef = doc(db, 'profilesProfessionals', uid)
    await updateDoc(profileRef, {
      isSetupCompleted: true,
      updatedAt: serverTimestamp()
    })
    
    console.log('Updated professional profile isSetupCompleted to true');

    // Update user role in Firestore - THIS IS THE ONLY PLACE where role.professional should be set to true
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      'role.professional': true,
      updatedAt: serverTimestamp()
    })
    
    console.log('Updated user role.professional to true');

    // Update user role in auth claims
    await updateUserRole(uid, 'professional', true)
    
    console.log('Updated user auth claims with professional role');
  } catch (error) {
    console.error('Error completing professional profile:', error);
    throw error;
  }
}

export async function getProfessionalProfile(uid: string): Promise<ProfessionalProfile | null> {
  const profileRef = doc(db, 'profilesProfessionals', uid)
  const profileSnap = await getDoc(profileRef)
  
  if (!profileSnap.exists()) {
    return null
  }
  
  return profileSnap.data() as ProfessionalProfile
}

export async function updateProfessionalCoverImage(uid: string, coverImage: { id: string, url: string } | undefined): Promise<void> {
  try {
    const profileRef = doc(db, 'profilesProfessionals', uid)
    
    // Update only the coverImage field
    await updateDoc(profileRef, {
      coverImage: coverImage || null
    })
    
    console.log('Cover image updated in professional profile')
  } catch (error) {
    console.error('Error updating cover image in profile:', error)
    throw error
  }
}

// Client Profile Operations
export async function getOrCreateClientProfile(uid: string): Promise<{ profile: ClientProfile, isNew: boolean }> {
  const profileRef = doc(db, 'profilesClients', uid)
  const profileSnap = await getDoc(profileRef)

  if (!profileSnap.exists()) {
    const initialProfile: ClientProfile = {
      uid,
      createdAt: new Date().toISOString(),
      usageStats: {
        moneySpent: 0,
        completedOrders: 0,
        reviewsGiven: 0,
        averageRatingGiven: 0
      },
      ranking: {
        level: 'Bronze',
        points: 0
      },
      isSetupCompleted: false
    }

    await setDoc(profileRef, initialProfile)
    return { profile: initialProfile, isNew: true }
  }

  return { 
    profile: profileSnap.data() as ClientProfile, 
    isNew: false 
  }
}

export async function updateClientProfile(uid: string, data: Partial<ClientProfile>): Promise<void> {
  const profileRef = doc(db, 'profilesClients', uid)
  await updateDoc(profileRef, data)
}

export async function getClientProfile(uid: string): Promise<ClientProfile | null> {
  const profileRef = doc(db, 'profilesClients', uid)
  const profileSnap = await getDoc(profileRef)
  
  if (!profileSnap.exists()) {
    return null
  }
  
  return profileSnap.data() as ClientProfile
}

// Helper functions
export const getUserRef = (uid: string): DocumentReference => {
  return doc(db, 'users', uid)
}

// Delete cover image from storage
export const deleteCoverImage = async (userId: string, imageId: string): Promise<void> => {
  if (!imageId) return
  
  try {
    const storage = getStorage()
    const coverImageRef = ref(storage, `profile-pictures/${userId}/cover/${imageId}`)
    await deleteObject(coverImageRef)
    console.log('Successfully deleted cover image from storage')
  } catch (error) {
    console.error('Error deleting cover image:', error)
  }
}

// Delete portfolio image from storage
export const deletePortfolioImage = async (userId: string, imageId: string): Promise<void> => {
  if (!imageId) return

  try {
    const storage = getStorage()
    const fileRef = ref(storage, `portfolios/${userId}/${imageId}`)

    await deleteObject(fileRef)
    console.log(`Deleted portfolio file: ${imageId}`)
    const portfolioImageRef = ref(storage, `portfolios/${userId}/${imageId}_thumb`)

    await deleteObject(portfolioImageRef)
    console.log(`Deleted thumbnail: ${imageId}_thumb`)
    console.log('Successfully deleted portfolio image from storage')
  } catch (error) {
    console.error('Error deleting portfolio image:', error)
  }
}

export async function createProfessionalProfile(uid: string): Promise<ProfessionalProfile> {
  try {
    const initialProfile: ProfessionalProfile = {
      uid,
      bio: '',
      skills: [],
      services: ['Photography'],
      portfolio: {
      files: [],
      externalLinks: []
    },
    experience: {
      years: 0,
      completedProjects: 0
    },
    equipment: [],
    availability: {
      remoteWork: false,
      responseTime: 'Within 24 hours',
      locations: [],
      travel: {
        willingToTravel: false,
        maxDistanceKm: 0
      }
    },
    usageStats: {
      moneyEarned: 0,
      completedOrders: 0,
      reviewsReceived: 0,
      averageRating: 0
    },
    ranking: {
      level: 'Bronze',
      points: 0
    },
    createdAt: new Date().toISOString(),
    isSetupCompleted: false
  }

    const profileRef = doc(db, 'profilesProfessionals', uid)
    await setDoc(profileRef, initialProfile)   
    console.log('Successfully creating professional profile')
    return initialProfile 
  } catch (error) {
    console.error('Error creating professional profile:', error)
    throw error
  }
}

// Reset professional profile by deleting it and creating a new default one
export async function resetProfessionalProfile(uid: string): Promise<ProfessionalProfile> {
  try {
    console.log(`Resetting professional profile for user ${uid}`)
    
    // 1. Get the current profile to find images to delete
    const currentProfile = await getProfessionalProfile(uid)
    
    // 2. Delete cover image if exists
    if (currentProfile?.coverImage?.id) {
      await deleteCoverImage(uid, currentProfile.coverImage.id)
    }
    
    // 3. Delete portfolio images
    if (currentProfile?.portfolio?.files?.length) {
      for (const file of currentProfile.portfolio.files) {
        if (file.id) {
          try {
            await deletePortfolioImage(uid, file.id);
          } catch (err) {
            console.warn(`Error deleting portfolio file ${file.id}:`, err)
          }
        }
      }
    }
    
    // 4. Create new default professional profile
    const initialProfile = await createProfessionalProfile(uid);
    return initialProfile
  } catch (error) {
    console.error('Error resetting professional profile:', error)
    throw error
  }
}

export async function saveProfessionalProfileStep(uid: string, stepData: Partial<ProfessionalProfile>): Promise<void> {
  try {
    const profileRef = doc(db, 'profilesProfessionals', uid)
    const profileSnap = await getDoc(profileRef)
    
    if (!profileSnap.exists()) {
      // Create a new profile if it doesn't exist
      await createProfessionalProfile(uid);
    }
    
    // Update only the specific fields provided in stepData
    const cleanStepData = removeUndefinedFields(stepData);
    await updateDoc(profileRef, cleanStepData);
  } catch (error) {
    console.error('Error saving professional profile step:', error);
    throw error;
  }
} 