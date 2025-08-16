import React, { useState } from 'react';
import { Download, QrCode } from 'lucide-react';

export default function RestaurantQRCodes() {
  const [restaurantSlug, setRestaurantSlug] = useState('your-restaurant');
  const [qrCodes, setQrCodes] = useState({});

  const generateQRCode = async (size: string) => {
    try {
      // QR code generation will be implemented with qrCodeService
      console.log(`Generating QR code for ${restaurantSlug} in ${size}px`);
      // Placeholder for now
      const qrDataUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiM5Y2EzYWYiPlFSIENvZGU8L3RleHQ+PC9zdmc+`;
      setQrCodes({...qrCodes, [size]: qrDataUrl});
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = (size: string, format: string) => {
    const qrDataUrl = qrCodes[size];
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `restaurant-qr-${size}.${format}`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Codes</h1>
          <p className="text-gray-600">Generate and download QR codes for your restaurant tables</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Small QR Code */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Small (150px)</h3>
            <p className="text-sm text-gray-600 mb-4">Perfect for business cards and small displays</p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
              {qrCodes['150'] ? (
                <img src={qrCodes['150']} alt="Small QR Code" className="max-w-full" />
              ) : (
                <div className="text-center">
                  <QrCode size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">QR Code will appear here</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => generateQRCode('150')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-2"
            >
              Generate Small QR
            </button>
            
            {qrCodes['150'] && (
              <button
                onClick={() => downloadQRCode('150', 'png')}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PNG
              </button>
            )}
          </div>

          {/* Medium QR Code */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Medium (300px)</h3>
            <p className="text-sm text-gray-600 mb-4">Ideal for table tents and menus</p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
              {qrCodes['300'] ? (
                <img src={qrCodes['300']} alt="Medium QR Code" className="max-w-full" />
              ) : (
                <div className="text-center">
                  <QrCode size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">QR Code will appear here</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => generateQRCode('300')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-2"
            >
              Generate Medium QR
            </button>
            
            {qrCodes['300'] && (
              <button
                onClick={() => downloadQRCode('300', 'png')}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PNG
              </button>
            )}
          </div>

          {/* Large QR Code */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Large (600px)</h3>
            <p className="text-sm text-gray-600 mb-4">Great for posters and window displays</p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
              {qrCodes['600'] ? (
                <img src={qrCodes['600']} alt="Large QR Code" className="max-w-full max-h-[150px]" />
              ) : (
                <div className="text-center">
                  <QrCode size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">QR Code will appear here</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => generateQRCode('600')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-2"
            >
              Generate Large QR
            </button>
            
            {qrCodes['600'] && (
              <button
                onClick={() => downloadQRCode('600', 'png')}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PNG
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-6 mt-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">How to Use QR Codes</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Small QR codes</strong> are perfect for business cards and small promotional materials</p>
            <p>• <strong>Medium QR codes</strong> work well on table tents, menu covers, and counter displays</p>
            <p>• <strong>Large QR codes</strong> are ideal for window displays, posters, and outdoor signage</p>
            <p>• Print QR codes on light backgrounds for best scanning results</p>
            <p>• Test scanning from typical customer distances before finalizing placement</p>
          </div>
        </div>
      </div>
    </div>
  );
}