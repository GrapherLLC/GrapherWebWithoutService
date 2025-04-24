'use client'

import { ProfessionalProfileProvider } from '@/contexts/ProfessionalProfileContext'

export default function ProSignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProfessionalProfileProvider>
      {children}
    </ProfessionalProfileProvider>
  )
} 