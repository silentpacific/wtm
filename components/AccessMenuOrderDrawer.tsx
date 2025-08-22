import React from 'react';
import { formatPrice } from '../services/accessMenuTranslationService';

interface OrderItem {
  dishId: number;
  dishName: Record<string, string>;
  price: number;
  quantity: number;
  note: string;
  serverResponse?: 'pending' | 'yes' | 'no' | 'checking';
}

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  currentLanguage: string;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
  onShowToServer: () => void;
  onFinalizeOrder?: () => void;
  allQuestionsAnswered?: boolean;
}

const AccessMenuOrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  orderItems,
  currentLanguage,
  onUpdateQuantity,
  onRemoveItem,
  onShowToServer,
  onFinalizeOrder,
  allQuestionsAnswered = false
}) => {
  if (!isOpen) return null;

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasQuestions = orderItems.some(item => item.note);
  const questionsAnswered = orderItems.filter(item => 
    item.note && (item.serverResponse === 'yes' || item.serverResponse === 'no')
  ).length;
  const totalQuestions = orderItems.filter(item => item.note).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-t-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold">Your Order</h2>
            <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {totalItems}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Order Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Your order is empty
            </div>
          ) : (
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={`${item.dishId}-${index}`} className="border rounded-lg p-4">
                  {/* Dish Name and Remove Button */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">
                      {item.dishName[currentLanguage] || item.dishName.en}
                    </h3>
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Quantity Controls and Price */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(index, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <span className="text-lg">−</span>
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {formatPrice(item.price, currentLanguage)} each
                      </div>
                      <div className="font-semibold">
                        {formatPrice(item.price * item.quantity, currentLanguage)}
                      </div>
                    </div>
                  </div>

                  {/* Customer Note with Answer Status */}
                  {item.note && (
                    <div className={`border-l-4 p-3 rounded mt-2 ${
                      item.serverResponse === 'yes' || item.serverResponse === 'no' 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-blue-50 border-blue-400'
                    }`}>
                      <div className={`text-sm font-medium mb-1 ${
                        item.serverResponse === 'yes' || item.serverResponse === 'no' 
                          ? 'text-green-800' 
                          : 'text-blue-800'
                      }`}>
                        {item.serverResponse === 'yes' || item.serverResponse === 'no' 
                          ? 'Question answered:' 
                          : 'Your question:'
                        }
                      </div>
                      <div className={`text-sm ${
                        item.serverResponse === 'yes' || item.serverResponse === 'no' 
                          ? 'text-green-700' 
                          : 'text-blue-700'
                      }`}>
                        {item.note}
                      </div>
                      {(item.serverResponse === 'yes' || item.serverResponse === 'no') && (
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs mt-2 ${
                          item.serverResponse === 'yes' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className="mr-1">
                            {item.serverResponse === 'yes' ? '✓' : '✗'}
                          </span>
                          {item.serverResponse === 'yes' ? 'Yes' : 'No'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        {orderItems.length > 0 && (
          <div className="border-t bg-white p-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Subtotal:</span>
              <span className="text-xl font-bold">
                {formatPrice(subtotal, currentLanguage)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Show questions status if any exist */}
              {hasQuestions && (
                <div className="text-center text-sm text-gray-600 mb-2">
                  Questions: {questionsAnswered}/{totalQuestions} answered
                </div>
              )}

              {/* Show to waiter button - always visible if there are questions */}
              {hasQuestions && !allQuestionsAnswered && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 text-center">
                    <div className="text-blue-800 font-medium text-sm mb-1">
                      💡 You have {totalQuestions - questionsAnswered} unanswered questions
                    </div>
                    <div className="text-blue-700 text-xs">
                      Show your phone to the server so they can tap the answer buttons
                    </div>
                  </div>
                  <button
                    onClick={onShowToServer}
                    className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-bold text-lg hover:bg-blue-700 border-2 border-blue-700 min-h-[60px]"
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-2xl mr-2" aria-hidden="true">📱</span>
                      <span>Show this to your waiter</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Finalize order button - visible when no questions or all answered */}
              {(!hasQuestions || allQuestionsAnswered) && onFinalizeOrder && (
                <div className="space-y-3">
                  {allQuestionsAnswered && hasQuestions && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-center">
                      <div className="text-green-800 font-medium text-sm mb-1">
                        ✅ All questions answered!
                      </div>
                      <div className="text-green-700 text-xs">
                        Ready to place your order
                      </div>
                    </div>
                  )}
                  <button
                    onClick={onFinalizeOrder}
                    className="w-full bg-green-600 text-white py-4 px-4 rounded-lg font-bold text-lg hover:bg-green-700 border-2 border-green-700 min-h-[60px]"
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-2xl mr-2" aria-hidden="true">✅</span>
                      <span>Finalize Order</span>
                    </div>
                  </button>
                </div>
              )}
              
              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Continue ordering
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessMenuOrderDrawer;