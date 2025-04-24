'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { Trash2, ImageIcon, Loader2, ArrowRight } from 'lucide-react'
import { uploadPortfolioFile, deletePortfolioFile } from '@/lib/firebase/storage'
import PortfolioMediaCropper from '@/components/common/PortfolioMediaCropper'
import { useProfessionalProfileData } from '@/hooks/useProfessionalProfileData'
import type { PortfolioFile, ProfileExternalLink, ProfessionalProfile } from '@/types/professional'
import { saveProfessionalProfileStep } from '@/lib/firebase/profiles'

// Constants for file upload
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PORTFOLIO_FILES = 6;

// Define a type for the portfolio form data
export type PortfolioFormData = {
  files: PortfolioFile[];
  externalLinks: ProfileExternalLink[];
}

function convertProfessionalProfileToPortfolioFormData(professionalProfile: ProfessionalProfile): PortfolioFormData {
  return {
    files: Array.isArray(professionalProfile.portfolio?.files)
      ? professionalProfile.portfolio.files
      : professionalProfile.portfolio?.files
        ? Object.values(professionalProfile.portfolio.files as Record<string, PortfolioFile>)
        : [],
    externalLinks: Array.isArray(professionalProfile.portfolio?.externalLinks)
      ? professionalProfile.portfolio.externalLinks
      : professionalProfile.portfolio?.externalLinks
        ? Object.values(professionalProfile.portfolio.externalLinks as Record<string, ProfileExternalLink>)
        : []
  }
}

// Helper function to get readable file size
const getReadableFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

export default function PortfolioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromParam = searchParams?.get('from')
  const { professionalProfileData, loading: dataLoading, setProfessionalProfileData } = useProfessionalProfileData()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [portfolioFormData, setPortfolioFormData] = useState<PortfolioFormData>({
    files: [],
    externalLinks: []
  })
  const [newLink, setNewLink] = useState({
    platform: 'Instagram',
    url: ''
  })
  const isSaving = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load data based on the 'from' parameter
  useEffect(() => {
    const initializePortfolio = async () => {
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
          setPortfolioFormData(convertProfessionalProfileToPortfolioFormData(professionalProfileData));
          setLoading(false);
        } else {
          setLoading(false);
          router.push('/profile');
          return;
        }
        
      } catch (error) {
        console.error('Error initializing portfolio:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize portfolio');
      } finally {
        setLoading(false);
      }
    };
    
    initializePortfolio();
  }, [fromParam, router, loading, setProfessionalProfileData, professionalProfileData]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setError(null)

    // Check portfolio file limit
    if (portfolioFormData.files.length >= MAX_PORTFOLIO_FILES) {
      setError(`Maximum limit reached: You can only upload up to ${MAX_PORTFOLIO_FILES} files. Please delete some existing files to add more.`)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      return
    }

    const file = files[0]
    
    // Validate file type with specific formats
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(`Unsupported file format: ${file.type}. Allowed formats: ${ALLOWED_FILE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`)
      
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      return
    }

    // Validate image file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large: ${getReadableFileSize(file.size)}. Maximum size allowed is ${getReadableFileSize(MAX_FILE_SIZE)}.`)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      return
    }

    setSelectedFiles([file])
  }

  // Image cropper is open when files are selected
  const isCropperOpen = selectedFiles.length > 0

  // Upload portfolio files
  const handleFileUpload = async (croppedBlob: Blob) => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true

      const user = auth.currentUser
      if (!user) throw new Error('No user found')

      // Convert Blob to File
      const file = new File([croppedBlob], 'portfolio-image.jpg', { type: 'image/jpeg' })
      const { fileId, downloadURL } = await uploadPortfolioFile(user.uid, file)

      const newFile: PortfolioFile = {
        id: fileId,
        url: downloadURL,
        type: 'image',
        mimeType: 'image/jpeg'
      }

      // Update portfolio data with the new file
      const updatedPortfolioData: PortfolioFormData = {
        ...portfolioFormData,
        files: [
          ...portfolioFormData.files,
          newFile
        ]
      }
      
      setPortfolioFormData(updatedPortfolioData)
      
      // Update the profile data in the hook as well
      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          portfolio: updatedPortfolioData
        };
        setProfessionalProfileData(updatedProfileData);
      }
      
      // Save to Firebase immediately for this specific file
      await saveProfessionalProfileStep(user.uid, { 
        portfolio: updatedPortfolioData 
      })

      setSelectedFiles([])
    } catch (err) {
      console.error('Error uploading file:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  // Handle file delete
  const handleFileDelete = async (fileId: string) => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true
      
      const user = auth.currentUser
      if (!user) throw new Error('No user found')
      
      await deletePortfolioFile(user.uid, fileId)
      
      // Update portfolio data by filtering out the deleted file
      const updatedPortfolioData: PortfolioFormData = {
        ...portfolioFormData,
        files: portfolioFormData.files.filter(file => file.id !== fileId)
      }
      
      setPortfolioFormData(updatedPortfolioData)
      
      // Update the profile data in the hook
      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          portfolio: updatedPortfolioData
        };
        setProfessionalProfileData(updatedProfileData);
      }
      
      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, { 
        portfolio: updatedPortfolioData 
      })
    } catch (err) {
      console.error('Error deleting file:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  // Add external link
  const handleAddLink = async () => {
    if (!newLink.platform.trim() || !newLink.url.trim()) {
      setError('Please enter both platform name and URL')
      return
    }
    
    // Basic URL validation
    let isValidUrl = false
    try {
      new URL(newLink.url)
      isValidUrl = true
    } catch {
      // Invalid URL format
    }
    
    if (!isValidUrl) {
      setError('Please enter a valid URL (including https://)')
      return
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
      
      // Update portfolio data with the new link
      const updatedPortfolioData: PortfolioFormData = {
        ...portfolioFormData,
        externalLinks: [
          ...portfolioFormData.externalLinks,
          { ...newLink }
        ]
      }
      
      setPortfolioFormData(updatedPortfolioData)
      setNewLink({ platform: 'Instagram', url: '' })
      
      // Update the profile data in the hook
      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          portfolio: updatedPortfolioData
        };
        setProfessionalProfileData(updatedProfileData);
      }
      
      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, { 
        portfolio: updatedPortfolioData 
      })
    } catch (err) {
      console.error('Error adding link:', err)
      setError(err instanceof Error ? err.message : 'Failed to add link')
    } finally {
      setLoading(false)
      isSaving.current = false
    }
  }

  // Remove external link
  const handleRemoveLink = async (index: number) => {
    try {
      setLoading(true)
      setError(null)
      isSaving.current = true
      
      const user = auth.currentUser
      if (!user) throw new Error('No user found')
      
      // Update portfolio data by removing the link at specified index
      const updatedPortfolioData: PortfolioFormData = {
        ...portfolioFormData,
        externalLinks: portfolioFormData.externalLinks.filter((_, i) => i !== index)
      }
      
      setPortfolioFormData(updatedPortfolioData)
      
      // Update the profile data in the hook
      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          portfolio: updatedPortfolioData
        };
        setProfessionalProfileData(updatedProfileData);
      }
      
      // Save to Firebase
      await saveProfessionalProfileStep(user.uid, { 
        portfolio: updatedPortfolioData 
      })
    } catch (err) {
      console.error('Error removing link:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove link')
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
      
      // Final validation before moving to next step
      if (portfolioFormData.files.length === 0 && portfolioFormData.externalLinks.length === 0) {
        setError('Please add at least one portfolio item (file or external link)')
        setLoading(false)
        return
      }
      
      // Update the profile data in the hook
      if (professionalProfileData) {
        const updatedProfileData = {
          ...professionalProfileData,
          portfolio: portfolioFormData
        };
        setProfessionalProfileData(updatedProfileData);
      }
      
      // Save to Firebase one last time before navigating
      await saveProfessionalProfileStep(user.uid, {
        portfolio: portfolioFormData
      })
      
      // Navigate to next step
      router.push('/pro-signup/create-profile/availability?from=review')
    } catch (err) {
      console.error('Error saving portfolio:', err)
      setError(err instanceof Error ? err.message : 'Failed to save portfolio')
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
            <h2 className="text-xl font-semibold text-dark-text-primary mb-2">Portfolio</h2>
            <p className="text-dark-text-secondary mb-6">
              Upload your work samples and add links to your external portfolios
            </p>

            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-dark-border rounded-lg p-8">
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="portfolio-file-input"
                    disabled={loading}
                    ref={fileInputRef}
                  />
                  <button
                    onClick={() => document.getElementById('portfolio-file-input')?.click()}
                    disabled={loading}
                    className="inline-flex items-center justify-center p-2 bg-dark-input rounded-full mb-4 disabled:opacity-50"
                  >
                    <ImageIcon className="w-6 h-6 text-dark-text-primary" />
                  </button>
                  <div className="text-dark-text-primary font-medium">
                    Click to upload or drag and drop
                  </div>
                  <p className="text-dark-text-secondary text-sm mt-1">
                    Images: JPG, PNG, WebP (max 10MB)
                  </p>
                  <p className="text-dark-text-muted text-sm mt-1">
                    Images will be cropped to 1:1 ratio • {MAX_PORTFOLIO_FILES - portfolioFormData.files.length} slots remaining
                  </p>
                </div>
              </div>

              {/* Uploaded Files */}
              {portfolioFormData.files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.isArray(portfolioFormData.files) 
                    ? portfolioFormData.files.map((file: PortfolioFile) => (
                      <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden bg-dark-input">
                        <img
                          src={file.url}
                          alt="Portfolio item"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleFileDelete(file.id)}
                          className="absolute top-2 right-2 p-1 bg-dark-bg/80 rounded-full hover:bg-dark-bg z-10"
                        >
                          <Trash2 className="w-4 h-4 text-dark-text-primary" />
                        </button>
                      </div>
                    ))
                    : Object.values(portfolioFormData.files as Record<string, PortfolioFile>).map((file: PortfolioFile) => (
                      <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden bg-dark-input">
                        <img
                          src={file.url}
                          alt="Portfolio item"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleFileDelete(file.id)}
                          className="absolute top-2 right-2 p-1 bg-dark-bg/80 rounded-full hover:bg-dark-bg z-10"
                        >
                          <Trash2 className="w-4 h-4 text-dark-text-primary" />
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* External Links Section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-dark-text-primary mb-4">
                External Portfolio Links
              </h3>
              <div className="flex gap-2">
                <select
                  value={newLink.platform}
                  onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                  className="bg-dark-input border border-dark-border rounded-md px-3 py-2 text-dark-text-primary"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Behance">Behance</option>
                  <option value="Dribbble">Dribbble</option>
                  <option value="Portfolio">Portfolio Website</option>
                </select>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://"
                  className="flex-1 bg-dark-input border border-dark-border rounded-md px-3 py-2 text-dark-text-primary"
                />
                <button
                  onClick={handleAddLink}
                  disabled={!newLink.url.trim() || loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 disabled:opacity-50"
                >
                  Add Link
                </button>
              </div>

              {/* External Links List */}
              {portfolioFormData.externalLinks.length > 0 && (
                <div className="space-y-2 mt-4">
                  {Array.isArray(portfolioFormData.externalLinks)
                    ? portfolioFormData.externalLinks.map((link: ProfileExternalLink, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-dark-input rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-dark-text-secondary">{link.platform}</span>
                          <span className="text-dark-text-primary">{link.url}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveLink(index)}
                          className="text-dark-text-muted hover:text-dark-text-primary"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                    : Object.values(portfolioFormData.externalLinks as Record<string, ProfileExternalLink>).map((link: ProfileExternalLink, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-dark-input rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-dark-text-secondary">{link.platform}</span>
                          <span className="text-dark-text-primary">{link.url}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveLink(index)}
                          className="text-dark-text-muted hover:text-dark-text-primary"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              onClick={() => router.push('/pro-signup/create-profile/basic-info?from=review')}
              className="px-4 py-2 border border-dark-border text-dark-text-primary rounded-md hover:bg-dark-input"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : 'Continue'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* File Cropper Modal */}
          {isCropperOpen && (
            <PortfolioMediaCropper
              file={selectedFiles[0]}
              onCropComplete={handleFileUpload}
              onCancel={() => setSelectedFiles([])}
              config={{
                aspectRatio: 1,
                maxWidth: 1000,
                maxHeight: 1000,
                quality: 0.9
              }}
            />
          )}
        </>
      )}
    </div>
  )
} 