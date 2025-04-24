'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Camera, ChevronDown } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { getUser, updateUser } from '@/lib/firebase/profiles'
import { uploadProfilePicture } from '@/lib/firebase/storage'
import type { User } from '@/types/user'
import ImageCropper from '@/components/common/ImageCropper'
import AuthLayout from '@/components/auth/AuthLayout'
import { useUserProfileData } from '@/hooks/useUserProfileData'
import { sendOTPConfirmation, sendVerificationCode } from '@/lib/twilio/verification'

const MAX_DISPLAY_NAME_LENGTH = 35;

export type UserProfileFormData = {
  displayName: string;
  countryCode: string;
  phone: string;
  photoURL: string | undefined;
  profilePictureId?: string | undefined;
  phoneVerified: boolean;
}

interface CountryCode {
  code: string
  dial_code: string
  flag: string
  name: string
}

function convertUserToUserProfileFormData(user: User): UserProfileFormData {
  return {
    displayName: user.displayName || user.displayName || '',
    countryCode: user.contact?.countryCode ?? '',
    phone: user.contact?.phone ?? '',
    photoURL: user.photoURL ?? user.photoURL ?? undefined,
    profilePictureId: user.profilePictureId ?? undefined,
    phoneVerified: user.contact?.phoneVerified ?? false,
  }
}

