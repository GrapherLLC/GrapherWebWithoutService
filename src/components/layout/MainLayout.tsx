'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Navbar from './Navbar'
import RoleToggle from '../common/RoleToggle'
import { auth } from '@/lib/firebase'

interface CustomClaims {
  role?: string
  profileComplete?: boolean
}

interface MainLayoutProps {
  children: React.ReactNode
  showAnnouncement?: boolean
}

export default function MainLayout({ children, showAnnouncement = false }: MainLayoutProps) {
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(showAnnouncement)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname() || ''

  // Check if we're on a dashboard page
  const isDashboardPage = pathname.startsWith('/dashboard')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult()
        const claims = tokenResult.claims as CustomClaims
        setUserRole(claims?.role || null)
      } else {
        setUserRole(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleModeChange = (mode: 'professional' | 'client') => {
    // Map of routes to redirect between professional and client views
    const routeMap = {
      '/dashboard/professional': '/dashboard/client',
      '/dashboard/client': '/dashboard/professional',
      // Add more route mappings as needed
    }

    // Get the corresponding route for the current path
    const newRoute = Object.entries(routeMap).find(([key]) => 
      pathname.startsWith(key)
    )

    if (newRoute) {
      // Replace the current route prefix with the new one
      const [currentPrefix, newPrefix] = newRoute
      const newPath = pathname.replace(currentPrefix, newPrefix)
      router.push(newPath)
    } else {
      // Default redirect if no specific mapping exists
      router.push(mode === 'professional' ? '/dashboard/professional' : '/dashboard/client')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text-primary">
      {isAnnouncementVisible && (
        <div className="bg-primary-700 text-dark-text-primary px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className="text-sm">
              🎉 Welcome to {process.env.NEXT_PUBLIC_COMPANY_NAME}! Explore our new features and get started today.
            </p>
            <button
              onClick={() => setIsAnnouncementVisible(false)}
              className="text-dark-text-primary hover:text-primary-100"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <Navbar />
      {userRole === 'both' && isDashboardPage && (
        <div className="sticky top-16 z-40 bg-dark-bg/80 backdrop-blur-sm border-b border-dark-border py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RoleToggle 
              onModeChange={handleModeChange}
              initialMode={pathname.includes('/professional') ? 'professional' : 'client'}
            />
          </div>
        </div>
      )}
      <main className="flex-grow pt-16">
        {children}
      </main>
    </div>
  )
} 