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

// Enhanced Visual Instruction Banner Component
interface VisualInstructionBannerProps {
  step: 'show-to-server' | 'server-answering' | 'final-order';
  questionProgress?: { answered: number; total: number };
}

const VisualInstructionBanner: React.FC<VisualInstructionBannerProps> = ({ 
  step, 
  questionProgress 
}) => {
  const bannerContent = {
    'show-to-server': {
      icon: '📱',
      title: 'Show Your Phone to the Server',
      description: 'Turn your phone screen toward your server so they can see your questions and tap the answer buttons below.',
      color: 'bg-blue-600 text-white',
      steps: [
        '1. Get your server\'s attention',
        '2. Show them this screen',
        '3. Point to your questions',
        '4. Wait for them to tap answers'
      ]
    },
    'server-answering': {
      icon: '✋',
      title: 'Server is Answering Your Questions',
      description: 'Your server will tap the buttons below to answer each question. Please wait while they respond.',
      color: 'bg-yellow-500 text-white',
      steps: [
        '1. Server reads your questions',
        '2. Server taps Yes, No, or Let me check',
        '3. Watch the progress counter',
        '4. All questions will be answered'
      ]
    },
    'final-order': {
      icon: '👋',
      title: 'Show This Final Order to Your Server',
      description: 'This is your complete order with all answers. Show this screen to place your order.',
      color: 'bg-green-600 text-white',
      steps: [
        '1. Get your server\'s attention',
        '2. Show them this screen',
        '3. Point to your order total',
        '4. Server will process your order'
      ]
    }
  };

  const content = bannerContent[step];

  return (
    <div className={`${content.color} p-6 rounded-lg mb-6 border-4 border-white shadow-lg`}>
      <div className="text-center mb-4">
        <div className="text-4xl mb-2" aria-hidden="true">{content.icon}</div>
        <h2 className="text-xl font-bold mb-2">{content.title}</h2>
        <p className="text-sm opacity-90">{content.description}</p>
      </div>

      {questionProgress && step === 'server-answering' && (
        <div className="bg-white bg-opacity-20 rounded p-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {questionProgress.answered} / {questionProgress.total}
            </div>
            <div className="text-sm">Questions Answered</div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${questionProgress.total > 0 ? (questionProgress.answered / questionProgress.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {content.steps.map((step, index) => (
          <div key={index} className="flex items-center bg-white bg-opacity-10 rounded p-2">
            <div className="bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
              {index + 1}
            </div>
            <span className="text-xs">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Server Response Component with Larger Visual Elements
interface EnhancedServerResponseProps {
  questionText: string;
  onResponse: (response: 'yes' | 'no' | 'checking') => void;
  currentResponse?: 'pending' | 'yes' | 'no' | 'checking';
  isLocked?: boolean;
}

const EnhancedServerResponse: React.FC<EnhancedServerResponseProps> = ({
  questionText,
  onResponse,
  currentResponse = 'pending',
  isLocked = false
}) => {
  // If locked, show final response with compact visual confirmation
  if (isLocked && (currentResponse === 'yes' || currentResponse === 'no')) {
    return (
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mt-4">
        <div className="text-center mb-3">
          <div className="text-sm text-gray-600 mb-2 font-medium">CUSTOMER QUESTION:</div>
          <div className="text-base font-bold bg-white border border-gray-200 rounded p-3 mb-3">
            "{questionText}"
          </div>
          
          <div className="text-xs text-gray-500 mb-2">✓ ANSWERED</div>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg text-lg font-bold border-2 ${
            currentResponse === 'yes' 
              ? 'bg-green-100 text-green-800 border-green-400' 
              : 'bg-red-100 text-red-800 border-red-400'
          }`}>
            <span className="text-xl mr-2" aria-hidden="true">
              {currentResponse === 'yes' ? '✓' : '✗'}
            </span>
            {currentResponse === 'yes' ? 'YES' : 'NO'}
          </div>
        </div>
      </div>
    );
  }

  // If checking state, show Yes/No options with compact buttons
  if (currentResponse === 'checking') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mt-4">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-2 font-medium">CUSTOMER QUESTION:</div>
          <div className="text-base font-bold bg-white border border-gray-200 rounded p-3 mb-3">
            "{questionText}"
          </div>
          
          <div className="text-yellow-800 mb-3 flex items-center justify-center">
            <span className="text-lg mr-2" aria-hidden="true">⏳</span>
            <span className="font-medium">SERVER: Please give your final answer</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onResponse('yes')}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3 px-3 rounded-lg font-semibold border-2 border-green-700 shadow-md transform active:scale-95 transition-all min-h-[50px]"
            aria-label="Answer Yes to customer question"
          >
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2" aria-hidden="true">✓</span>
              <span>YES</span>
            </div>
          </button>
          <button
            onClick={() => onResponse('no')}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3 px-3 rounded-lg font-semibold border-2 border-red-700 shadow-md transform active:scale-95 transition-all min-h-[50px]"
            aria-label="Answer No to customer question"
          >
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2" aria-hidden="true">✗</span>
              <span>NO</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Initial state - show all three options in a row with proper styling
  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mt-4">
      <div className="text-center mb-4">
        <div className="text-sm text-gray-600 mb-2 font-medium">CUSTOMER QUESTION:</div>
        <div className="text-base font-bold bg-white border border-gray-200 rounded p-3 mb-3">
          "{questionText}"
        </div>
        
        <div className="text-blue-800 mb-3 flex items-center justify-center">
          <span className="text-lg mr-2" aria-hidden="true">👋</span>
          <span className="font-medium">SERVER: Please tap your answer</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onResponse('yes')}
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3 px-2 rounded-lg font-semibold border-2 border-green-700 shadow-md transform active:scale-95 transition-all min-h-[50px]"
          aria-label="Answer Yes to customer question"
        >
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1" aria-hidden="true">✓</span>
            <span className="text-sm">YES</span>
          </div>
        </button>
        
        <button
          onClick={() => onResponse('no')}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3 px-2 rounded-lg font-semibold border-2 border-red-700 shadow-md transform active:scale-95 transition-all min-h-[50px]"
          aria-label="Answer No to customer question"
        >
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1" aria-hidden="true">✗</span>
            <span className="text-sm">NO</span>
          </div>
        </button>
        
        <button
          onClick={() => onResponse('checking')}
          className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white py-3 px-2 rounded-lg font-semibold border-2 border-orange-700 shadow-md transform active:scale-95 transition-all min-h-[50px]"
          aria-label="Let me check - need more time to answer"
        >
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1" aria-hidden="true">⏳</span>
            <span className="text-xs font-bold">CHECK</span>
          </div>
        </button>
      </div>
    </div>
  );
};

// Enhanced Order Summary with Visual Emphasis
interface VisualOrderSummaryProps {
  orderItems: OrderItem[];
  showTotal?: boolean;
  language?: string;
  title?: string;
}

const VisualOrderSummary: React.FC<VisualOrderSummaryProps> = ({
  orderItems,
  showTotal = true,
  language = 'en',
  title = 'Order Summary'
}) => {
  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-white border-4 border-gray-300 rounded-xl p-4 shadow-lg">
      <h3 className="text-xl font-bold text-center mb-4 bg-gray-100 py-2 rounded-lg">
        📋 {title}
      </h3>
      
      <div className="space-y-4">
        {orderItems.map((item, index) => (
          <div key={`${item.dishId}-${index}`} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg text-gray-800">
                {item.dishName.en}
              </h4>
              <div className="text-right bg-white rounded-lg p-2 border-2 border-gray-300">
                <div className="font-bold text-lg">Qty: {item.quantity}</div>
                <div className="text-sm text-gray-600">
                  {formatPrice(item.price * item.quantity, language)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showTotal && (
        <div className="mt-6 pt-4 border-t-4 border-gray-300">
          <div className="bg-green-100 border-4 border-green-400 rounded-xl p-4 text-center">
            <div className="text-sm text-green-700 font-medium mb-1">TOTAL AMOUNT</div>
            <div className="text-3xl font-bold text-green-800">
              {formatPrice(total, language)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { VisualInstructionBanner, EnhancedServerResponse, VisualOrderSummary };