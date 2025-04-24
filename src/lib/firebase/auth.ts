import { auth, googleProvider, logAnalyticsEvent } from './index'
import { signInWithPopup, signOut, deleteUser } from 'firebase/auth'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage'
import type { User } from '@/types/user'
import type { ClientProfile } from '@/types/client'

interface SignInResult {
  success: boolean
  user: User | null
  isNewUser: boolean
  error?: string
  clientProfile?: ClientProfile | null
}

export async function signInWithGoogle(): Promise<SignInResult> {
  try {
    // 1. Authenticate with Google
    let result;
    try {
      result = await signInWithPopup(auth, googleProvider)
    } catch (error: unknown) {
      // Immediately handle popup closure
      if (error && 
          typeof error === 'object' && 
          'code' in error && 
          (error.code === 'auth/popup-closed-by-user' || 
           error.code === 'auth/cancelled-popup-request')) {
        return {
          success: false,
          user: null,
          isNewUser: false,
          clientProfile: null,
          error: error.code as string
        }
      }
      throw error // Re-throw other errors
    }

    const firebaseUser = result.user

    // 2. Get or create user document
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    const isNewUser = !userDoc.exists()

    let userData: User|null = null;
    if (isNewUser){
      userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName!,
        photoURL: firebaseUser.photoURL,
        profilePictureId: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        contact: {
          emailVerified: firebaseUser.emailVerified,
          phoneVerified: false,
          phone: null
        },
        role: {
          client: true,
          professional: false
        },
        isSetupCompleted: false
      }
      await setDoc(doc(db, 'users', firebaseUser.uid), userData, { merge: true })
    } else {
      userData = userDoc.data() as User;
    }

    const clientProfileDoc = await getDoc(doc(db, 'profilesClients', firebaseUser.uid))
    const isClientProfileExists = clientProfileDoc.exists();
    let clientData: ClientProfile | null = null;
    if (!isClientProfileExists) {
      clientData = {
        uid: firebaseUser.uid,
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
      await setDoc(doc(db, 'profilesClients', firebaseUser.uid), clientData)
    } else {
      clientData = clientProfileDoc.data() as ClientProfile;
    }

    const idToken = await firebaseUser.getIdToken()
    await createSession(idToken)

    logAnalyticsEvent('login', {
      method: 'google',
      isNewUser
    })

    return {
      success: true,
      user: userData,
      isNewUser,
      clientProfile: clientData
    }
  } catch (error) {
    console.error('Sign in error:', error)
    logAnalyticsEvent('login_error', {
      error_message: error instanceof Error ? error.message : 'Unknown error',
      method: 'google'
    })
    return {
      success: false,
      user: null,
      isNewUser: false,
      clientProfile: null,
      error: error instanceof Error ? error.message : 'Failed to sign in'
    }
  }
}

async function createSession(idToken: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  })

  if (!response.ok) {
    throw new Error('Failed to create session')
  }
}

export async function signOutUser(): Promise<{ success: boolean, error?: string }> {
  try {
    await signOut(auth)
    await fetch('/api/auth/logout', { method: 'POST' })
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out'
    }
  }
}

