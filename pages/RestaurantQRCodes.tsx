import React, { useState } from 'react';
import { Download, QrCode, Printer, Share2 } from 'lucide-react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';

export default function RestaurantQRCodes() {
  const { restaurant } = useRestaurantAuth();
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedFormat, setSelectedFormat] = useState('png');

  const sizes = {
    small: { label: '150x150px', value: 150 },
    medium: { label: '300x300px', value: 300 },
    large: { label: '600x600px', value: 600 }
  };

  const formats = {
    png: 'PNG',
    svg: 'SVG',
    pdf: 'PDF'
  };

  const restaurantUrl = restaurant ? `https://whatthemenu.com/restaurants/${restaurant.slug}` : '';

  const handleDownload = (format: string, size: string) => {
    // This would integrate with your QR code generation service
    console.log(`Downloading ${format} QR code in ${size} size for ${restaurantUrl}`);
    
    // For now, just show an alert
    alert(`QR code download would start here!\nFormat: ${format}\nSize: ${sizes[size as keyof typeof sizes].label}\nURL: ${restaurantUrl}`);
  };

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading restaurant information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Codes</h1>
        <p className="text-gray-600">Download QR codes for your tables and marketing materials</p>
      </div>

      {/* Restaurant URL Display */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Restaurant Page</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Public URL:</p>
            <a 
              href={restaurantUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {restaurantUrl}
            </a>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(restaurantUrl)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Copy URL"
            >
              <Share2 size={16} />
            </button>
            <a
              href={restaurantUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Preview
            </a>
          </div>
        </div>
      </div>

      {/* QR Code Generator */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Left Column - Options */}
        <div className="space-y-6">
          
          {/* Size Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Size Options</h3>
            <div className="space-y-3">
              {Object.entries(sizes).map(([key, size]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="radio"
                    name="size"
                    value={key}
                    checked={selectedSize === key}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">
                    {size.label} - {key === 'small' ? 'Table tents' : key === 'medium' ? 'Posters' : 'Large displays'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Options</h3>
            <div className="space-y-3">
              {Object.entries(formats).map(([key, format]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={key}
                    checked={selectedFormat === key}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">
                    {format} - {key === 'png' ? 'Best for web and digital use' : key === 'svg' ? 'Scalable vector format' : 'Print-ready document'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Download</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleDownload(selectedFormat, selectedSize)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download {formats[selectedFormat as keyof typeof formats]} ({sizes[selectedSize as keyof typeof sizes].label})
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload('png', 'small')}
                  className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Quick: Small PNG
                </button>
                <button
                  onClick={() => handleDownload('png', 'large')}
                  className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Quick: Large PNG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Preview</h3>
          
          {/* QR Code Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <QrCode size={120} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm">
                QR Code Preview<br />
                {sizes[selectedSize as keyof typeof sizes].label}
              </p>
            </div>
          </div>

          {/* QR Code Info */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Format:</span>
              <span className="font-medium">{formats[selectedFormat as keyof typeof formats]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Size:</span>
              <span className="font-medium">{sizes[selectedSize as keyof typeof sizes].label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target URL:</span>
              <span className="font-medium text-blue-600 truncate ml-2">{restaurant.slug}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How to Use Your QR Codes</h3>
        <div className="grid md:grid-cols-2 gap-6 text-blue-800 text-sm">
          <div>
            <h4 className="font-medium mb-2">📱 Table Tents (Small)</h4>
            <ul className="space-y-1">
              <li>• Print on sturdy cardstock</li>
              <li>• Place one on each table</li>
              <li>• Include "Scan for accessible menu" text</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🪟 Window Displays (Medium)</h4>
            <ul className="space-y-1">
              <li>• Print on weather-resistant material</li>
              <li>• Place in storefront windows</li>
              <li>• Add your restaurant name and hours</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">📄 Marketing Materials (Large)</h4>
            <ul className="space-y-1">
              <li>• Include in flyers and brochures</li>
              <li>• Add to social media posts</li>
              <li>• Use on delivery packaging</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">💡 Pro Tips</h4>
            <ul className="space-y-1">
              <li>• Test QR codes before printing</li>
              <li>• Include accessibility messaging</li>
              <li>• Keep codes clean and unobstructed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}