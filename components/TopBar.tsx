// components/TopBar.tsx - FIX #1: Remove country codes
import React from 'react'
import { Globe, Filter } from 'lucide-react'
import type { Language } from '../types'

interface TopBarProps {
  restaurantName: string
  currentLanguage: string
  languages: Language[]
  activeFiltersCount: number
  onLanguageChange: (language: string) => void
  onFiltersClick: () => void
}

export function TopBar({
  restaurantName,
  currentLanguage,
  languages,
  activeFiltersCount,
  onLanguageChange,
  onFiltersClick
}: TopBarProps) {
  const currentLang = languages.find(lang => lang.code === currentLanguage)

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Restaurant Name */}
      <h1 className="text-xl font-bold text-gray-900 truncate">
        {restaurantName}
      </h1>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Language Selector - FIX #1: Show only language name */}
        <div className="relative">
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Filter Button */}
        <button
          onClick={onFiltersClick}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 min-h-[44px]"
        >
          <Filter size={16} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}