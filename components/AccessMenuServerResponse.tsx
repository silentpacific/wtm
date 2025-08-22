import React, { useState } from 'react';

export type ServerResponseState = 'pending' | 'yes' | 'no' | 'checking';

interface ServerResponseProps {
  questionText: string;
  onResponse: (response: ServerResponseState) => void;
  currentResponse?: ServerResponseState;
  isLocked?: boolean;
}

const AccessMenuServerResponse: React.FC<ServerResponseProps> = ({
  questionText,
  onResponse,
  currentResponse = 'pending',
  isLocked = false
}) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleLetMeCheck = () => {
    setIsChecking(true);
    onResponse('checking');
  };

  const handleFinalResponse = (response: 'yes' | 'no') => {
    onResponse(response);
    setIsChecking(false);
  };

  // If locked, show final response
  if (isLocked && (currentResponse === 'yes' || currentResponse === 'no')) {
    return (
      <div className="bg-gray-100 border rounded-lg p-3 mt-2">
        <div className="text-sm text-gray-600 mb-2">Customer Question:</div>
        <div className="font-medium mb-3">{questionText}</div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          currentResponse === 'yes' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <span className="mr-1">
            {currentResponse === 'yes' ? '✓' : '✗'}
          </span>
          {currentResponse === 'yes' ? 'Yes' : 'No'}
        </div>
      </div>
    );
  }

  // If checking state, show Yes/No options
  if (isChecking || currentResponse === 'checking') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
        <div className="text-sm text-gray-600 mb-2">Customer Question:</div>
        <div className="font-medium mb-3">{questionText}</div>
        <div className="text-sm text-yellow-700 mb-3">✋ Please provide your final answer:</div>
        <div className="flex gap-2">
          <button
            onClick={() => handleFinalResponse('yes')}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700"
          >
            ✓ Yes
          </button>
          <button
            onClick={() => handleFinalResponse('no')}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-medium hover:bg-red-700"
          >
            ✗ No
          </button>
        </div>
      </div>
    );
  }

  // Initial state - show all three options
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
      <div className="text-sm text-gray-600 mb-2">Customer Question:</div>
      <div className="font-medium mb-3">{questionText}</div>
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => handleFinalResponse('yes')}
          className="bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700"
        >
          ✓ Yes
        </button>
        <button
          onClick={() => handleFinalResponse('no')}
          className="bg-red-600 text-white py-2 px-4 rounded font-medium hover:bg-red-700"
        >
          ✗ No
        </button>
        <button
          onClick={handleLetMeCheck}
          className="bg-yellow-600 text-white py-2 px-4 rounded font-medium hover:bg-yellow-700"
        >
          🤔 Let me check
        </button>
      </div>
    </div>
  );
};

export default AccessMenuServerResponse;