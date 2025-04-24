'use client'

import { useState } from 'react'
import ProfessionalCard from '@/components/professionals/ProfessionalCard'
import ProfessionalFilters from '@/components/professionals/ProfessionalFilters'
import ProfessionalSearch from '@/components/professionals/ProfessionalSearch'
import MainLayout from '@/components/layout/MainLayout'
import type { VerificationStatus } from '@/types/professional'

// Mock data - in a real app, this would come from an API
const mockProfessionals = [
  {
    id: '1',
    name: 'John Smith',
    title: 'Social Media & Lifestyle Photographer',
    description: 'Specializing in creating engaging content for social media influencers and lifestyle brands. Expert in Instagram, TikTok, and LinkedIn photography.',
    price: 75,
    rating: 4.9,
    completedJobs: 124,
    category: 'Shooting Services (Capture-Only)',
    subcategory: 'Photography Services',
    services: [
      'Social Media & Influencer Photography (Instagram, TikTok, LinkedIn)',
      'Portrait & Headshot Photography',
      'Travel & Adventure Photography',
      'Personal Branding & Profile Photography (LinkedIn, Resume)',
    ],
    availability: 'available' as const,
    locations: {
      cities: ['New York, NY', 'Brooklyn, NY', 'Jersey City, NJ'],
      remote: true,
      maxTravelDistance: 50,
    },
    verification: {
      isPhoneVerified: true,
      isEmailVerified: true,
      isLocationVerified: true,
      isPaymentVerified: true,
      isSecurityDepositSetup: true,
      isCheckoutMethodVerified: true,
      verificationBadge: 'pro_verified' as const,
      lastVerificationDate: '2024-03-15',
    } satisfies VerificationStatus,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    title: 'Professional Event Videographer',
    description: 'Experienced in capturing weddings, corporate events, and social gatherings with cinematic style. Specializing in multi-camera setups and live streaming.',
    price: 100,
    rating: 4.8,
    completedJobs: 89,
    category: 'Shooting Services (Capture-Only)',
    subcategory: 'Videography Services',
    services: [
      'Party & Private Event Video Shoots',
      'Wedding, Engagement & Proposal Filming',
      'Business & Corporate Video Filming (Interviews, Testimonials)',
      'Multi-Camera Streaming Production',
    ],
    availability: 'busy' as const,
    locations: {
      cities: ['Los Angeles, CA', 'Orange County, CA'],
      remote: false,
      maxTravelDistance: 100,
    },
    verification: {
      isPhoneVerified: true,
      isEmailVerified: true,
      isLocationVerified: true,
      isPaymentVerified: true,
      isSecurityDepositSetup: true,
      isCheckoutMethodVerified: false,
      verificationBadge: 'verified' as const,
      lastVerificationDate: '2024-03-10',
    } satisfies VerificationStatus,
  },
  {
    id: '3',
    name: 'Mike Chen',
    title: 'Social Media Video Editor',
    description: 'Expert in creating engaging short-form content for TikTok, Instagram Reels, and YouTube Shorts. Specializing in viral-worthy transitions and effects.',
    price: 50,
    rating: 4.7,
    completedJobs: 156,
    category: 'Editing Services (Post-Production Only)',
    subcategory: 'Video Editing Services',
    services: [
      'TikTok & Instagram Reels Edits (Transitions, Captions)',
      'YouTube Vlog Editing',
      'Short-Form Content Editing (30-60 sec clips)',
      'Twitch & YouTube Gaming Highlights',
    ],
    availability: 'available' as const,
    locations: {
      cities: [],
      remote: true,
    },
    verification: {
      isPhoneVerified: true,
      isEmailVerified: true,
      isLocationVerified: true,
      isPaymentVerified: true,
      isSecurityDepositSetup: false,
      isCheckoutMethodVerified: true,
      verificationBadge: 'verified' as const,
      lastVerificationDate: '2024-03-01',
    } satisfies VerificationStatus,
  },
  {
    id: '4',
    name: 'Emily Davis',
    title: 'Full-Service Content Creator',
    description: 'End-to-end content creation including photography, editing, and social media strategy. Helping brands build a strong visual presence.',
    price: 120,
    rating: 4.9,
    completedJobs: 67,
    category: 'Full-Service Packages (Capture + Editing)',
    subcategory: 'Photography + Photo Editing (Full Package)',
    services: [
      'Social Media Content Creation (Branding & Profile Photoshoots)',
      'Business & Product Photo Package (Shoot + Edit for Ads)',
      'Event & Wedding Photography + Editing',
    ],
    availability: 'offline' as const,
    locations: {
      cities: ['Miami, FL', 'Fort Lauderdale, FL'],
      remote: true,
      maxTravelDistance: 25,
    },
    verification: {
      isPhoneVerified: true,
      isEmailVerified: true,
      isLocationVerified: true,
      isPaymentVerified: true,
      isSecurityDepositSetup: true,
      isCheckoutMethodVerified: true,
      verificationBadge: 'verified' as const,
      lastVerificationDate: '2024-03-15',
    } satisfies VerificationStatus,
  },
  {
    id: '5',
    name: 'Alex Rivera',
    title: 'YouTube Content Specialist',
    description: 'Full-service YouTube content creator offering filming, editing, and channel optimization. Helping creators grow their audience with professional content.',
    price: 95,
    rating: 4.8,
    completedJobs: 92,
    category: 'Full-Service Packages (Capture + Editing)',
    subcategory: 'Videography + Video Editing (Full Package)',
    services: [
      'YouTube & Social Media Content Packages (Filming + Editing)',
      'Business Marketing Video Packages (Promo Ads, Brand Videos)',
      'Personal Branding Video Shoots (LinkedIn, Portfolio, Intro Videos)',
    ],
    availability: 'available' as const,
    locations: {
      cities: ['Austin, TX', 'San Antonio, TX'],
      remote: true,
      maxTravelDistance: 75,
    },
    verification: {
      isPhoneVerified: true,
      isEmailVerified: true,
      isLocationVerified: true,
      isPaymentVerified: true,
      isSecurityDepositSetup: true,
      isCheckoutMethodVerified: true,
      verificationBadge: 'verified' as const,
      lastVerificationDate: '2024-03-15',
    } satisfies VerificationStatus,
  },
  {
    id: '6',
    name: 'Lisa Wong',
    title: 'Professional Photo Editor',
    description: 'Expert in photo retouching and enhancement for e-commerce, portraits, and social media. Delivering polished, professional results.',
    price: 45,
    rating: 4.9,
    completedJobs: 203,
    category: 'Editing Services (Post-Production Only)',
    subcategory: 'Photo Editing Services',
    services: [
      'Professional Retouching (Headshots, Portraits, Branding)',
      'E-Commerce & Product Photo Editing',
      'Social Media Photo Enhancements (Filters, Aesthetic Edits)',
      'Background Removal & Photoshop Manipulations',
    ],
    availability: 'available' as const,
    locations: {
      cities: [],
      remote: true,
    },
    verification: {
      isPhoneVerified: true,
      isEmailVerified: true,
      isLocationVerified: true,
      isPaymentVerified: true,
      isSecurityDepositSetup: true,
      isCheckoutMethodVerified: true,
      verificationBadge: 'verified' as const,
      lastVerificationDate: '2024-03-15',
    } satisfies VerificationStatus,
  },
]

