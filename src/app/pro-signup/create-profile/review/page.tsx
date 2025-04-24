'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { useProfessionalProfileData } from '@/hooks/useProfessionalProfileData'
import { Loader2, ExternalLink, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react'
import { completeProfessionalProfile, updateUser } from '@/lib/firebase/profiles'
import type { ProfileExternalLink, PortfolioFile, ProfessionalProfile } from '@/types/professional'
import Link from 'next/link'
import { Location } from '@/types/common/location'

export default function ReviewPage() {
  const router = useRouter()
  const { professionalProfileData, loading: dataLoading } = useProfessionalProfileData()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationIssues, setValidationIssues] = useState<{
    basicInfo: string | null,
    portfolio: string | null,
    availability: string | null
  }>({
    basicInfo: null,
    portfolio: null,
    availability: null
  })
  const [isProfileComplete, setIsProfileComplete] = useState(false)

  // Validate profile data
  useEffect(() => {
    if (!professionalProfileData || !isProfessionalProfile(professionalProfileData)) {
      return
    }

    const issues = {
      basicInfo: validateBasicInfo(professionalProfileData),
      portfolio: validatePortfolio(professionalProfileData),
      availability: validateAvailability(professionalProfileData)
    }

    setValidationIssues(issues)
    setIsProfileComplete(!issues.basicInfo && !issues.portfolio && !issues.availability)
  }, [professionalProfileData])

  // Validation functions
  const validateBasicInfo = (profile: ProfessionalProfile): string | null => {
    if (!profile.bio) {
      return 'Your bio is missing. Please add a detailed description.';
    }

    if (!Array.isArray(profile.services) || profile.services.length === 0) {
      return 'Select at least one service that you offer.';
    }

    return null;
  }

  const validatePortfolio = (profile: ProfessionalProfile): string | null => {
    const hasFiles = Array.isArray(profile.portfolio?.files) && profile.portfolio.files.length > 0;
    const hasLinks = Array.isArray(profile.portfolio?.externalLinks) && profile.portfolio.externalLinks.length > 0;

    if (!hasFiles && !hasLinks) {
      return 'Your portfolio is empty. Add at least one image or external link.';
    }

    return null;
  }

  const validateAvailability = (profile: ProfessionalProfile): string | null => {
    const hasLocations = Array.isArray(profile.availability?.locations) && profile.availability.locations.length > 0;

    if (!hasLocations && !profile.availability?.remoteWork) {
      return 'Set your availability. Add at least one location or enable remote work.';
    }

    return null;
  }

  // Handle the complete button click
  const handleSubmit = async () => {
    if (!isProfileComplete) {
      setError('Please complete all required sections before submitting.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Mark the profile as completed and update auth claims
      await completeProfessionalProfile(user.uid)

      await updateUser(user.uid, {
        role: {
          client: true,
          professional: true
        }
      })

      // Navigate to the professional dashboard
      router.push('/dashboard/professional')
    } catch (error) {
      console.error('Error completing profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to complete profile')
    } finally {
      setLoading(false)
    }
  }

  // Type guard to check if professionalProfileData is ProfessionalProfile
  const isProfessionalProfile = (data: unknown): data is ProfessionalProfile => {
    return data !== null &&
      typeof data === 'object' &&
      'bio' in data &&
      'services' in data &&
      'skills' in data
  }

  // Show loading or error state
  if (dataLoading) {
    return (
      <div className="p-6 text-center text-dark-text-secondary">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />
        Loading your profile...
      </div>
    )
  }

  if (!professionalProfileData || !isProfessionalProfile(professionalProfileData)) {
    return (
      <div className="p-6 text-center text-dark-text-secondary">
        <div className="bg-dark-input rounded-lg p-6 max-w-md mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-text-primary mb-2">Profile Not Found</h3>
          <p className="mb-4">We couldn't find your profile data. Please complete the previous steps.</p>
          <Link href="/pro-signup/create-profile/basic-info?from=review" className="block w-full py-2 bg-primary-600 text-white rounded-md text-center hover:bg-primary-500">
            Start Profile Setup
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">
          Review Your Profile
        </h2>
        <p className="text-dark-text-secondary">
          Review your profile information before completing the setup
        </p>
      </div>

      {/* Validation Overview Section */}
      <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
        <h3 className="text-md font-medium text-dark-text-primary mb-3">
          Profile Completion Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            {validationIssues.basicInfo ? (
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-dark-text-primary">Basic Information</span>
                {validationIssues.basicInfo && (
                  <Link href="/pro-signup/create-profile/basic-info?from=review" className="ml-2 text-xs text-primary-400 hover:text-primary-300">
                    Edit
                  </Link>
                )}
              </div>
              {validationIssues.basicInfo && (
                <p className="text-xs text-red-400">{validationIssues.basicInfo}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2">
            {validationIssues.portfolio ? (
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-dark-text-primary">Portfolio</span>
                {validationIssues.portfolio && (
                  <Link href="/pro-signup/create-profile/portfolio?from=review" className="ml-2 text-xs text-primary-400 hover:text-primary-300">
                    Edit
                  </Link>
                )}
              </div>
              {validationIssues.portfolio && (
                <p className="text-xs text-red-400">{validationIssues.portfolio}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2">
            {validationIssues.availability ? (
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-dark-text-primary">Availability</span>
                {validationIssues.availability && (
                  <Link href="/pro-signup/create-profile/availability?from=review" className="ml-2 text-xs text-primary-400 hover:text-primary-300">
                    Edit
                  </Link>
                )}
              </div>
              {validationIssues.availability && (
                <p className="text-xs text-red-400">{validationIssues.availability}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Info Section */}
        <div>
          <h3 className="text-lg font-medium text-dark-text-primary mb-4">
            Basic Information
          </h3>
          <div className="bg-dark-input rounded-lg p-4">
            <p className="text-dark-text-secondary mb-4">{professionalProfileData.bio}</p>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-dark-text-primary mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(professionalProfileData.skills) ? (professionalProfileData.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-dark-card rounded-full text-sm text-dark-text-secondary">
                      {skill}
                    </span>
                  ))) : ((Object.values(professionalProfileData.skills) as string[]).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-dark-card rounded-full text-sm text-dark-text-secondary">
                      {skill}
                    </span>
                  )))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-dark-text-primary mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(professionalProfileData.services) ? (professionalProfileData.services.map((service: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-dark-card rounded-full text-sm text-dark-text-secondary">
                      {service}
                    </span>
                  ))) : ((Object.values(professionalProfileData.services) as string[]).map((service: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-dark-card rounded-full text-sm text-dark-text-secondary">
                      {service}
                    </span>
                  )))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-dark-text-primary mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {professionalProfileData.equipment.map((equipment: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-dark-card rounded-full text-sm text-dark-text-secondary">
                      {equipment}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-dark-text-primary mb-2">Experience</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-dark-text-muted text-sm">Years of Experience</p>
                    <p className="text-dark-text-primary">{professionalProfileData.experience.years} years</p>
                  </div>
                  <div>
                    <p className="text-dark-text-muted text-sm">Completed Projects</p>
                    <p className="text-dark-text-primary">{professionalProfileData.experience.completedProjects} projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div>
          <h3 className="text-lg font-medium text-dark-text-primary mb-4">
            Portfolio
          </h3>
          <div className="bg-dark-input rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {Array.isArray(professionalProfileData.portfolio?.files) ? (professionalProfileData.portfolio?.files.map((file: PortfolioFile) => (
                <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={file.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))) : professionalProfileData.portfolio?.files ? ((Object.values(professionalProfileData.portfolio.files) as PortfolioFile[]).map((file: PortfolioFile) => (
                <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={file.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))) : (<></>)}
            </div>

            {professionalProfileData.portfolio.externalLinks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-dark-text-primary mb-2">External Links</h4>
                <div className="space-y-2">

                  {Array.isArray(professionalProfileData.portfolio.externalLinks) ? (professionalProfileData.portfolio.externalLinks.map((link: ProfileExternalLink, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-400 hover:text-primary-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{link.platform}</span>
                    </a>
                  ))) : professionalProfileData.portfolio?.files ? ((Object.values(professionalProfileData.portfolio.externalLinks) as ProfileExternalLink[]).map((link: ProfileExternalLink, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-400 hover:text-primary-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{link.platform}</span>
                    </a>
                  ))) : (<></>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Availability Section */}
        <div>
          <h3 className="text-lg font-medium text-dark-text-primary mb-4">
            Availability
          </h3>
          <div className="bg-dark-input rounded-lg p-4">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-dark-text-primary mb-2">Service Locations</h4>
                <div className="flex flex-wrap gap-2">

                  {Array.isArray(professionalProfileData.availability.locations) ? (professionalProfileData.availability.locations.map((location: Location, index: number) => (
                    <span key={index} className="px-2 py-1 bg-dark-card rounded-full text-sm text-dark-text-secondary">
                      {location.city}, {location.country}
                    </span>
                  ))) : ((Object.values(professionalProfileData.availability.locations) as Location[]).map((location: Location, index: number) => (
                    <span key={index} className="px-2 py-1 bg-dark-card rounded-full text-sm text-dark-text-secondary">
                      {location.city}, {location.country}
                    </span>
                  )))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-dark-text-muted text-sm">Remote Work</p>
                  <p className="text-dark-text-primary">
                    {professionalProfileData.availability.remoteWork ? 'Available' : 'Not Available'}
                  </p>
                </div>
                <div>
                  <p className="text-dark-text-muted text-sm">Response Time</p>
                  <p className="text-dark-text-primary">
                    Within {professionalProfileData.availability.responseTime}
                  </p>
                </div>
              </div>
              {professionalProfileData.availability.travel.willingToTravel && (
                <div>
                  <p className="text-dark-text-muted text-sm">Travel Distance</p>
                  <p className="text-dark-text-primary">
                    Up to {professionalProfileData.availability.travel.maxDistanceKm} km
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Link
          href="/pro-signup/create-profile/availability?from=review"
          className="px-6 py-2 border border-dark-border text-dark-text-primary rounded-md hover:bg-dark-card transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <button
          onClick={handleSubmit}
          disabled={loading || !isProfileComplete}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Processing...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  )
} 