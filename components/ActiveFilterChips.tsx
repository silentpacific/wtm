import React from 'react'
import { X } from 'lucide-react'
import type { ActiveFilter } from '../types'

interface ActiveFilterChipsProps {
  filters: ActiveFilter[]
  onRemove: (filterId: string) => void
  onAddFilters: () => void
}

export function ActiveFilterChips({ filters, onRemove, onAddFilters }: ActiveFilterChipsProps) {
  // Only show if there are active filters
  if (filters.length === 0) {
    return null
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
        
        {/* REMOVED: The duplicate "+ Filters" button that was causing the issue */}
      </div>
    </div>
  )
}