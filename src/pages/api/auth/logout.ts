import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Clear the session cookie
  res.setHeader(
    'Set-Cookie',
    'session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax'
  )

  return res.status(200).json({ success: true })
} 