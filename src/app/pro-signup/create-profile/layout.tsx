'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Camera, Clock, User, ClipboardCheck } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { useProfessionalProfileData } from '@/hooks/useProfessionalProfileData'

const steps = [
  {
    id: 'basic-info',
    title: 'Basic Info & Services',
    path: '/pro-signup/create-profile/basic-info?from=review',
    icon: User,
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    path: '/pro-signup/create-profile/portfolio?from=review',
    icon: Camera,
  },
  {
    id: 'availability',
    title: 'Availability',
    path: '/pro-signup/create-profile/availability?from=review',
    icon: Clock,
  },
  {
    id: 'review',
    title: 'Review',
    path: '/pro-signup/create-profile/review?from=review',
    icon: ClipboardCheck,
  },
]

export default function CreateProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [currentStep, setCurrentStep] = useState(0)
  const { professionalProfileData } = useProfessionalProfileData()

  useEffect(() => {
    const stepIndex = steps.findIndex(step => pathname?.includes(step.id))
    if (stepIndex !== -1) {
      console.log("stepIndex:", stepIndex);
      setCurrentStep(stepIndex)
    }
  }, [pathname])

  // Determine the maximum accessible step based on profile data
  const getMaxAccessibleStep = () => {
    console.log('Determining max accessible step with profile data:', professionalProfileData);
    
    if (!professionalProfileData) return 0

    // Check if profileData has professional data
    if (!('bio' in professionalProfileData)) {
      console.log('No professional data found in profile');
      return 0;
    }

    let maxStep = 0;

    // Check basic info completion
    if (professionalProfileData.bio && professionalProfileData.services.length > 0) {
      maxStep = 1; // Basic info is complete
      console.log('Basic info is complete, allowing access to portfolio step');
      // log professionalProfileData
      console.log('Professional profile data:', professionalProfileData);
      // Check portfolio completion
      if (professionalProfileData.portfolio?.files?.length > 0 || professionalProfileData.portfolio?.externalLinks.length > 0) {
        maxStep = 2; // Portfolio has content
        console.log('Portfolio has content, allowing access to availability step');

        // Check availability completion
        if (professionalProfileData.availability?.locations?.length > 0 || professionalProfileData.availability?.remoteWork) {
          maxStep = 3; // Availability is set
          console.log('Availability is set, allowing access to review step');
        }
      }
    }

    // If the profile is already completed, allow access to all steps
    if (professionalProfileData.isSetupCompleted) {
      console.log('Profile setup is already completed, allowing access to all steps');
      return steps.length - 1;
    }

    // Allow access to current step, next step, and ALL PREVIOUS steps
    // This ensures you can always navigate backward, regardless of completion status
    const result = Math.max(maxStep, currentStep);
    console.log(`Max accessible step: ${result} (current step: ${currentStep}, completion step: ${maxStep})`);
    return result;
  }

  const maxAccessibleStep = getMaxAccessibleStep()

  return (
    <MainLayout>
      <div className="min-h-screen bg-dark-bg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark-text-primary">
              Create Your Professional Profile
            </h1>
            <p className="mt-2 text-dark-text-secondary">
              Complete your profile to start offering services
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <Link
                  href={step.path}
                  className={`flex flex-col items-center ${
                    index <= maxAccessibleStep || index < currentStep
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  onClick={(e) => {
                    if (index > maxAccessibleStep && index > currentStep) {
                      e.preventDefault()
                    }
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === currentStep
                        ? 'bg-primary-600' // Current step
                        : index < currentStep
                        ? 'bg-green-600' // Completed step
                        : index <= maxAccessibleStep
                        ? 'bg-primary-600/50' // Accessible but not completed
                        : 'bg-dark-input' // Not accessible
                    }`}
                  >
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="mt-2 text-sm font-medium text-dark-text-secondary">
                    {step.title}
                  </span>
                </Link>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 mt-5 ${
                      index < currentStep
                        ? 'bg-green-600' // Completed progress
                        : index < maxAccessibleStep
                        ? 'bg-primary-600/50' // Accessible progress
                        : 'bg-dark-input' // Not accessible
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="bg-dark-card rounded-lg shadow-lg">
            {children}
          </div>

          <div className="mt-8 text-center text-dark-text-muted">
            <p>
              Need help? Contact our support team at{' '}
              <a href="mailto:support@grapher.com" className="text-primary-400 hover:text-primary-300">
                {process.env.NEXT_PUBLIC_COMPANY_SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 