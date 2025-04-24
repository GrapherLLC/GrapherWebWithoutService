'use client'

import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: React.ReactNode
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-3xl font-bold text-primary-300">{process.env.NEXT_PUBLIC_COMPANY_NAME}</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-text-primary">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-dark-text-secondary">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-dark-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-dark-border">
          <style jsx global>{`
            .auth-input {
              color: black !important;
            }
          `}</style>
          {children}
        </div>
      </div>
    </div>
  )
} 