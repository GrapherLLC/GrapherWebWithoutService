'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, LogOut, User as UserIcon, Bell, MessageSquare, Calendar } from 'lucide-react'
import { auth, logAnalyticsEvent } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import Image from 'next/image'

interface NavItem {
  label: string
  href: string
  roles?: ('client' | 'professional' | 'both')[]
}

const navItems: NavItem[] = [
  { label: 'Browse Pros', href: '/browse-pros', roles: ['client', 'both'] },
  { label: 'Post a Job', href: '/post-job', roles: ['client', 'both'] },
  { label: 'My Jobs', href: '/dashboard/professional', roles: ['professional', 'both'] },
  { label: 'How it Works', href: '/how-it-works' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const { claims } = await user.getIdTokenResult()
        setUserRole(claims.role as string)
      } else {
        setUserRole(null)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      
      // Clear the session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      // Log sign out event
      logAnalyticsEvent('logout')

      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || // Show items with no role restriction
    (userRole && item.roles.includes(userRole as 'client' | 'professional' | 'both'))
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/grapher-500x130.svg"
                alt="home Logo"
                width={150}
                height={42}
                className="h-auto"
                priority
              />
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Icon */}
                <button className="p-2 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input rounded-full">
                  <Bell size={20} />
                </button>

                {/* Messages Icon */}
                <Link
                  href="/messages"
                  className="p-2 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input rounded-full"
                >
                  <MessageSquare size={20} />
                </Link>

                {/* User Menu with ref */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary"
                  >
                    <span className="max-w-[150px] truncate">{user.email}</span>
                    <ChevronDown size={16} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-1 bg-dark-card rounded-md shadow-lg ring-1 ring-dark-border">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-input hover:text-dark-text-primary"
                      >
                        <UserIcon size={16} className="mr-2" />
                        Profile
                      </Link>
                      <Link
                        href={userRole === 'client' ? '/dashboard/client' : '/dashboard/professional'}
                        className="flex items-center px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-input hover:text-dark-text-primary"
                      >
                        <Calendar size={16} className="mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-input hover:text-dark-text-primary"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-card">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-dark-border">
            {user ? (
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-base font-medium text-dark-text-muted">
                  {user.email}
                </div>
                <Link
                  href="/messages"
                  className="block px-3 py-2 rounded-md text-base font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input"
                >
                  Messages
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input"
                >
                  Profile
                </Link>
                <Link
                  href={userRole === 'client' ? '/dashboard/client' : '/dashboard/professional'}
                  className="block px-3 py-2 rounded-md text-base font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="px-2">
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors text-center"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 