export default function EditProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isInitialSetup = searchParams?.get('setup') === 'true'

  const { userProfileData, loading: dataLoading, setUserProfileData } = useUserProfileData()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const formInitialized = useRef(false)
  const isSaving = useRef(false)
  const [formData, setFormData] = useState<UserProfileFormData>({
    displayName: '',
    countryCode: '',
    phone: '',
    photoURL: undefined,
    profilePictureId: undefined,
    phoneVerified: false,
  })
  const [showCountryList, setShowCountryList] = useState(false)
  const [countries, setCountries] = useState<CountryCode[]>([])
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null)
  const displayNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const [verifyingPhone, setVerifyingPhone] = useState<boolean>(false);
  const [otpRemaining, setOtpRemaining] = useState<number>(1);

  useEffect(() => {

    const loadCountries = async () => {
      if (countries.length > 0) return;
      try {
        const response = await fetch('/data/country-codes.json')
        const data = await response.json()
        setCountries(data)
        // Set default country (e.g., US)
        const defaultCountry = data.find((c: CountryCode) => c.code === 'US')
        setSelectedCountry(defaultCountry || data[0])
      } catch (error) {
        console.error('Error loading country codes:', error)
      }
    }
    const initializeUserProfile = async () => {
      try {
        if (loading || !userProfileData) {
          return;
        }

        setLoading(true);
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          router.push('/auth/signin');
          return;
        }

        const userData = await getUser(user.uid)
        if (!userData) {
          setLoading(false);
          router.push('/auth/signin');
          return;
        }

        if (displayNameRef.current) {
          displayNameRef.current.value = userData.displayName;
        }

        setUserProfileData(userData);

        setFormData({
          displayName: userData.displayName || user.displayName || '',
          countryCode: userData.contact?.countryCode ?? '',
          phone: userData.contact?.phone ?? '',
          photoURL: userData.photoURL ?? user.photoURL ?? undefined,
          profilePictureId: userData.profilePictureId ?? undefined,
          phoneVerified: userData.contact?.phoneVerified ?? false,
        })

        if (phoneRef?.current) {
          phoneRef.current.value = userData.contact?.phone ?? '';
        }

        if (selectedCountry) {
          setSelectedCountry(countries.find(c => c.code === userData.contact?.countryCode) ?? countries[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing user profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize user profile');
      } finally {
        setLoading(false);
      }
    }
    loadCountries();
    initializeUserProfile();
  }, [countries, loading, router, selectedCountry, setUserProfileData, userProfileData])

  useEffect(() => {
    if (userProfileData && !loading && !dataLoading && !formInitialized.current && !isSaving.current) {
      setFormData(convertUserToUserProfileFormData(userProfileData));
      formInitialized.current = true;
    }
  }, [userProfileData, loading, dataLoading]);

  useEffect(() => {
    if (!verifyingPhone) return;
    if (otpRemaining <= 0) {
      setVerifyingPhone(false);
      setOtpRemaining(1);
      return;
    }

    const timer = setInterval(() => {
      setVerifyingPhone(false);
      setOtpRemaining(1);
    }, 60000);

    return () => clearInterval(timer); // cleanup
  }, [otpRemaining, verifyingPhone]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setSelectedImage(e.target.files[0])
    setShowCropper(true)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Convert Blob to File for upload
      const croppedFile = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' })
      const { imageId, downloadURL } = await uploadProfilePicture(user.uid, croppedFile)


      if (userProfileData) {
        const updatedUserProfileData: User = { ...userProfileData, photoURL: downloadURL, profilePictureId: imageId };
        await updateUser(user.uid, updatedUserProfileData);
        setUserProfileData(updatedUserProfileData);
      }
      setFormData(prev => ({
        ...prev,
        photoURL: downloadURL,
        profilePictureId: imageId,
      }))

      setShowCropper(false)
      setSelectedImage(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image')
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setSelectedImage(null)
  }

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country)
    setShowCountryList(false)
  }

  const handleVerifyPhoneNumberOnClick = async () => {
    try {
      if (verifyingPhone) {
        const phoneNumber = formData.phone;
        const countryCode = formData.countryCode;
        console.log('phoneNumber', phoneNumber);

        if (!phoneNumber || !countryCode) {
          setError('Please enter a phone number');
          return;
        }
        const otp = otpRef.current?.value;
        if (!otp || otp.length !== 6) {
          setError('Please enter the 6 digit code sent to your phone');
          return;
        }
        console.log('otp', otp);
        const result = await sendOTPConfirmation(`${countryCode}${phoneNumber}`, otp);
        if (result?.success && result?.data.status === 'approved') {
          setVerifyingPhone(false);
          setOtpRemaining(1);

          const user = auth.currentUser
          if (!user) throw new Error('No user found')

          const updateData: Partial<User> = {
            contact: {
              countryCode: countryCode,
              phone: phoneNumber,
              phoneVerified: true,
              emailVerified: user.emailVerified,
            }
          }

          await updateUser(user.uid, updateData);

          const updatedUserProfileData: User = {
            ...userProfileData, contact: {
              countryCode: countryCode,
              phone: phoneNumber,
              phoneVerified: true,
              emailVerified: user.emailVerified,
            }
          } as User;
          setUserProfileData(updatedUserProfileData);
          setFormData(prev => ({
            ...prev,
            countryCode: countryCode,
            phone: phoneNumber,
            phoneVerified: true,
          }));

        }
        if (phoneRef?.current) {
          phoneRef.current.value = phoneNumber;
        }
        return;
      }
    } catch (error) {
      console.error('Error verifying phone number:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify phone number');
      return;
    }

    try {
      const phoneNumber = phoneRef.current?.value;
      const countryCode = selectedCountry?.dial_code;

      if (!phoneNumber || !countryCode) {
        setError('Please enter a phone number');
        return;
      }
      // Format the phone number with country code
      const formattedPhoneNumber = `${countryCode}${phoneNumber}`;
      console.log(formattedPhoneNumber);
      setOtpRemaining(1);
      setVerifyingPhone(true);
      const result = await sendVerificationCode(formattedPhoneNumber);
      if (result?.success && result?.data.status === 'pending') {
        setFormData(prev => ({
          ...prev,
          countryCode: countryCode,
          phone: phoneNumber
        }));
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError(error instanceof Error ? error.message : 'Failed to send verification code');
      setVerifyingPhone(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const displayName = displayNameRef.current?.value;
    const phone = phoneRef.current?.value;
    const countryCode = selectedCountry?.dial_code;


    // verify input fields
    if (!displayName) {
      setError('Please fill in your name');
      return;
    }

    if (!phone || !countryCode) {
      setError('Please fill in your phone number');
      return;
    }

    setSaving(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Update user data
      const updateData: Partial<User> = {
        displayName: displayName,
        photoURL: formData.photoURL,
        profilePictureId: formData.profilePictureId,
        contact: {
          countryCode: countryCode,
          phone: phone,
          phoneVerified: formData.phoneVerified,
          emailVerified: user.emailVerified,
        }
      }

      // Only set isSetupCompleted to true if this is the initial setup
      if (isInitialSetup) {
        updateData.isSetupCompleted = true
      }

      await updateUser(user.uid, updateData)

      if (isInitialSetup) {
        router.push('/auth/select-role')
      } else {
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update user profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthLayout
        title={isInitialSetup ? "Complete Your Profile" : "Edit Profile"}
        subtitle="Tell us a bit about yourself"
      >
        <div className="flex items-center justify-center">
          <div className="text-dark-text-secondary">Loading...</div>
        </div>
      </AuthLayout>
    )
  }

  const PageContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4 text-sm">
          {error}
        </div>
      )}

      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dark-card bg-dark-card mb-4">
          {formData.photoURL ? (
            <Image
              src={formData.photoURL}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-dark-input">
              <Camera className="w-12 h-12 text-dark-text-muted" />
            </div>
          )}
        </div>
        <label className="px-4 py-2 bg-dark-input text-dark-text-primary rounded-md hover:bg-dark-border transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          Change Photo
        </label>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-dark-text-primary mb-2">
          Full Name
        </label>
        <input
          ref={displayNameRef}
          maxLength={MAX_DISPLAY_NAME_LENGTH}
          className="w-full px-4 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary resize-none overflow-hidden focus:overflow-x-auto focus:outline-none"
          placeholder="Your name"
          required
        />
        <p className="mt-1 text-sm text-dark-text-muted text-right">
          Max {MAX_DISPLAY_NAME_LENGTH} characters
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-dark-text-primary mb-2">
          Phone Number
        </label>
        <div className="relative">
          <div className="flex">
            <button
              type="button"
              disabled={formData.phoneVerified}
              onClick={() => setShowCountryList(!showCountryList)}
              className="flex items-center gap-2 px-3 py-2 bg-dark-input border border-dark-border rounded-l-md text-dark-text-primary hover:bg-dark-border"
            >
              {selectedCountry?.flag && (
                <span className="text-lg">{selectedCountry.flag}</span>
              )}
              <span>{selectedCountry?.dial_code}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {verifyingPhone ? (
              <input
                type="number"
                value={formData.phone ? formData.phone : ''}
                className="flex-1 px-3 py-2 bg-dark-input border border-dark-border border-l-0 rounded-r-md text-dark-text-primary
             appearance-none
             [&::-webkit-inner-spin-button]:appearance-none
             [&::-webkit-outer-spin-button]:appearance-none
             [appearance:textfield]"
                required
                readOnly
                placeholder="Refreshing..."
              />
            ) : formData.phoneVerified ?
              (<input
                type="number"
                value={formData.phone ? formData.phone : ''}
                ref={phoneRef}
                readOnly
                className="flex-1 px-3 py-2 bg-dark-input border border-dark-border border-l-0 rounded-r-md text-dark-text-primary
             appearance-none
             [&::-webkit-inner-spin-button]:appearance-none
             [&::-webkit-outer-spin-button]:appearance-none
             [appearance:textfield]"
                required
                placeholder="Refreshing..."
              />) : (<input
                type="number"
                ref={phoneRef}
                className="flex-1 px-3 py-2 bg-dark-input border border-dark-border border-l-0 rounded-r-md text-dark-text-primary
             appearance-none
             [&::-webkit-inner-spin-button]:appearance-none
             [&::-webkit-outer-spin-button]:appearance-none
             [appearance:textfield]"
                required
                placeholder="Enter your phone number"
              />)}
          </div>

          {showCountryList && (
            <div className="absolute z-10 mt-1 w-64 max-h-60 overflow-auto bg-dark-card border border-dark-border rounded-md shadow-lg">
              {countries.filter((country) => country.code === 'US').map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  disabled={formData.phoneVerified}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-dark-input"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-dark-text-primary">{country.name}</span>
                  <span className="ml-auto text-dark-text-secondary">{country.dial_code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {verifyingPhone && (<>
          <input
            ref={otpRef}
            maxLength={6}
            className="w-full px-4 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary resize-none overflow-hidden focus:overflow-x-auto focus:outline-none"
            placeholder="Enter the code sent to your phone"
          />

          <div className="mt-1 flex justify-between items-center">
            <button
              type="button"
              className="text-sm text-blue-500 hover:text-blue-600 font-semibold cursor-pointer underline decoration-2 hover:decoration-blue-600"
            >
              Resend Code
            </button>
            <p className="text-sm text-dark-text-muted">
              code is valid for 1 minute
            </p>
          </div>
        </>)}

        {!formData.phoneVerified ? (
          <button
            type="button"
            disabled={saving}
            onClick={handleVerifyPhoneNumberOnClick}
            className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {verifyingPhone ? "Confirm Code" : "Verify Phone Number"}
          </button>) : (
          <button
            type="button"
            disabled
            className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Phone Number Verified
          </button>
        )}


      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={saving}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {saving ? 'Saving...' : isInitialSetup ? 'Continue' : 'Save Changes'}
        </button>
      </div>
    </form>
  )

  return (
    <>
      {showCropper && selectedImage ? (
        <ImageCropper
          imageFile={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      ) : (
        <AuthLayout
          title={isInitialSetup ? "Complete Your Profile" : "Edit Profile"}
          subtitle={isInitialSetup ? "Tell us a bit about yourself" : "Update your profile information"}
        >
          <PageContent />
        </AuthLayout>
      )}
    </>
  )
} 