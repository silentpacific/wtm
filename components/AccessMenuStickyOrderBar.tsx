import React from 'react';
import { formatPrice } from '../services/accessMenuTranslationService';

interface OrderItem {
  dishId: number;
  dishName: Record<string, string>;
  price: number;
  quantity: number;
  note: string;
}

interface StickyOrderBarProps {
  orderItems: OrderItem[];
  currentLanguage: string;
  onOpenOrderDrawer: () => void;
}

const AccessMenuStickyOrderBar: React.FC<StickyOrderBarProps> = ({
  orderItems,
  currentLanguage,
  onOpenOrderDrawer
}) => {
  if (orderItems.length === 0) return null;

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <button
        onClick={onOpenOrderDrawer}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`View your order with ${totalItems} items totaling ${formatPrice(subtotal, currentLanguage)}`}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {totalItems}
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">Tap here to see your order list</div>
            <div className="text-sm text-gray-600">{totalItems} item{totalItems !== 1 ? 's' : ''} added</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lg text-gray-900">
            {formatPrice(subtotal, currentLanguage)}
          </span>
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default AccessMenuStickyOrderBar;