'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { Plus, Trash2, Loader2, ArrowRight } from 'lucide-react'
import { useProfessionalProfileData } from '@/hooks/useProfessionalProfileData'
import { ProfessionalProfile, ProfileResponseTimeValues, type ProfileResponseTimeType, type TravelSettings } from '@/types/professional'
import { Location } from '@/types/common/location'
import { saveProfessionalProfileStep } from '@/lib/firebase/profiles'

// Constants
const MAX_LOCATIONS = 5;

export type AvailabilityFormData = {
  locations: Location[];
  remoteWork: boolean;
  responseTime: ProfileResponseTimeType;
  travel: TravelSettings;
}

function convertProfessionalProfileToAvailabilityFormData(professionalProfile: ProfessionalProfile): AvailabilityFormData {
  return {
    locations: Array.isArray(professionalProfile.availability?.locations)
      ? professionalProfile.availability?.locations
      : professionalProfile.availability?.locations
        ? Object.values(professionalProfile.availability.locations as Record<string, Location>)
        : [],
    remoteWork: professionalProfile.availability?.remoteWork || false,
    responseTime: professionalProfile.availability?.responseTime || ProfileResponseTimeValues[0] as ProfileResponseTimeType,
    travel: professionalProfile.availability?.travel || {
      willingToTravel: false,
      maxDistanceKm: 0
    } as TravelSettings
  }
}
export default function AvailabilityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromParam = searchParams?.get('from')
  const { professionalProfileData, loading: dataLoading, setProfessionalProfileData } = useProfessionalProfileData()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Field-specific errors
  const [locationError, setLocationError] = useState<string | null>(null)

  const [availabilityFormData, setAvailabilityFormData] = useState<AvailabilityFormData>({
    locations: [],
    remoteWork: false,
    responseTime: ProfileResponseTimeValues[0] as ProfileResponseTimeType,
    travel: {
      willingToTravel: false,
      maxDistanceKm: 0
    } as TravelSettings
  })
  const [locationInput, setLocationInput] = useState({
    city: '',
    country: ''
  })

  const isSaving = useRef(false)

  // Initialize availability data from professional profile
  useEffect(() => {
    const initializeAvailability = async () => {
      try {
        if (loading || !professionalProfileData) {
          return;
        }

        setLoading(true);
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          router.push('/auth/signin');
          return;
        }


        if (fromParam === 'edit' || fromParam === 'review') {
          setAvailabilityFormData(convertProfessionalProfileToAvailabilityFormData(professionalProfileData));
          setLoading(false);
        } else {
          setLoading(false);
          router.push('/profile');
          return;
        }
      } catch (error) {
        console.error('Error initializing availability:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize availability');
      } finally {
        setLoading(false);
      }
    }

    initializeAvailability();
  }, [fromParam, router, loading, setProfessionalProfileData, professionalProfileData])

  // Validate location data
  const validateLocation = (): boolean => {
    setLocationError(null);

    if (!locationInput.city.trim()) {
      setLocationError('City is required');
      return false;
    }

    if (!locationInput.country.trim()) {
      setLocationError('Country is required');
      return false;
    }

    if (availabilityFormData?.locations.length >= MAX_LOCATIONS) {
      setLocationError(`Maximum ${MAX_LOCATIONS} locations allowed`);
      return false;
    }

    // Check if location already exists
    const exists = availabilityFormData?.locations.some(
      loc => loc.city.toLowerCase() === locationInput.city.trim().toLowerCase() &&
        loc.country.toLowerCase() === locationInput.country.trim().toLowerCase()
    );

    if (exists) {
      setLocationError('This location is already added');
      return false;
    }

    return true;
  }

  // Handle adding a new location
  const handleAddLocation = async () => {
    if (!validateLocation()) {
      return;
    }

    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const newLoc: Location = {
        city: locationInput.city.trim(),
        country: locationInput.country.trim()
      } as Location

      // Update availability data
      const updatedLocations: Location[] = [...availabilityFormData.locations, newLoc]
      const updatedAvailability: AvailabilityFormData = {
        ...availabilityFormData,
        locations: updatedLocations
      }

      setAvailabilityFormData(updatedAvailability)
      setLocationInput({ city: '', country: '' })

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          availability: updatedAvailability
        };
        setProfessionalProfileData(updatedProfileData);
      }

      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, {
        availability: updatedAvailability
      })
    } catch (err) {
      console.error('Error adding location:', err)
      setError(`Failed to add location: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  // Handle removing a location
  const handleRemoveLocation = async (index: number) => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Update availability data
      const updatedLocations = availabilityFormData.locations.filter((_, i) => i !== index)
      const updatedAvailability = {
        ...availabilityFormData,
        locations: updatedLocations
      }

      setAvailabilityFormData(updatedAvailability)

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          availability: updatedAvailability
        };
        setProfessionalProfileData(updatedProfileData);
      }

      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, {
        availability: updatedAvailability
      })
    } catch (err) {
      console.error('Error removing location:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove location')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  // Toggle remote work
  const handleRemoteWorkToggle = async () => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Update availability data
      const updatedAvailability = {
        ...availabilityFormData,
        remoteWork: !availabilityFormData.remoteWork
      }

      setAvailabilityFormData(updatedAvailability)

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          availability: updatedAvailability
        };
        setProfessionalProfileData(updatedProfileData);
      }

      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, {
        availability: updatedAvailability
      })
    } catch (err) {
      console.error('Error toggling remote work:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle remote work')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  // Change response time
  const handleResponseTimeChange = async (time: ProfileResponseTimeType) => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Update availability data
      const updatedAvailability = {
        ...availabilityFormData,
        responseTime: time
      }

      setAvailabilityFormData(updatedAvailability)

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          availability: updatedAvailability
        };
        setProfessionalProfileData(updatedProfileData);
      }

      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, {
        availability: updatedAvailability
      })
    } catch (err) {
      console.error('Error changing response time:', err)
      setError(err instanceof Error ? err.message : 'Failed to change response time')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  // Toggle travel willingness
  const handleTravelWillingToggle = async () => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Update availability data
      const updatedTravel: TravelSettings = {
        ...availabilityFormData.travel,
        willingToTravel: !availabilityFormData.travel.willingToTravel
      }

      // If toggling off, reset distance
      if (!updatedTravel.willingToTravel) {
        updatedTravel.maxDistanceKm = 0
      } else if (updatedTravel.maxDistanceKm === 0) {
        updatedTravel.maxDistanceKm = 25
      }

      const updatedAvailability = {
        ...availabilityFormData,
        travel: updatedTravel
      }

      setAvailabilityFormData(updatedAvailability)

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          availability: updatedAvailability
        };
        setProfessionalProfileData(updatedProfileData);
      }

      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, {
        availability: updatedAvailability
      })
    } catch (err) {
      console.error('Error toggling travel willingness:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle travel settings')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  // Update travel distance
  const handleTravelDistanceChange = async (distance: number) => {
    if (distance < 1) {
      return;
    }

    setAvailabilityFormData(prev => ({
      ...prev,
      travel: {
        ...prev.travel,
        maxDistanceKm: distance
      }
    }));
  }
  
  const handleTravelDistanceBlur = async () => {
    if (availabilityFormData.travel.maxDistanceKm < 1) {
      return;
    }

    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) throw new Error('No user found')


      if (professionalProfileData) {
        if (availabilityFormData.travel.maxDistanceKm === professionalProfileData.availability.travel.maxDistanceKm) {
          return;
        }
        const updatedProfileData = {
          ...professionalProfileData,
          availability: {
            ...professionalProfileData.availability,
            travel: availabilityFormData.travel
          }
        };
        setProfessionalProfileData(updatedProfileData);
        await saveProfessionalProfileStep(user.uid, {
          availability: {
            ...professionalProfileData.availability,
            travel: availabilityFormData.travel
          }
        })
      }

    } catch (err) {
      console.error('Error updating travel distance:', err)
      setError(err instanceof Error ? err.message : 'Failed to update travel distance')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }


  // Handle continue button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      if (availabilityFormData.locations.length === 0 && !availabilityFormData.remoteWork) {
        setError('Please add at least one location or select remote work')
        setLoading(false)
        return
      }

      if (!ProfileResponseTimeValues.includes(availabilityFormData.responseTime)) {
        setError('Please select a valid response time')
        setLoading(false)
        return
      }

      if (professionalProfileData) {
        const updatedAvailabilityData = {
          ...professionalProfileData,
          availability: availabilityFormData
        };
        setProfessionalProfileData(updatedAvailabilityData);
      }

      // Save availability data to Firebase
      await saveProfessionalProfileStep(user.uid, {
        availability: availabilityFormData
      })

      // Navigate to review page
      router.push('/pro-signup/create-profile/review')
    } catch (err) {
      console.error('Error saving availability:', err)
      setError(err instanceof Error ? err.message : 'Failed to save availability')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4">
              {error}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-dark-text-primary mb-2">Availability</h2>
            <p className="text-dark-text-secondary mb-6">
              Set your locations, work preferences, and response times
            </p>

            {/* Locations */}
            <div className="space-y-4">
              <p className="text-base font-medium text-dark-text-primary mb-2">
                Where do you offer your services?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-text-secondary mb-2">City</label>
                  <input
                    type="text"
                    value={locationInput.city}
                    onChange={(e) => setLocationInput({ ...locationInput, city: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                    placeholder="e.g. Los Angeles"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-text-secondary mb-2">Country</label>
                  <input
                    type="text"
                    value={locationInput.country}
                    onChange={(e) => setLocationInput({ ...locationInput, country: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                    placeholder="e.g. United States"
                  />
                </div>
              </div>
              {locationError && (
                <div className="text-red-400 text-sm mt-1">
                  {locationError}
                </div>
              )}
              <div className="flex space-x-4 items-center">
                <button
                  type="button"
                  onClick={handleAddLocation}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {loading ? 'Adding...' : 'Add Location'}
                </button>
                <p className="text-sm text-dark-text-muted">
                  {availabilityFormData.locations.length}/{MAX_LOCATIONS} locations added
                </p>
              </div>

              {/* Locations List */}
              {availabilityFormData.locations.length > 0 && (
                <div className="space-y-2">
                  {availabilityFormData.locations.map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-dark-input rounded-lg p-3"
                    >
                      <span className="text-dark-text-primary">
                        {location.city}, {location.country}
                      </span>
                      <button
                        onClick={() => handleRemoveLocation(index)}
                        className="text-dark-text-muted hover:text-dark-text-primary"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remote Work */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-medium text-dark-text-primary">
                Remote Work
              </h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remote-work"
                  checked={availabilityFormData.remoteWork}
                  onChange={handleRemoteWorkToggle}
                  className="mr-2 h-4 w-4 accent-primary-600"
                  disabled={loading}
                />
                <label
                  htmlFor="remote-work"
                  className="text-dark-text-primary cursor-pointer"
                >
                  Available for remote work
                </label>
              </div>
            </div>

            {/* Response Time */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-medium text-dark-text-primary">
                Response Time
              </h3>
              <p className="text-dark-text-secondary">
                How quickly do you typically respond to inquiries?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ProfileResponseTimeValues.map((time: ProfileResponseTimeType, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleResponseTimeChange(time)}
                    className={`p-3 rounded-lg border ${availabilityFormData.responseTime === time
                        ? 'bg-primary-600/20 border-primary-600 text-primary-600'
                        : 'bg-dark-input border-dark-border text-dark-text-primary'
                      }`}
                    disabled={loading}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-dark-text-primary">
                Travel Preferences
              </h3>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="travel-willing"
                  checked={availabilityFormData.travel.willingToTravel}
                  onChange={handleTravelWillingToggle}
                  className="mr-2 h-4 w-4 accent-primary-600"
                  disabled={loading}
                />
                <label
                  htmlFor="travel-willing"
                  className="text-dark-text-primary cursor-pointer"
                >
                  Willing to travel for work
                </label>
              </div>

              {availabilityFormData.travel.willingToTravel && (
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="block text-dark-text-secondary mb-2">
                      How far are you willing to travel?
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={availabilityFormData.travel.maxDistanceKm}
                        onChange={(e) => handleTravelDistanceChange(parseInt(e.target.value) || 0)}
                        onBlur={handleTravelDistanceBlur}
                        className="w-24 bg-dark-input border border-dark-border rounded-md px-3 py-2 text-dark-text-primary"
                        disabled={loading}
                      />
                      <span className="text-dark-text-primary">Kilometers</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              onClick={() => router.push('/pro-signup/create-profile/portfolio?from=review')}
              className="px-4 py-2 border border-dark-border text-dark-text-primary rounded-md hover:bg-dark-input"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : 'Continue'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </>
      )}
    </div>
  )
} 