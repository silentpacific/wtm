import React, { useState, useEffect } from 'react'
import { X, Volume2, Plus, Minus } from 'lucide-react'
import type { Dish, DishTranslations } from '../types'

interface DishSheetModalProps {
  dish: Dish | null
  isOpen: boolean
  quantity: number
  customizations: string[]
  customNote: string
  question: string
  translations: DishTranslations | null
  onClose: () => void
  onQuantityChange: (newQty: number) => void
  onCustomizationToggle: (customization: string) => void
  onCustomNoteChange: (note: string) => void
  onQuestionChange: (question: string) => void
  onPronounce: () => void
  onAddUpdate: () => void
}

const COMMON_CUSTOMIZATIONS = [
  'No onions', 'Extra spicy', 'Mild spice', 'On the side', 'Extra sauce',
  'No sauce', 'Well done', 'Medium rare', 'Extra vegetables', 'Less oil'
]

export function DishSheetModal({
  dish,
  isOpen,
  quantity,
  customizations,
  customNote,
  question,
  translations,
  onClose,
  onQuantityChange,
  onCustomizationToggle,
  onCustomNoteChange,
  onQuestionChange,
  onPronounce,
  onAddUpdate
}: DishSheetModalProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity)

  useEffect(() => {
    setLocalQuantity(quantity)
  }, [quantity])

  if (!isOpen || !dish || !translations) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50">
      <div className="bg-white rounded-t-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold truncate mr-4">
            {translations.name}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onPronounce}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"
              aria-label={`Pronounce ${translations.name}`}
            >
              <Volume2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="Close dish details"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Image */}
          {dish.imageUrl && (
            <img
              src={dish.imageUrl}
              alt={translations.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          
          {/* Description */}
          {translations.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed">
                {translations.description}
              </p>
            </div>
          )}
          
          {/* Allergens */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contains Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                  >
                    ⚠️ {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Diet compliance */}
          {dish.diets && dish.diets.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dietary Information</h4>
              <div className="flex flex-wrap gap-2">
                {dish.diets.map((diet) => (
                  <span
                    key={diet}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    ✅ {diet}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Customization chips */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Quick Customizations</h4>
            <div className="flex flex-wrap gap-2">
              {COMMON_CUSTOMIZATIONS.map((customization) => (
                <button
                  key={customization}
                  onClick={() => onCustomizationToggle(customization)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    customizations.includes(customization)
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {customization}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom note */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Add Something Extras
            </label>
            <textarea
              value={customNote}
              onChange={(e) => onCustomNoteChange(e.target.value)}
              placeholder="Any special requests or modifications..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          {/* Question field */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Ask About This Dish
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => onQuestionChange(e.target.value)}
              placeholder="e.g., Can this be made without garlic?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocalQuantity(Math.max(0, localQuantity - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                disabled={localQuantity <= 0}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[2rem] text-center font-medium text-lg">
                {localQuantity}
              </span>
              <button
                onClick={() => setLocalQuantity(localQuantity + 1)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <button
            onClick={() => {
              onQuantityChange(localQuantity)
              onAddUpdate()
            }}
            disabled={localQuantity <= 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quantity > 0 ? 'Update Order' : 'Add to Order'}
            {localQuantity > 0 && ` (${localQuantity})`}
          </button>
        </div>
      </div>
    </div>
  )
}