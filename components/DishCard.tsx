import React, { memo } from 'react'
import { Info, Plus, Minus, Trash2, ChevronDown } from 'lucide-react'
import type { Dish, DishTranslations } from '../types'

interface DishCardProps {
  dish: Dish
  quantity: number
  showOriginal: boolean
  translations: DishTranslations
  onToggleOriginal: () => void
  onShowInfo: () => void
  onQuantityChange: (delta: number) => void
  onAddToOrder: () => void
}

export const DishCard = memo(function DishCard({
  dish,
  quantity,
  showOriginal,
  translations,
  onToggleOriginal,
  onShowInfo,
  onQuantityChange,
  onAddToOrder
}: DishCardProps) {
  const displayName = showOriginal ? translations.originalName : translations.name
  const displayDescription = showOriginal ? translations.originalDescription : translations.description
  
  return (
    <div className="p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between items-start gap-3">
        {/* Left side - Dish info */}
        <div className="flex-1 min-w-0">
          {/* Name and Original toggle */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-semibold text-gray-900 truncate">
              {displayName}
            </h4>
            {translations.name !== translations.originalName && (
              <button
                onClick={onToggleOriginal}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md"
                aria-label={showOriginal ? 'Show translation' : 'Show original name'}
              >
                <span>{showOriginal ? 'Translated' : 'Original'}</span>
                <ChevronDown size={12} />
              </button>
            )}
          </div>
          
          {/* Description */}
          {displayDescription && (
            <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">
              {displayDescription}
            </p>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {/* Spice level */}
            {dish.spiceLevel && dish.spiceLevel > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                {'🌶️'.repeat(dish.spiceLevel)} Spicy
              </span>
            )}
            
            {/* Dietary tags */}
            {dish.diets?.map((diet) => (
              <span
                key={diet}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                ✅ {diet}
              </span>
            ))}
            
            {/* Allergen warnings */}
            {dish.allergens?.slice(0, 2).map((allergen) => (
              <span
                key={allergen}
                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
              >
                ⚠️ {allergen}
              </span>
            ))}
            
            {dish.allergens && dish.allergens.length > 2 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                +{dish.allergens.length - 2} more
              </span>
            )}
          </div>
        </div>
        
        {/* Right side - Price and actions */}
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-bold text-gray-900 mb-2">
            ${dish.price.toFixed(2)}
          </p>
          
          <div className="flex items-center gap-2">
            {/* Info button */}
            <button
              onClick={onShowInfo}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 min-h-[44px] min-w-[44px]"
              aria-label={`More information about ${displayName}`}
            >
              <Info size={18} />
            </button>
            
            {/* Add/Quantity controls */}
            {quantity === 0 ? (
              <button
                onClick={onAddToOrder}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm min-h-[44px]"
                aria-label={`Add ${displayName} to order`}
              >
                <Plus size={16} />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantityChange(-1)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  aria-label={`Remove one ${displayName}`}
                >
                  <Minus size={16} />
                </button>
                <span 
                  className="min-w-[2rem] text-center font-medium"
                  aria-label={`${quantity} ${displayName} in order`}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(1)}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                  aria-label={`Add another ${displayName}`}
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => onQuantityChange(-quantity)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  aria-label={`Remove all ${displayName} from order`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})