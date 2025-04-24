'use client'

import { useState } from 'react'
import { MapPin, Globe } from 'lucide-react'
import { getAllCategories, getAllSubCategories } from '@/config/serviceCategories'

interface ProfessionalFiltersProps {
  onCategoryChange: (category: string) => void
  onSubCategoryChange: (subcategory: string) => void
  onPriceRangeChange: (range: [number, number]) => void
  onLocationChange: (location: { city?: string; remote?: boolean; maxDistance?: number }) => void
}

export default function ProfessionalFilters({
  onCategoryChange,
  onSubCategoryChange,
  onPriceRangeChange,
  onLocationChange,
}: ProfessionalFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [city, setCity] = useState('')
  const [showRemoteOnly, setShowRemoteOnly] = useState(false)
  const [maxDistance, setMaxDistance] = useState<number>(50)

  const categories = getAllCategories()
  const subcategories = getAllSubCategories()

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = categoryId === selectedCategory ? '' : categoryId
    setSelectedCategory(newCategory)
    setSelectedSubCategory('')
    onCategoryChange(newCategory)
    setExpanded(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))
  }

  const handleSubCategoryClick = (subcategoryId: string) => {
    setSelectedSubCategory(subcategoryId)
    onSubCategoryChange(subcategoryId)
  }

  const handlePriceChange = (value: number, type: 'min' | 'max') => {
    const newRange: [number, number] = [...priceRange]
    if (type === 'min') {
      newRange[0] = value
    } else {
      newRange[1] = value
    }
    setPriceRange(newRange)
    onPriceRangeChange(newRange)
  }

  const handleLocationChange = () => {
    onLocationChange({
      city: city || undefined,
      remote: showRemoteOnly,
      maxDistance: maxDistance,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-dark-text-primary mb-4">Categories</h3>
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id} className="space-y-2">
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-dark-text-primary'
                    : 'text-dark-text-secondary hover:bg-dark-input'
                }`}
              >
                {category.title}
                {category.description && (
                  <p className="text-sm text-dark-text-muted mt-1">{category.description}</p>
                )}
              </button>
              
              {expanded[category.id] && (
                <div className="ml-4 space-y-2">
                  {subcategories
                    .filter(sub => sub.parentCategory === category.id)
                    .map(subcategory => (
                      <div key={subcategory.id}>
                        <button
                          onClick={() => handleSubCategoryClick(subcategory.id)}
                          className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                            selectedSubCategory === subcategory.id
                              ? 'bg-primary-500 text-dark-text-primary'
                              : 'text-dark-text-muted hover:text-dark-text-primary'
                          }`}
                        >
                          {subcategory.title}
                        </button>
                        {selectedSubCategory === subcategory.id && (
                          <div className="ml-4 mt-2 space-y-1">
                            {subcategory.services.map((service, index) => (
                              <div
                                key={index}
                                className="text-sm text-dark-text-secondary px-4 py-1"
                              >
                                {service}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-dark-text-primary mb-4">Location</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-dark-text-muted mr-2" />
              <label className="text-sm text-dark-text-secondary">City</label>
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                handleLocationChange()
              }}
              placeholder="Enter city name"
              className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary placeholder-dark-text-muted"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={showRemoteOnly}
                onChange={(e) => {
                  setShowRemoteOnly(e.target.checked)
                  handleLocationChange()
                }}
                className="rounded border-dark-border text-primary-600"
              />
              <span className="text-dark-text-secondary flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Remote work only
              </span>
            </label>
          </div>

          {!showRemoteOnly && city && (
            <div>
              <label className="text-sm text-dark-text-secondary block mb-2">
                Maximum travel distance (miles)
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={maxDistance}
                onChange={(e) => {
                  setMaxDistance(Number(e.target.value))
                  handleLocationChange()
                }}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-dark-text-muted mt-1">
                <span>{maxDistance} miles</span>
                <span>200 miles</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-dark-text-primary mb-4">Price Range (per hour)</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-dark-text-secondary">Minimum ($)</label>
            <input
              type="number"
              min={0}
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(Number(e.target.value), 'min')}
              className="w-full mt-1 px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
            />
          </div>
          <div>
            <label className="text-sm text-dark-text-secondary">Maximum ($)</label>
            <input
              type="number"
              min={priceRange[0]}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(Number(e.target.value), 'max')}
              className="w-full mt-1 px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-dark-text-primary mb-4">Availability</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded border-dark-border text-primary-600" />
            <span className="text-dark-text-secondary">Available Now</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded border-dark-border text-primary-600" />
            <span className="text-dark-text-secondary">Available This Week</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded border-dark-border text-primary-600" />
            <span className="text-dark-text-secondary">Weekend Availability</span>
          </label>
        </div>
      </div>
    </div>
  )
} 