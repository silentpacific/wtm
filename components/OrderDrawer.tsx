// components/OrderDrawer.tsx
import React, { useState } from 'react'
import { ShoppingCart, ChevronUp, ChevronDown, Copy, Share, Eye, Plus, Minus, Trash2 } from 'lucide-react'
import type { OrderItem } from '../types'

interface OrderDrawerProps {
  items: OrderItem[]
  isExpanded: boolean
  sessionTimer: string
  subtotal: number
  currency: string
  onToggleExpanded: () => void
  onQuantityChange: (itemId: string, delta: number) => void
  onRemoveItem: (itemId: string) => void
  onNotesChange: (notes: string) => void
  onCopySummary: () => void
  onShareOrder: () => void
  onShowToStaff: () => void
}

export function OrderDrawer({
  items,
  isExpanded,
  sessionTimer,
  subtotal,
  currency,
  onToggleExpanded,
  onQuantityChange,
  onRemoveItem,
  onNotesChange,
  onCopySummary,
  onShareOrder,
  onShowToStaff
}: OrderDrawerProps) {
  const [orderNotes, setOrderNotes] = useState('')
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      {!isExpanded ? (
        // Collapsed state
        <button
          onClick={onToggleExpanded}
          className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
          aria-label={`Order summary: ${totalItems} items, ${currency}${subtotal.toFixed(2)}. Tap to expand`}
        >
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} />
            <span className="font-medium">
              Order ({totalItems}) • {currency}{subtotal.toFixed(2)}
            </span>
            {sessionTimer && (
              <span className="text-xs text-gray-500">
                Session: {sessionTimer}
              </span>
            )}
          </div>
          <ChevronUp size={20} />
        </button>
      ) : (
        // Expanded state
        <div className="max-h-[70vh] flex flex-col">
          {/* Header */}
          <button
            onClick={onToggleExpanded}
            className="p-4 flex justify-between items-center border-b hover:bg-gray-50"
            aria-label="Collapse order"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} />
              <span className="font-medium">My Order ({totalItems} items)</span>
              {sessionTimer && (
                <span className="text-xs text-gray-500">
                  Session: {sessionTimer}
                </span>
              )}
            </div>
            <ChevronDown size={20} />
          </button>
          
          {/* Items list */}
          <div className="flex-1 overflow-y-auto max-h-60">
            {items.map((item) => (
              <div key={item.dish.id} className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.translations.name}</h4>
                    <p className="text-sm text-gray-600">
                      {currency}{item.dish.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.dish.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    aria-label={`Remove ${item.translations.name} from order`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onQuantityChange(item.dish.id, -1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      aria-label={`Remove one ${item.translations.name}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => onQuantityChange(item.dish.id, 1)}
                      className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                      aria-label={`Add another ${item.translations.name}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-medium">
                    {currency}{(item.dish.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                
                {/* Show customizations */}
                {(item.customizations.length > 0 || item.customNote || item.question) && (
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    {item.customizations.length > 0 && (
                      <p>Customizations: {item.customizations.join(', ')}</p>
                    )}
                    {item.customNote && (
                      <p>Note: {item.customNote}</p>
                    )}
                    {item.question && (
                      <p>Question: {item.question}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Order notes */}
          <div className="p-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes
            </label>
            <textarea
              value={orderNotes}
              onChange={(e) => {
                setOrderNotes(e.target.value)
                onNotesChange(e.target.value)
              }}
              placeholder="Any special instructions for the entire order..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          
          {/* Footer actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">
                {currency}{subtotal.toFixed(2)}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onCopySummary}
                className="flex items-center justify-center gap-1 py-2 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm min-h-[44px]"
                aria-label="Copy order summary to clipboard"
              >
                <Copy size={14} />
                Copy
              </button>
              <button
                onClick={onShareOrder}
                className="flex items-center justify-center gap-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm min-h-[44px]"
                aria-label="Share order with others"
              >
                <Share size={14} />
                Share
              </button>
              <button
                onClick={onShowToStaff}
                className="flex items-center justify-center gap-1 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm min-h-[44px]"
                aria-label="Show condensed order to restaurant staff"
              >
                <Eye size={14} />
                Show Staff
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Tap a dish for details, allergens, and customizations.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}