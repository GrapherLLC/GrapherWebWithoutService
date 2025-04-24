'use client'

import { Shield, ShieldCheck } from 'lucide-react'
import type { VerificationStatus } from '@/types/professional'

interface VerificationBadgeProps {
  status: VerificationStatus
  showDetails?: boolean
}

export default function VerificationBadge({ status, showDetails = false }: VerificationBadgeProps) {
  const getBadgeColor = () => {
    switch (status.verificationBadge) {
      case 'pro_verified':
        return 'bg-primary-600 text-white'
      case 'verified':
        return 'bg-green-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getBadgeIcon = () => {
    switch (status.verificationBadge) {
      case 'pro_verified':
        return <ShieldCheck className="w-4 h-4" />
      case 'verified':
        return <Shield className="w-4 h-4" />
      default:
        return null
    }
  }

  const getBadgeText = () => {
    switch (status.verificationBadge) {
      case 'pro_verified':
        return 'Pro Verified'
      case 'verified':
        return 'Verified'
      default:
        return 'Unverified'
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${getBadgeColor()}`}>
        {getBadgeIcon()}
        <span className="text-sm font-medium">{getBadgeText()}</span>
      </div>
      
      {showDetails && (
        <div className="mt-3 space-y-2">
          <div className="text-sm text-dark-text-secondary">
            <h4 className="font-medium mb-2">Verification Status:</h4>
            <ul className="space-y-1">
              <li className={`flex items-center gap-2 ${status.isPhoneVerified ? 'text-green-500' : 'text-gray-500'}`}>
                {status.isPhoneVerified ? '✓' : '○'} Phone Number
              </li>
              <li className={`flex items-center gap-2 ${status.isEmailVerified ? 'text-green-500' : 'text-gray-500'}`}>
                {status.isEmailVerified ? '✓' : '○'} Email
              </li>
              <li className={`flex items-center gap-2 ${status.isLocationVerified ? 'text-green-500' : 'text-gray-500'}`}>
                {status.isLocationVerified ? '✓' : '○'} Location
              </li>
              <li className={`flex items-center gap-2 ${status.isPaymentVerified ? 'text-green-500' : 'text-gray-500'}`}>
                {status.isPaymentVerified ? '✓' : '○'} Payment Method
              </li>
              <li className={`flex items-center gap-2 ${status.isSecurityDepositSetup ? 'text-green-500' : 'text-gray-500'}`}>
                {status.isSecurityDepositSetup ? '✓' : '○'} Security Deposit
              </li>
              <li className={`flex items-center gap-2 ${status.isCheckoutMethodVerified ? 'text-green-500' : 'text-gray-500'}`}>
                {status.isCheckoutMethodVerified ? '✓' : '○'} Checkout Method
              </li>
            </ul>
          </div>
          {status.lastVerificationDate && (
            <p className="text-xs text-dark-text-muted">
              Last verified: {new Date(status.lastVerificationDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
} 