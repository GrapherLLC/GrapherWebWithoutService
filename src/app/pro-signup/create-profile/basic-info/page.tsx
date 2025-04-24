'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { X, Image as ImageIcon, Loader2, Camera, Video, ImagePlus, VideoIcon, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { uploadCoverPicture } from '@/lib/firebase/storage'
import CoverImageCropper from '@/components/common/CoverImageCropper'
import { useProfessionalProfileData } from '@/hooks/useProfessionalProfileData'
import { 
  updateProfessionalCoverImage, 
  deleteCoverImage, 
  resetProfessionalProfile,
  getOrCreateProfessionalProfile,
  saveProfessionalProfileStep
} from '@/lib/firebase/profiles'
import type { ProfessionalProfile } from '@/types/professional'
import type { ServiceType } from '@/types/common/services'
import { User } from 'firebase/auth'

// Constants
const MAX_BIO_LENGTH = 250 // Maximum characters for bio
const AVAILABLE_SERVICES = [
  { id: "Photography", icon: Camera },
  { id: "Videography", icon: Video },
  { id: "Photo Editing", icon: ImagePlus },
  { id: "Video Editing", icon: VideoIcon }
] as const

// Local type definition for form data
export type BasicInfoFormData = {
  bio: string;
  skills: string[];
  services: ServiceType[];
  experience: {
    years: number;
    completedProjects: number;
  };
  equipment: string[];
  coverImage?: {
    id: string;
    url: string;
  };
}

function convertProfessionalProfileToBasicInfoFormData(professionalProfile: ProfessionalProfile): BasicInfoFormData {
  // Ensure services is always an array of ServiceType
    
  return {
    bio: professionalProfile.bio || '',
    skills: Array.isArray(professionalProfile.skills)
      ? professionalProfile.skills
      : professionalProfile.skills
        ? Object.values(professionalProfile.skills) // Convert object to array
        : [],
    services: Array.isArray(professionalProfile.services)
      ? professionalProfile.services
      : professionalProfile.services
        ? Object.values(professionalProfile.services) // Convert object to array
        : ['Photography'],
    experience: {
      years: professionalProfile.experience?.years || 0,
      completedProjects: professionalProfile.experience?.completedProjects || 0
    },
    equipment: Array.isArray(professionalProfile.equipment)
      ? professionalProfile.equipment
      : professionalProfile.equipment
        ? Object.values(professionalProfile.equipment) // Convert object to array
        : [],
    coverImage: professionalProfile.coverImage
  }
} 

