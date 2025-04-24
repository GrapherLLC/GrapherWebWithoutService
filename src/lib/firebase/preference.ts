import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { EmailNotification } from "@/types/notification"
import { removeUndefinedFields } from './firebaseUtils';


const emailNotificationCollectionName = 'emailNotification';

export const createEmailNotification = async (email: string, name: string ): Promise<void> => {
  const userRef = doc(db, emailNotificationCollectionName, email)

  const baseEmailNotification: EmailNotification = {
    email: email,
    name: name,
    newsLetterProduct: true,
    isActive: true,
  }

  await setDoc(userRef, baseEmailNotification)
}

export const getEmailNotification = async (email: string): Promise<EmailNotification | null> => {
  const ref = doc(db, emailNotificationCollectionName, email)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    return snap.data() as EmailNotification
  }

  return null
}

export const updateEmailNotification = async (email: string, data: Partial<EmailNotification>): Promise<void> => {
  const ref = doc(db, emailNotificationCollectionName, email)
  const cleanData = removeUndefinedFields(data)
  await updateDoc(ref, cleanData)
}