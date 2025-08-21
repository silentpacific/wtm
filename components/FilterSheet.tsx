import React from 'react'
import { X } from 'lucide-react'
import type { Allergen, Diet } from '../types'

interface FilterSheetProps {
  isOpen: boolean
  allergenFilters: Allergen[]
  dietFilters: Diet[]
  matchingDishCount: number
  onClose: () => void
  onAllergenToggle: (allergen: Allergen) => void
  onDietToggle: (diet: Diet) => void
  onApply: () => void
  onClear: () => void
}

const ALLERGEN_OPTIONS: Allergen[] = [
  'peanuts', 'treenuts', 'dairy', 'gluten', 'egg', 'soy', 'shellfish', 'sesame', 'fish', 'sulfites'
]

const DIET_OPTIONS: Diet[] = [
  'vegan', 'vegetarian', 'halal', 'kosher', 'jain', 'keto', 'low_fodmap', 'gluten_free'
]

const ALLERGEN_LABELS: Record<Allergen, string> = {
  peanuts: 'Peanuts',
  treenuts: 'Tree Nuts',
  dairy: 'Dairy',
  gluten: 'Gluten',
  egg: 'Eggs',
  soy: 'Soy',
  shellfish: 'Shellfish',
  sesame: 'Sesame',
  fish: 'Fish',
  sulfites: 'Sulfites'
}

const DIET_LABELS: Record<Diet, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  halal: 'Halal',
  kosher: 'Kosher',
  jain: 'Jain',
  keto: 'Keto',
  low_fodmap: 'Low FODMAP',
  gluten_free: 'Gluten Free'
}

export function FilterSheet({
  isOpen,
  allergenFilters,
  dietFilters,
  matchingDishCount,
  onClose,
  onAllergenToggle,
  onDietToggle,
  onApply,
  onClear
}: FilterSheetProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50">
      <div className="bg-white rounded-t-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Exclude Allergens */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Exclude Allergens</h4>
            <div className="grid grid-cols-2 gap-2">
              {ALLERGEN_OPTIONS.map((allergen) => (
                <button
                  key={allergen}
                  onClick={() => onAllergenToggle(allergen)}
                  className={`p-3 text-sm rounded-lg border transition-colors text-left ${
                    allergenFilters.includes(allergen)
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                  aria-pressed={allergenFilters.includes(allergen)}
                >
                  <span className="block">
                    {allergenFilters.includes(allergen) ? '❌' : '⚠️'} {ALLERGEN_LABELS[allergen]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Include Diets */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Include Diets</h4>
            <div className="grid grid-cols-2 gap-2">
              {DIET_OPTIONS.map((diet) => (
                <button
                  key={diet}
                  onClick={() => onDietToggle(diet)}
                  className={`p-3 text-sm rounded-lg border transition-colors text-left ${
                    dietFilters.includes(diet)
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                  aria-pressed={dietFilters.includes(diet)}
                >
                  <span className="block">
                    {dietFilters.includes(diet) ? '✅' : '🥗'} {DIET_LABELS[diet]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4">
          <div className="mb-3 text-center">
            <span className="text-sm text-gray-600">
              {matchingDishCount} dishes match your filters
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClear}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Clear All
            </button>
            <button
              onClick={onApply}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}