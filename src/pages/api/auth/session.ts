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

  const { idToken } = req.body

  try {
    if (!idToken) {
      throw new Error('No ID token provided')
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn })

    // Set cookie options
    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    }

    // Set the session cookie
    res.setHeader(
      'Set-Cookie',
      `session=${sessionCookie}; Max-Age=${options.maxAge}; Path=${options.path}; HttpOnly; ${
        options.secure ? 'Secure;' : ''
      } SameSite=Lax`
    )

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Session creation error:', error)
    return res.status(401).json({ error: 'Invalid ID token' })
  }
} 