// src/pages/QRCodesPage.tsx - Generate and Download QR Codes
import React, { useState, useRef } from 'react';
import { 
  Download, 
  QrCode, 
  Printer,
  Copy,
  Check,
  ExternalLink,
  Settings,
  Palette,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const QRCodesPage: React.FC = () => {
  const { restaurant } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [qrColor, setQrColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  // Generate restaurant menu URL - in real app, this would be dynamic
  const restaurantSlug = restaurant?.name?.toLowerCase().replace(/\s+/g, '-') || 'demo-restaurant';
  const menuUrl = `${window.location.origin}/r/${restaurantSlug}`;
  
  const qrSizes = [
    { id: 'small', name: 'Small (200x200)', size: 200, description: 'Perfect for receipts or business cards' },
    { id: 'medium', name: 'Medium (400x400)', size: 400, description: 'Great for table tents or menus' },
    { id: 'large', name: 'Large (800x800)', size: 800, description: 'Ideal for posters or window displays' },
    { id: 'jumbo', name: 'Jumbo (1200x1200)', size: 1200, description: 'Maximum size for large displays' }
  ];

  const formats = [
    { id: 'png', name: 'PNG', description: 'Best for digital use' },
    { id: 'svg', name: 'SVG', description: 'Vector format, scales perfectly' },
    { id: 'pdf', name: 'PDF', description: 'Ready for professional printing' }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const generateQRCode = (size: number) => {
    // In a real app, you'd use a QR code library like qrcode.js
    // For demo, we'll use a QR code API service
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(menuUrl)}&color=${qrColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}`;
    return qrApiUrl;
  };

  const downloadQRCode = async (sizeId: string) => {
    const sizeConfig = qrSizes.find(s => s.id === sizeId);
    if (!sizeConfig) return;

    try {
      const qrUrl = generateQRCode(sizeConfig.size);
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${restaurant?.name || 'restaurant'}-qr-${sizeId}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const printQRCode = () => {
    const qrUrl = generateQRCode(400);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${restaurant?.name || 'Restaurant'}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif; 
              }
              .qr-container {
                page-break-inside: avoid;
                margin-bottom: 30px;
              }
              .qr-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .qr-subtitle {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
              }
              .qr-code {
                border: 1px solid #ddd;
                padding: 10px;
                display: inline-block;
              }
              .instructions {
                font-size: 12px;
                color: #888;
                margin-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">${restaurant?.name || 'Restaurant Menu'}</div>
              <div class="qr-subtitle">Scan for Accessible Menu</div>
              <div class="qr-code">
                <img src="${qrUrl}" alt="QR Code" />
              </div>
              <div class="instructions">
                Scan with your phone camera to access our menu<br>
                in multiple languages with dietary information
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Codes</h1>
          <p className="text-gray-600">
            Generate and download QR codes for your restaurant's accessible menu
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column - Settings and Preview */}
          <div className="space-y-6">
            {/* Menu URL */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Menu URL</h3>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-50 rounded-lg p-3 font-mono text-sm">
                  {menuUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-2 bg-coral-600 hover:bg-coral-700 text-white rounded-lg font-medium transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="ml-2 hidden sm:block">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <ExternalLink size={16} />
                  <span className="ml-2 hidden sm:block">Visit</span>
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This is the URL customers will access when they scan your QR code
              </p>
            </div>

            {/* Customization Options */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings size={20} className="mr-2" />
                Customization
              </h3>
              
              {/* Colors */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Colors</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">QR Code Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-10 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Download Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {formats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-3 text-center border rounded-lg transition-colors ${
                        selectedFormat === format.id
                          ? 'border-coral-500 bg-coral-50 text-coral-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{format.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="text-center">
                <div className="inline-block p-4 bg-gray-50 rounded-lg">
                  <img
                    src={generateQRCode(200)}
                    alt="QR Code Preview"
                    className="w-48 h-48 mx-auto border border-gray-200 rounded"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Preview of your QR code with current settings
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Size Options and Downloads */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={printQRCode}
                  className="w-full flex items-center justify-center px-4 py-3 bg-coral-600 hover:bg-coral-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Printer size={20} className="mr-2" />
                  Print QR Code
                </button>
                <button
                  onClick={() => downloadQRCode('medium')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-coral-600 text-coral-600 hover:bg-coral-50 rounded-lg font-medium transition-colors"
                >
                  <Download size={20} className="mr-2" />
                  Quick Download (Medium)
                </button>
              </div>
            </div>

            {/* Size Options */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Sizes</h3>
              <div className="space-y-4">
                {qrSizes.map((size) => (
                  <div key={size.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{size.name}</div>
                      <div className="text-sm text-gray-500">{size.description}</div>
                    </div>
                    <button
                      onClick={() => downloadQRCode(size.id)}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <Download size={16} className="mr-2" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Usage Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Place QR codes on tables, menus, or near the entrance
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Ensure good lighting for easy scanning
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Test scanning from different distances and angles
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Include instructions like "Scan for Menu" for clarity
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Consider laminating printed QR codes for durability
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRCodesPage;