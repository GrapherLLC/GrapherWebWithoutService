import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// Generate a unique image ID for storage
export const generateImageId = (userId: string): string => {
  return `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export async function uploadProfilePicture(userId: string, file: File) {
  try {
    const imageId = generateImageId(userId)
    const storageRef = ref(getStorage(), `profile-pictures/${userId}/${imageId}`)
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return { imageId, downloadURL }
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    throw error
  }
}

export async function getPictureURL(path: string) {
  try {
    const storageRef = ref(getStorage(), path);
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error('Error getting picture URL:', error)
    throw error
  }
}

export async function uploadCoverPicture(userId: string, file: File) {
  try {
    const imageId = generateImageId(userId)
    const storageRef = ref(getStorage(), `profile-pictures/${userId}/cover/${imageId}`)
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return { imageId, downloadURL }
  } catch (error) {
    console.error('Error uploading cover picture:', error)
    throw error
  }
}

export async function uploadPortfolioFile(userId: string, file: File) {
  try {
    const fileId = generateImageId(userId)
    const storageRef = ref(getStorage(), `portfolios/${userId}/${fileId}`)
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return { fileId, downloadURL }
  } catch (error) {
    console.error('Error uploading portfolio file:', error)
    throw error
  }
}

export async function deleteFile(path: string) {
  try {
    const fileRef = ref(getStorage(), path)
    await deleteObject(fileRef)
    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// Add a new function to delete portfolio files
export async function deletePortfolioFile(userId: string, fileId: string) {
  try {
    const path = `portfolios/${userId}/${fileId}`
    return await deleteFile(path)
  } catch (error) {
    console.error('Error deleting portfolio file:', error)
    throw error
  }
} 