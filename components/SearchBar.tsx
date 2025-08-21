import React from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  placeholder: string
  onChange: (value: string) => void
  debounceMs?: number
}

export function SearchBar({ value, placeholder, onChange }: SearchBarProps) {
  return (
    <div className="px-4 py-3 border-b border-gray-200">
      <div className="relative">
        <Search 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          aria-label="Search dishes, ingredients, or allergens"
        />
      </div>
    </div>
  )
}
