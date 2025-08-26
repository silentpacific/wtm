// src/pages/QRCodesPage.tsx - Updated with new design system
import React, { useState } from 'react';
import { 
  Download, 
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const QRCodesPage: React.FC = () => {
  const { restaurant } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [qrColor, setQrColor] = useState('#E75A2F'); // Default to wtm-primary
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  // Generate restaurant menu URL
  const restaurantSlug = restaurant?.restaurant_name?.toLowerCase().replace(/\s+/g, '-') || 'demo-restaurant';
  const menuUrl = `${window.location.origin}/r/${restaurantSlug}`;
  
  const qrSizes = [
    { id: 'small', name: 'Small (200×200)', size: 200, description: 'Business cards' },
    { id: 'medium', name: 'Medium (400×400)', size: 400, description: 'Table tents' },
    { id: 'large', name: 'Large (800×800)', size: 800, description: 'Posters' },
    { id: 'jumbo', name: 'Jumbo (1200×1200)', size: 1200, description: 'Large displays' }
  ];

  const formats = [
    { id: 'png', name: 'PNG', description: 'Digital use' },
    { id: 'svg', name: 'SVG', description: 'Vector format' },
    { id: 'pdf', name: 'PDF', description: 'Professional printing' }
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
      a.download = `${restaurant?.restaurant_name || 'restaurant'}-qr-${sizeId}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  // Brand token color options
  const colorOptions = [
    { name: 'WhatTheMenu Orange', value: '#E75A2F' },
    { name: 'Teal', value: '#2E7E6F' },
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#1C1C1C' }
  ];

  const backgroundOptions = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Warm Paper', value: '#FFF8F3' },
    { name: 'Light Gray', value: '#F3F4F6' }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="heading-secondary text-wtm-text mb-2">QR Codes</h1>
          <p className="text-wtm-muted">
            Generate and download QR codes for your restaurant's accessible menu
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column - URL and Preview */}
          <div className="space-y-6">
            {/* Menu URL */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-wtm-text mb-4 font-heading">Your Menu URL</h3>
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-1 bg-wtm-bg rounded-xl p-3 font-mono text-sm text-wtm-text">
                  {menuUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="btn btn-primary px-4 py-3"
                  title="Copy URL"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost px-4 py-3"
                  title="Open menu"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="text-sm text-wtm-muted">
                This is the URL customers will access when they scan your QR code
              </p>
            </div>

            {/* Live Preview */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-wtm-text mb-4 font-heading">Live Preview</h3>
              <div className="text-center">
                <div className="inline-block p-6 bg-wtm-bg rounded-2xl">
                  <img
                    src={generateQRCode(200)}
                    alt="QR Code Preview"
                    className="w-48 h-48 mx-auto rounded-xl shadow-sm"
                  />
                </div>
                <p className="text-sm text-wtm-muted mt-3">
                  Preview updates with your color choices
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Customization and Downloads */}
          <div className="space-y-6">
            {/* Color Customization */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-wtm-text mb-4 font-heading">Color Options</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-wtm-text mb-2">QR Code Color</label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setQrColor(color.value)}
                        className={`p-3 text-left border rounded-xl transition-colors ${
                          qrColor === color.value
                            ? 'border-wtm-primary bg-wtm-primary/10'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-200" 
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-sm font-medium">{color.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wtm-text mb-2">Background Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {backgroundOptions.map((bg) => (
                      <button
                        key={bg.value}
                        onClick={() => setBackgroundColor(bg.value)}
                        className={`p-3 text-center border rounded-xl transition-colors ${
                          backgroundColor === bg.value
                            ? 'border-wtm-primary bg-wtm-primary/10'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg border border-gray-200 mx-auto mb-1" 
                          style={{ backgroundColor: bg.value }}
                        />
                        <span className="text-xs font-medium">{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-wtm-text mb-4 font-heading">Download Sizes</h3>
              <div className="space-y-3">
                {qrSizes.map((size) => (
                  <div key={size.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium text-wtm-text">{size.name}</div>
                      <div className="text-sm text-wtm-muted">{size.description}</div>
                    </div>
                    <button
                      onClick={() => downloadQRCode(size.id)}
                      className="btn btn-ghost px-4 py-2 gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                ))}
              </div>

              {/* Format Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-wtm-text mb-2">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {formats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-3 text-center border rounded-xl transition-colors ${
                        selectedFormat === format.id
                          ? 'border-wtm-primary bg-wtm-primary/10 text-wtm-primary'
                          : 'border-gray-200 hover:bg-gray-50 text-wtm-text'
                      }`}
                    >
                      <div className="font-medium">{format.name}</div>
                      <div className="text-xs text-wtm-muted">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 font-heading">Usage Tips</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>Place QR codes near entrance or on tables</p>
                <p>Good lighting helps scanning</p>
                <p>Include "Scan for Menu" text</p>
                <p>Consider lamination for durability</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRCodesPage;