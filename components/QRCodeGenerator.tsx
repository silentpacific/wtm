import React, { useState, useRef } from 'react';
import { Download, QrCode, ExternalLink, Copy, Check } from 'lucide-react';
import { generateRestaurantSlug } from '../services/restaurantQRService';

const QRCodeGenerator: React.FC = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [city, setCity] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple QR Code generation (basic implementation)
  const generateQRCode = (text: string): string => {
    // This is a simplified QR code pattern generator
    // In production, you'd use a proper QR code library like 'qrcode' npm package
    const size = 200;
    const modules = 25; // QR code grid size
    const moduleSize = size / modules;
    
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;
    
    // Generate a pattern based on the text (simplified for demo)
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Create a pseudo-random pattern based on position and hash
        const shouldFill = ((row * col + hash) % 3) === 0;
        
        // Add finder patterns (corners)
        const isFinderPattern = (
          (row < 7 && col < 7) || 
          (row < 7 && col >= modules - 7) || 
          (row >= modules - 7 && col < 7)
        );
        
        if (isFinderPattern || shouldFill) {
          const x = col * moduleSize;
          const y = row * moduleSize;
          svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    
    svg += '</svg>';
    return svg;
  };

  const handleGenerate = () => {
    if (!restaurantName.trim() || !city.trim()) {
      alert('Please enter both restaurant name and city');
      return;
    }

    const slug = generateRestaurantSlug(restaurantName, city);
    const url = `${window.location.origin}/r/${slug}`;
    const qrCode = generateQRCode(url);
    
    setGeneratedUrl(url);
    setQrCodeSvg(qrCode);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = (format: 'png' | 'svg') => {
    if (!qrCodeSvg) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${generateRestaurantSlug(restaurantName, city)}-qr-code.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };
    
    const svgBlob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
    
    if (format === 'svg') {
      const link = document.createElement('a');
      link.download = `${generateRestaurantSlug(restaurantName, city)}-qr-code.svg`;
      link.href = URL.createObjectURL(svgBlob);
      link.click();
      return;
    }
    
    img.src = URL.createObjectURL(svgBlob);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <QrCode className="mx-auto mb-4 text-blue-600" size={48} />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Restaurant QR Code Generator
        </h1>
        <p className="text-gray-600">
          Generate unique URLs and QR codes for your AccessMenu interface
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Restaurant Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g., Joe's Pizza Palace"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Adelaide"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={handleGenerate}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <QrCode size={20} />
                Generate QR Code
              </button>
            </div>
          </div>

          {/* URL Preview */}
          {generatedUrl && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Generated URL</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-2 py-1 rounded border text-green-700 break-all">
                  {generatedUrl}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-green-600 hover:text-green-800 transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-green-600 hover:text-green-800 transition-colors"
                  title="Open URL"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Display */}
        <div className="space-y-6">
          {qrCodeSvg ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Your QR Code
              </h3>
              
              <div 
                className="inline-block p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              />
              
              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-600">
                  Download in different formats:
                </p>
                
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => downloadQRCode('png')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    PNG
                  </button>
                  
                  <button
                    onClick={() => downloadQRCode('svg')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download size={16} />
                    SVG
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-4">
                  <div className="text-center">
                    <div className="font-medium">Table Tent</div>
                    <div>A5 Size</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Menu Insert</div>
                    <div>A6 Size</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Sticker</div>
                    <div>Square</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <QrCode className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-gray-500">
                Enter restaurant details and click "Generate QR Code" to create your unique code
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3">How to Use Your QR Code</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
          <li>Download your QR code in the format you need (PNG for printing, SVG for editing)</li>
          <li>Print the QR code on table tents, menu inserts, or stickers</li>
          <li>Place them where customers can easily scan with their phones</li>
          <li>Customers will be taken directly to your AccessMenu interface</li>
          <li>They can browse your menu in their language with accessibility features</li>
        </ol>
      </div>

      {/* Hidden canvas for PNG generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default QRCodeGenerator;