export async function deleteAccount() {
  const user = auth.currentUser
  if (!user) throw new Error('No user found')

  try {
    // 1. Get user data and profile data
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userData = userDoc.data()
    if (!userData) throw new Error('User data not found')

    // Get professional and client profiles if they exist
    let proData = null
    let clientData = null
    
    if (userData.role.professional) {
      const proDoc = await getDoc(doc(db, 'profilesProfessionals', user.uid))
      if (proDoc.exists()) {
        proData = proDoc.data()
      }
    }
    
    if (userData.role.client) {
      const clientDoc = await getDoc(doc(db, 'profilesClients', user.uid))
      if (clientDoc.exists()) {
        clientData = clientDoc.data()
      }
    }

    // 2. Delete all storage files
    const storage = getStorage()
    try {
      // Delete all profile pictures (including cover photos)
      const profilePicsRef = ref(storage, `profile-pictures/${user.uid}`)
      try {
        const profilePicsList = await listAll(profilePicsRef)
        
        // Delete all files in the profile pictures directory
        for (const fileRef of profilePicsList.items) {
          await deleteObject(fileRef)
          console.log(`Deleted profile picture: ${fileRef.fullPath}`)
        }
        
        // Delete all files in subdirectories (like cover)
        for (const prefixRef of profilePicsList.prefixes) {
          const subDirFiles = await listAll(prefixRef)
          for (const fileRef of subDirFiles.items) {
            await deleteObject(fileRef)
            console.log(`Deleted profile picture: ${fileRef.fullPath}`)
          }
        }
      } catch (err) {
        console.warn('Profile pictures deletion error:', err)
      }

      // Delete portfolio files if professional
      if (proData) {
        const portfolioRef = ref(storage, `portfolios/${user.uid}`)
        try {
          const portfolioFiles = await listAll(portfolioRef)
          for (const fileRef of portfolioFiles.items) {
            await deleteObject(fileRef)
            console.log(`Deleted portfolio file: ${fileRef.fullPath}`)
            
            // Try to delete thumbnail if exists
            try {
              const thumbRef = ref(storage, `${fileRef.fullPath}_thumb`)
              await deleteObject(thumbRef)
              console.log(`Deleted thumbnail: ${fileRef.fullPath}_thumb`)
            } catch (err) {
              console.warn(`No thumbnail found for: ${fileRef.fullPath}`, err)
            }
          }
        } catch (err) {
          console.warn('Portfolio files deletion error:', err)
        }
      }

      // Delete job files if client
      if (clientData) {
        const jobFilesRef = ref(storage, `job-files/${user.uid}`)
        try {
          const jobFiles = await listAll(jobFilesRef)
          for (const fileRef of jobFiles.items) {
            await deleteObject(fileRef)
            console.log(`Deleted job file: ${fileRef.fullPath}`)
          }
        } catch (err) {
          console.warn('Job files deletion error:', err)
        }
      }
    } catch (err) {
      console.warn('Storage cleanup errors:', err)
    }

    // 3. Update Firestore documents to mark as deleted
    const now = new Date().toISOString()
    
    try {
      // Update user document
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        photoURL: null,
        profilePictureId: null,
        deletedAt: now,
        isDeleted: true,
        role: {
          client: false,
          professional: false
        }
      }, { merge: true })

      // Update professional profile if exists
      if (proData) {
        await setDoc(doc(db, 'profilesProfessionals', user.uid), {
          ...proData,
          coverImage: null,
          portfolio: {
            files: [],
            externalLinks: proData.portfolio?.externalLinks || []
          },
          deletedAt: now,
          isDeleted: true,
          availability: {
            ...proData.availability,
            remoteWork: false,
            locations: []
          }
        }, { merge: true })
      }

      // Update client profile if exists
      if (clientData) {
        await setDoc(doc(db, 'profilesClients', user.uid), {
          ...clientData,
          deletedAt: now,
          isDeleted: true
        }, { merge: true })
      }

      // Mark related documents as deleted
      const relatedCollections = ['bookings', 'reviews', 'messages', 'notifications', 'jobs', 'payments']
      
      for (const collectionName of relatedCollections) {
        try {
          const docRef = doc(db, collectionName, user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            await setDoc(docRef, {
              ...docSnap.data(),
              deletedAt: now,
              isDeleted: true
            }, { merge: true })
          }
        } catch (err) {
          console.warn(`Error updating ${collectionName} document:`, err)
        }
      }

    } catch (err) {
      console.warn('Firestore update errors:', err)
    }

    // 4. Delete the Firebase Auth user account
    await deleteUser(user)

    // 5. Clear session cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting account:', error)
    throw error
  }
}

export async function updateUserRole(uid: string, role: 'client' | 'professional' | 'both', profileComplete: boolean = false): Promise<void> {
  try {
    const response = await fetch('/api/auth/set-custom-claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        role,
        profileComplete,
      }),
    })

    if (!response.ok) throw new Error('Failed to update role')

    // Force token refresh to get new claims
    const user = auth.currentUser
    if (user) {
      await user.getIdToken(true)
    }
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
} 