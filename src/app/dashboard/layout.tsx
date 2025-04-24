'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Only redirect if we're on the root dashboard page
        if (pathname === '/dashboard') {
          // Get the user's claims
          const { claims } = await user.getIdTokenResult()
          const role = claims.role as string | undefined

          // Redirect to appropriate dashboard
          if (role === 'client') {
            router.push('/dashboard/client')
          } else if (role === 'professional' || role === 'both') {
            router.push('/dashboard/professional')
          } else {
            // If no role is set, redirect to role selection
            router.push('/auth/select-role')
          }
        }
      } else {
        // If not logged in, redirect to sign in
        router.push('/auth/signin')
      }
    })

    return () => unsubscribe()
  }, [router, pathname])

  return (
    <MainLayout>
      <div className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </MainLayout>
  )
} 