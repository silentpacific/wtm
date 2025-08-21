import React from 'react'
import { Globe, Filter } from 'lucide-react'
import type { Language } from '../types'

interface TopBarProps {
  restaurantName: string
  currentLanguage: string
  languages: Language[]
  activeFiltersCount: number
  onLanguageChange: (lang: string) => void
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
  const [showLanguageSelect, setShowLanguageSelect] = React.useState(false)
  const currentLang = languages.find(l => l.code === currentLanguage)

  return (
    <div className="sticky top-0 bg-white shadow-sm z-50 border-b">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900 truncate flex-1 mr-4">
          {restaurantName}
        </h1>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageSelect(!showLanguageSelect)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px]"
              aria-label={`Current language: ${currentLang?.name}. Click to change language`}
              aria-expanded={showLanguageSelect}
              aria-haspopup="listbox"
            >
              <Globe size={16} aria-hidden="true" />
              <span className="text-sm">
                {currentLang?.flag} {currentLang?.name}
              </span>
            </button>

            {showLanguageSelect && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] z-10">
                <div role="listbox" aria-label="Select language">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      role="option"
                      aria-selected={currentLanguage === lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code)
                        setShowLanguageSelect(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 min-h-[44px] ${
                        currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={onFiltersClick}
            className="relative flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px]"
            aria-label={`Filters${activeFiltersCount > 0 ? ` (${activeFiltersCount} active)` : ''}`}
          >
            <Filter size={16} aria-hidden="true" />
            <span className="text-sm">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}