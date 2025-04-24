'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithGoogle } from '@/lib/firebase/auth'
import AuthLayout from '@/components/auth/AuthLayout'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = useCallback(async () => {
    // If already loading, prevent multiple clicks
    if (loading) return

    setError(null)
    setLoading(true)

    try {
      const result = await signInWithGoogle()

      // Handle popup closed by user - immediately reset loading state
      if (result.error === 'auth/popup-closed-by-user' || 
          result.error === 'auth/cancelled-popup-request') {
        setLoading(false)
        return // Don't show error for user-initiated cancellation
      }

      if (!result.success) {
        setError(result.error || 'Failed to sign in')
        return
      }

      // Handle redirection based on user status
      if (result.isNewUser || !result.user?.isSetupCompleted) {
        console.log('New user detected, redirecting to profile setup...')
        await router.push('/profile/edit?setup=true')
      } else if (!result.clientProfile?.isSetupCompleted) {
        console.log('Existing user with incomplete profile, redirecting to role selection...')
        await router.push('/auth/select-role')
      } else {
        const redirectTo = searchParams?.get('redirectTo')
        console.log('Existing user with complete profile, redirecting to:', redirectTo || '/dashboard/client')
        await router.push(redirectTo || '/dashboard/client')
      }
    } catch (error: unknown) {
      console.error('Sign in error:', error)
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string }
        if (firebaseError.code === 'auth/popup-closed-by-user' || 
            firebaseError.code === 'auth/cancelled-popup-request') {
          // Don't show error for user-initiated cancellation
          return
        }
        setError(firebaseError.message || 'An error occurred during sign in')
      } else {
        setError('An error occurred during sign in')
      }
    } finally {
      setLoading(false)
    }
  }, [loading, router, searchParams])

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={`Welcome to ${process.env.NEXT_PUBLIC_COMPANY_NAME}! Please sign in with your Google account.`}
    >
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex justify-center items-center py-3 px-4 bg-dark-input border border-dark-border rounded-md text-sm font-medium text-dark-text-primary hover:bg-dark-card transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {!loading && (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="flex items-center">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-dark-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Continue with Google'
            )}
          </span>
        </button>
      </div>
    </AuthLayout>
  )
} 