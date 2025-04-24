'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { getAllServices } from '@/config/serviceCategories'

interface ProfessionalSearchProps {
  onSearch: (query: string) => void
}

export default function ProfessionalSearch({ onSearch }: ProfessionalSearchProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const services = getAllServices()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredSuggestions = services.filter(service =>
    service.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
    setShowSuggestions(false)
  }

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search services or professionals..."
            className="w-full pl-10 pr-4 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
      </form>

      {showSuggestions && query.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-dark-card border border-dark-border rounded-md shadow-lg">
          {filteredSuggestions.length > 0 ? (
            <ul>
              {filteredSuggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      setQuery(suggestion)
                      onSearch(suggestion)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-dark-text-secondary hover:bg-dark-input hover:text-dark-text-primary transition-colors"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-dark-text-muted">
              No matching services found
            </div>
          )}
        </div>
      )}
    </div>
  )
} 