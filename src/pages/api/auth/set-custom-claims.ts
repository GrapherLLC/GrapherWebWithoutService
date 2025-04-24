import { NextApiRequest, NextApiResponse } from 'next'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { uid, role, profileComplete } = req.body

    if (!uid || !role) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const db = admin.firestore()
    const userRef = db.collection('users').doc(uid)

    // Update user document with role
    await userRef.update({
      role: {
        client: role === 'client' || role === 'both',
        professional: role === 'professional' || role === 'both'
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role,
      profileComplete: profileComplete || false,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error setting custom claims:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 