// components/DishSheetModal.tsx - Fixed with merged sections and proper layout
import React, { useState, useEffect } from 'react'
import { X, Volume2, Plus, Minus } from 'lucide-react'
import type { AccessibleDish, DishTranslations } from '../types'

interface DishSheetModalProps {
  dish: AccessibleDish | null
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
  const [combinedNote, setCombinedNote] = useState('')

  useEffect(() => {
    // Combine customNote and question into one field
    const combined = [customNote, question].filter(Boolean).join(' | ')
    setCombinedNote(combined)
  }, [customNote, question])

  const handleCombinedNoteChange = (value: string) => {
    setCombinedNote(value)
    // Split by ' | ' to separate custom note and question, but for now just use as custom note
    onCustomNoteChange(value)
    onQuestionChange('')
  }

  if (!isOpen || !dish || !translations) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[90vh] rounded-t-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex-1 mr-4">
            {translations.name}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onPronounce}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"
              aria-label="Pronounce dish name"
            >
              <Volume2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-4 space-y-6">
            {/* FIX #2: Fixed "Our Menu" cutoff - Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {dish.description && dish.description !== 'Loading explanation...' 
                  ? dish.description 
                  : 'Delicious dish from our menu. Tap for more details!'
                }
              </p>
            </div>

            {/* Allergens & Dietary Tags */}
            {(dish.allergens?.length > 0 || dish.dietaryTags?.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dietary Information</h3>
                <div className="space-y-2">
                  {dish.allergens?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">Contains Allergens:</h4>
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
                  
                  {dish.dietaryTags?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-800 mb-1">Dietary Options:</h4>
                      <div className="flex flex-wrap gap-2">
                        {dish.dietaryTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            ✅ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FIX #4 & #5: Removed Quick Customizations, merged sections */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Questions? Customization Requests?
              </h3>
              <textarea
                value={combinedNote}
                onChange={(e) => handleCombinedNoteChange(e.target.value)}
                placeholder="Any special requests, modifications, questions about ingredients, allergies, or how this dish is prepared..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be shown to restaurant staff with your order
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  disabled={quantity <= 0}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${(dish.price * Math.max(1, quantity)).toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={onAddUpdate}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 text-lg"
          >
            {quantity > 0 ? 'Update Order' : 'Add to Order'}
          </button>
        </div>
      </div>
    </div>
  )
}