export default function BasicInfoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromParam = searchParams?.get('from')
  const { professionalProfileData, loading: dataLoading, setProfessionalProfileData } = useProfessionalProfileData()
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newEquipment, setNewEquipment] = useState('')
  const formInitialized = useRef(false)
  const isSaving = useRef(false)

  const [formData, setFormData] = useState<BasicInfoFormData>({
    bio: '',
    skills: [],
    services: ['Photography'],
    experience: {
      years: 0,
      completedProjects: 0
    },
    equipment: [],
    coverImage: undefined
  })

  // Load saved data when available
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        setAuthUser(user);
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }

        if (fromParam === 'new') {
          // For new profiles, reset the professional profile
          const professionalProfile = await resetProfessionalProfile(user.uid);
          setProfessionalProfileData(professionalProfile);
          setFormData(convertProfessionalProfileToBasicInfoFormData(professionalProfile));
        } else if (fromParam === 'edit') {
          // For edit mode, load the existing profile
          const { profile } = await getOrCreateProfessionalProfile(user.uid);
          setProfessionalProfileData(profile);
          setFormData(convertProfessionalProfileToBasicInfoFormData(profile));
        } else if (fromParam === 'review') {
          // For review mode, use the data from the hook if available or load it
          if (professionalProfileData) {
            setFormData(convertProfessionalProfileToBasicInfoFormData(professionalProfileData));
          } else {
            // If no data in the hook, load it from Firebase
            const { profile } = await getOrCreateProfessionalProfile(user.uid);
            setProfessionalProfileData(profile);
            setFormData(convertProfessionalProfileToBasicInfoFormData(profile));
          }
        } else {
          router.push('/profile');
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (!isInitialized) {
      initializeProfile();
    }
  }, [fromParam, isInitialized, professionalProfileData, router, setProfessionalProfileData]);

  // Update form data when professionalProfileData changes, but only once on initial load
  useEffect(() => {
    if (professionalProfileData && !loading && !dataLoading && !formInitialized.current && !isSaving.current) {
      setFormData(convertProfessionalProfileToBasicInfoFormData(professionalProfileData));
      formInitialized.current = true;
    }
  }, [professionalProfileData, loading, dataLoading]);

  const handleCoverImageDelete = async () => {
    if (!authUser) {
      router.push('/auth/signin')
      return
    }
    if (!formData.coverImage?.id) {
      console.warn('No cover image to delete')
      return
    }
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true
      
      await deleteCoverImage(authUser.uid, formData.coverImage.id)
      setFormData(prev => ({
        ...prev,
        coverImage: undefined
      }))
    } catch(error) {
      console.error('Error deleting cover image:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete cover image')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    
    const file = e.target.files[0]
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Cover image must be less than 10MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setSelectedImage(file)
    setShowCropper(true)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Convert Blob to File
      const croppedFile = new File([croppedBlob], 'cover-image.jpg', {
        type: 'image/jpeg'
      })

      // Check if there's an existing cover image and delete it
      if (formData.coverImage?.id) {
        await deleteCoverImage(user.uid, formData.coverImage.id)
      }

      // Upload the cropped image using the new function
      const { imageId, downloadURL } = await uploadCoverPicture(user.uid, croppedFile)

      // Create new cover image data
      const newCoverImage = {
        id: imageId,
        url: downloadURL
      }

      // Update form state
      const updatedFormData = {
        ...formData,
        coverImage: newCoverImage
      };
      
      setFormData(updatedFormData);

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          coverImage: updatedFormData?.coverImage
        };
        setProfessionalProfileData(updatedProfileData);
      }

      // Update the cover image in the database immediately
      await updateProfessionalCoverImage(user.uid, newCoverImage);

      setShowCropper(false)
      setSelectedImage(null)
    } catch (error) {
      console.error('Error uploading cover image:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload cover image')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setSelectedImage(null)
  }

  const handleServiceToggle = async (service: ServiceType) => {
    if (!formData.services.filter(s => s !== service)) {
      return;
    }

    let updatedServices = [...formData.services];

    if (formData.services.includes(service)) {
      // remove service
      updatedServices = formData.services.filter(s => s !== service);
    } else {
      // add service
      updatedServices = [...formData.services, service]
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

      setFormData(prev => ({
        ...prev,
        services: updatedServices
      }));

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          services: updatedServices
        };
        setProfessionalProfileData(updatedProfileData);
      }
      await saveProfessionalProfileStep(user.uid, {
        ...professionalProfileData,
        services: updatedServices
      })
    } catch (error) {
      console.error('Error adding services:', error)
      setError(error instanceof Error ? error.message : 'Failed to add services')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleSkillAdd = async () => {
    if (!newSkill.trim()) {
      return;
    }

    if (formData.skills.includes(newSkill.trim())) {
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

      const updatedSkills = [...formData.skills, newSkill.trim()]

      setFormData(prev => ({
        ...prev,
        skills: updatedSkills
      }));

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          skills: updatedSkills
        };
        setProfessionalProfileData(updatedProfileData);
      }


      await saveProfessionalProfileStep(user.uid, {
        ...professionalProfileData,
        skills: updatedSkills
      })


    } catch (error) {
      console.error('Error adding skills:', error)
      setError(error instanceof Error ? error.message : 'Failed to add skills')
    } finally {
      setNewSkill('');
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleSkillRemove = async (index: number) => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const updatedSkills = formData.skills.filter((_, i) => i !== index)

      setFormData(prev => ({
        ...prev,
        skills: updatedSkills
      }));

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          skills: updatedSkills
        };
        setProfessionalProfileData(updatedProfileData);
      }


      await saveProfessionalProfileStep(user.uid, {
        ...professionalProfileData,
        skills: updatedSkills
      })


    } catch (error) {
      console.error('Error removing skills:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove skills')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleEquipmentAdd = async () => {
    if (!newEquipment.trim()) {
      return;
    }

    if (formData.equipment.includes(newEquipment.trim())) {
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

      const updatedEquipment = [...formData.equipment, newEquipment.trim()]

      setFormData(prev => ({
        ...prev,
        equipment: updatedEquipment
      }));

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          equipment: updatedEquipment
        };
        setProfessionalProfileData(updatedProfileData);
      }


      await saveProfessionalProfileStep(user.uid, {
        ...professionalProfileData,
        equipment: updatedEquipment
      })


    } catch (error) {
      console.error('Error adding equipment:', error)
      setError(error instanceof Error ? error.message : 'Failed to add equipment')
    } finally {
      setNewEquipment('');
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleEquipmentRemove = async (index: number) => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const updatedEquipment = formData.equipment.filter((_, i) => i !== index)

      setFormData(prev => ({
        ...prev,
        equipment: updatedEquipment
      }));

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          equipment: updatedEquipment
        };
        setProfessionalProfileData(updatedProfileData);
      }


      await saveProfessionalProfileStep(user.uid, {
        ...professionalProfileData,
        equipment: updatedEquipment
      })


    } catch (error) {
      console.error('Error removing equipment:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove equipment')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      bio: e.target.value
    }));
  }

  const handleBioBlur = async () => {
    const user = auth.currentUser
    if (!user) throw new Error('No user found')

    if (!formData.bio) {
      return;
    }
    if (formData.bio === professionalProfileData?.bio) {
      return;
    }

    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          bio: formData.bio
        };
        setProfessionalProfileData(updatedProfileData);
      }

      await saveProfessionalProfileStep(user.uid, { bio: formData.bio });
    } catch (error) {
      console.error('Error saving bio:', error)
      setError(error instanceof Error ? error.message : 'Failed to save bio')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleExperienceChange = (field: 'years' | 'completedProjects', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        [field]: numValue
      }
    }));
  }

  const handleExperienceBlur = async () => {
    const user = auth.currentUser
    if (!user) throw new Error('No user found')

    if (formData.experience.years === professionalProfileData?.experience.years 
      && formData.experience.completedProjects === professionalProfileData?.experience.completedProjects) {
      return;
    }

    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          experience: formData?.experience
        };
        setProfessionalProfileData(updatedProfileData);
      }

      await saveProfessionalProfileStep(user.uid, { experience: formData.experience });
    } catch (error) {
      console.error('Error saving experience:', error)
      setError(error instanceof Error ? error.message : 'Failed to save experience')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    isSaving.current = true

    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Update the profile data
      const updatedProfile = {
        bio: formData.bio,
        skills: formData.skills,
        services: formData.services,
        equipment: formData.equipment,
        experience: formData.experience,
        coverImage: formData.coverImage
      };

      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          bio: updatedProfile?.bio,
          skills: updatedProfile?.skills,
          services: updatedProfile?.services,
          experience: updatedProfile?.experience,
          equipment: updatedProfile?.equipment,
          coverImage: updatedProfile?.coverImage
        };
        setProfessionalProfileData(updatedProfileData);
      }

      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, updatedProfile);
      
      // Navigate to the next step
      router.push('/pro-signup/create-profile/portfolio?from=review');
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-semibold text-dark-text-primary mb-4">
              {'Basic Information & Services'}
            </h2>
          </div>

          <div className="space-y-8">
            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Cover Image
              </label>
              <div className="relative aspect-[2.7] rounded-lg overflow-hidden bg-dark-input">
                {formData.coverImage ? (
                  <>
                    <Image
                      src={formData.coverImage.url}
                      alt="Cover"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    <button
                      type="button"
                      onClick={handleCoverImageDelete}
                      className="absolute top-2 right-2 p-1 bg-dark-bg/80 rounded-full text-dark-text-secondary hover:text-dark-text-primary transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-dark-card transition-colors">
                    <ImageIcon className="w-8 h-8 text-dark-text-secondary mb-2" />
                    <span className="text-sm text-dark-text-secondary">
                      {loading ? 'Processing...' : 'Upload Cover Image (1920x720)'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverImageSelect}
                      disabled={loading}
                    />
                  </label>
                )}
              </div>
              <p className="mt-1 text-xs text-dark-text-muted">
                Recommended size: 1920x720 pixels. Max file size: 10MB
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={handleBioChange}
                onBlur={handleBioBlur}
                maxLength={MAX_BIO_LENGTH}
                rows={4}
                className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary resize-none"
                placeholder="Tell us about yourself and your experience..."
                required
              />
              <p className="mt-1 text-sm text-dark-text-muted text-right">
                {formData.bio.length}/{MAX_BIO_LENGTH}
              </p>
            </div>

            {/* Services Section */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-4">
                Services (Select at least one)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AVAILABLE_SERVICES.map(({ id, icon: Icon }) => (
                  <label
                    key={id}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.services.includes(id)
                        ? 'border-primary-400 bg-primary-400/5 text-dark-text-primary shadow-sm shadow-primary-400/10'
                        : 'border-primary-400/20 bg-dark-bg hover:border-primary-400/50 hover:bg-primary-400/5 text-dark-text-secondary hover:text-dark-text-primary'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        formData.services.includes(id)
                          ? 'bg-primary-400/20 text-primary-400'
                          : 'bg-dark-input text-dark-text-muted'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.services.includes(id)}
                        onChange={() => handleServiceToggle(id as ServiceType)}
                        className="sr-only"
                      />
                      <span className="text-base font-medium">
                        {id}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Skills
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-dark-input rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(index)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
                  className="flex-1 px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                  placeholder="Add a skill..."
                />
                <button
                  type="button"
                  onClick={handleSkillAdd}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Equipment
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {formData.equipment.map((item: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-dark-input rounded-full text-sm flex items-center gap-1"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleEquipmentRemove(index)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleEquipmentAdd())}
                  className="flex-1 px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                  placeholder="Add equipment..."
                />
                <button
                  type="button"
                  onClick={handleEquipmentAdd}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience.years}
                  onChange={(e) => handleExperienceChange('years', e.target.value)}
                  onBlur={() => handleExperienceBlur()}
                  className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Completed Projects
                </label>
                <input
                  type="number"
                  value={formData.experience.completedProjects}
                  onChange={(e) => handleExperienceChange('completedProjects', e.target.value)}
                  onBlur={() => handleExperienceBlur()}
                  className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-6">
            <button
              type="submit"
              disabled={loading || formData.services.length === 0}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : 'Continue'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {showCropper && selectedImage && (
            <CoverImageCropper
              imageFile={selectedImage}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          )}
        </>
      )}
    </form>
  )
} 