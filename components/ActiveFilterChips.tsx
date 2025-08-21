// components/ActiveFilterChips.tsx
import React from 'react'
import { X, Plus } from 'lucide-react'
import type { ActiveFilter } from '../types'

interface ActiveFilterChipsProps {
  filters: ActiveFilter[]
  onRemove: (filterId: string) => void
  onAddFilters: () => void
}

export function ActiveFilterChips({ filters, onRemove, onAddFilters }: ActiveFilterChipsProps) {
  if (filters.length === 0) {
    return (
      <div className="px-4 py-2 border-b border-gray-200">
        <button
          onClick={onAddFilters}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 min-h-[44px]"
          aria-label="Add filters for allergens and dietary preferences"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="text-sm">Add Filters</span>
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 border-b border-gray-200">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onRemove(filter.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm min-h-[44px] ${
              filter.type === 'allergen' 
                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
            aria-label={`Remove ${filter.label} filter`}
          >
            <span>
              {filter.type === 'allergen' ? '❌' : '✅'} {filter.label}
            </span>
            <X size={14} aria-hidden="true" />
          </button>
        ))}
        
        <button
          onClick={onAddFilters}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 min-h-[44px]"
          aria-label="Add more filters"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="text-sm">More</span>
        </button>
      </div>
    </div>
  )
}