export default function BrowseProsPage() {
  const [filteredPros, setFilteredPros] = useState(mockProfessionals)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [locationFilter, setLocationFilter] = useState<{
    city?: string
    remote?: boolean
    maxDistance?: number
  }>({})

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterProfessionals(query, selectedCategory, selectedSubCategory, locationFilter)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubCategory('')
    filterProfessionals(searchQuery, category, '', locationFilter)
  }

  const handleSubCategoryChange = (subcategory: string) => {
    setSelectedSubCategory(subcategory)
    filterProfessionals(searchQuery, selectedCategory, subcategory, locationFilter)
  }

  const handleLocationChange = (location: { city?: string; remote?: boolean; maxDistance?: number }) => {
    setLocationFilter(location)
    filterProfessionals(searchQuery, selectedCategory, selectedSubCategory, location)
  }

  const handlePriceRangeChange = (range: [number, number]) => {
    filterProfessionals(searchQuery, selectedCategory, selectedSubCategory, locationFilter, range)
  }

  const filterProfessionals = (
    query: string,
    category: string,
    subcategory: string,
    location: { city?: string; remote?: boolean; maxDistance?: number },
    priceRange?: [number, number]
  ) => {
    let filtered = mockProfessionals

    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        (pro) =>
          pro.name.toLowerCase().includes(query.toLowerCase()) ||
          pro.title.toLowerCase().includes(query.toLowerCase()) ||
          pro.description.toLowerCase().includes(query.toLowerCase()) ||
          pro.services.some(service => 
            service.toLowerCase().includes(query.toLowerCase())
          )
      )
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter((pro) => pro.category === category)
    }

    // Apply subcategory filter
    if (subcategory) {
      filtered = filtered.filter((pro) => pro.subcategory === subcategory)
    }

    // Apply location filters
    if (location.remote) {
      filtered = filtered.filter((pro) => pro.locations.remote)
    } else if (location.city) {
      filtered = filtered.filter((pro) => {
        // Check if the professional works in or near the specified city
        const worksInCity = pro.locations.cities.some(city =>
          city.toLowerCase().includes(location.city!.toLowerCase())
        )

        // If they work in the city or remotely, include them
        if (worksInCity || pro.locations.remote) {
          return true
        }

        // If they're willing to travel and have a max travel distance, check if it's within range
        // Note: In a real app, you'd want to use proper distance calculation between cities
        return pro.locations.maxTravelDistance && pro.locations.maxTravelDistance >= (location.maxDistance || 0)
      })
    }

    // Apply price range filter
    if (priceRange) {
      filtered = filtered.filter(
        (pro) => pro.price >= priceRange[0] && pro.price <= priceRange[1]
      )
    }

    setFilteredPros(filtered)
  }

  return (
    <MainLayout>
      <div className="bg-dark-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <ProfessionalSearch onSearch={handleSearch} />
                <div className="mt-8">
                  <ProfessionalFilters
                    onCategoryChange={handleCategoryChange}
                    onSubCategoryChange={handleSubCategoryChange}
                    onPriceRangeChange={handlePriceRangeChange}
                    onLocationChange={handleLocationChange}
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-4">
                  Available Professionals
                </h1>
                <p className="text-dark-text-secondary">
                  Browse and connect with talented photographers and videographers in your area
                </p>
              </div>

              {/* Professionals Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPros.map((pro) => (
                  <ProfessionalCard
                    key={pro.id}
                    {...pro}
                  />
                ))}
              </div>

              {filteredPros.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-dark-text-secondary">
                    No professionals found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 