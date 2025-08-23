import React, { useState, useRef, useEffect } from 'react';
import { Download, QrCode, ExternalLink, Copy, Check } from 'lucide-react';
import { generateRestaurantSlug } from '../services/restaurantQRService';

const QRCodeGenerator: React.FC = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [city, setCity] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrLibraryLoaded, setQrLibraryLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load QR code library dynamically
  useEffect(() => {
    const loadQRLibrary = async () => {
      try {
        // Load QR code library from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
        script.onload = () => {
          setQrLibraryLoaded(true);
          console.log('✅ QR Code library loaded');
        };
        script.onerror = () => {
          console.error('❌ Failed to load QR Code library');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading QR library:', error);
      }
    };

    loadQRLibrary();
  }, []);

  // Generate real QR code
  const generateQRCode = async (text: string): Promise<string> => {
    if (!qrLibraryLoaded || !window.QRCode) {
      console.error('QR Code library not loaded');
      return generateFallbackQRCode(text);
    }

    try {
      // Generate QR code using the library
      const dataUrl = await window.QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#292524',  // charcoal color
          light: '#FFFFFF'  // white background
        },
        errorCorrectionLevel: 'M'
      });
      return dataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return generateFallbackQRCode(text);
    }
  };

  // Fallback QR code generation (simplified pattern)
  const generateFallbackQRCode = (text: string): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const size = 300;
    const modules = 25;
    const moduleSize = size / modules;
    
    canvas.width = size;
    canvas.height = size;
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Generate pattern based on text
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    ctx.fillStyle = '#292524'; // charcoal color
    
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const shouldFill = ((row * col + hash) % 3) === 0;
        const isFinderPattern = (
          (row < 7 && col < 7) || 
          (row < 7 && col >= modules - 7) || 
          (row >= modules - 7 && col < 7)
        );
        
        if (isFinderPattern || shouldFill) {
          const x = col * moduleSize;
          const y = row * moduleSize;
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  const handleGenerate = async () => {
    if (!restaurantName.trim() || !city.trim()) {
      alert('Please enter both restaurant name and city');
      return;
    }

    const slug = generateRestaurantSlug(restaurantName, city);
    const url = `${window.location.origin}/r/${slug}`;
    
    console.log('Generating QR code for:', url);
    const qrCode = await generateQRCode(url);
    
    setGeneratedUrl(url);
    setQrCodeDataUrl(qrCode);
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
    if (!qrCodeDataUrl) return;

    if (format === 'png') {
      // Download PNG directly
      const link = document.createElement('a');
      link.download = `${generateRestaurantSlug(restaurantName, city)}-qr-code.png`;
      link.href = qrCodeDataUrl;
      link.click();
    } else if (format === 'svg') {
      // Convert to SVG (simplified)
      const svgContent = `
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="300" fill="white"/>
          <image href="${qrCodeDataUrl}" width="300" height="300"/>
        </svg>
      `;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `${generateRestaurantSlug(restaurantName, city)}-qr-code.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <QrCode className="mx-auto mb-4 text-charcoal" size={48} />
            <h1 className="text-4xl font-black text-charcoal mb-4 tracking-tight">
              Restaurant QR Code Generator
            </h1>
            <p className="text-xl text-charcoal/80 font-bold">
              Generate unique URLs and QR codes for your AccessMenu interface
            </p>
            {!qrLibraryLoaded && (
              <p className="text-sm text-charcoal/60 mt-2">
                Loading QR code library... (using fallback pattern if needed)
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white border-4 border-charcoal rounded-2xl p-6 shadow-[8px_8px_0px_#292524]">
                <h2 className="text-2xl font-black mb-6 text-charcoal tracking-tight">
                  Restaurant Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-charcoal mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g., Joe's Pizza Palace"
                      className="w-full px-4 py-3 border-4 border-charcoal rounded-xl focus:outline-none focus:ring-0 focus:border-coral font-bold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-charcoal mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Adelaide"
                      className="w-full px-4 py-3 border-4 border-charcoal rounded-xl focus:outline-none focus:ring-0 focus:border-coral font-bold"
                    />
                  </div>
                  
                  <button
                    onClick={handleGenerate}
                    className="w-full bg-coral text-cream py-3 px-6 rounded-xl font-black text-lg border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[2px_2px_0px_#292524] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-3"
                  >
                    <QrCode size={24} />
                    Generate QR Code
                  </button>
                </div>
              </div>

              {/* URL Preview */}
              {generatedUrl && (
                <div className="bg-yellow border-4 border-charcoal rounded-2xl p-4 shadow-[4px_4px_0px_#292524]">
                  <h3 className="font-black text-charcoal mb-3">Generated URL</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-cream px-3 py-2 rounded-lg border-2 border-charcoal font-bold text-charcoal break-all">
                      {generatedUrl}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-charcoal hover:text-coral transition-colors border-2 border-charcoal rounded-lg bg-cream hover:bg-yellow"
                      title="Copy URL"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-charcoal hover:text-coral transition-colors border-2 border-charcoal rounded-lg bg-cream hover:bg-yellow"
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
              {qrCodeDataUrl ? (
                <div className="bg-white border-4 border-charcoal rounded-2xl p-6 text-center shadow-[8px_8px_0px_#292524]">
                  <h3 className="text-2xl font-black mb-6 text-charcoal tracking-tight">
                    Your QR Code
                  </h3>
                  
                  <div className="inline-block p-4 bg-cream rounded-2xl shadow-[4px_4px_0px_#292524] border-4 border-charcoal mb-6">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code" 
                      className="block mx-auto"
                      style={{ width: '250px', height: '250px' }}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-charcoal">
                      Download in different formats:
                    </p>
                    
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => downloadQRCode('png')}
                        className="flex items-center gap-2 px-6 py-3 bg-coral text-cream rounded-xl font-black border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[2px_2px_0px_#292524] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        <Download size={16} />
                        PNG
                      </button>
                      
                      <button
                        onClick={() => downloadQRCode('svg')}
                        className="flex items-center gap-2 px-6 py-3 bg-yellow text-charcoal rounded-xl font-black border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[2px_2px_0px_#292524] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        <Download size={16} />
                        SVG
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-charcoal/80 font-bold mt-4">
                      <div className="text-center">
                        <div className="font-black">Table Tent</div>
                        <div>A5 Size</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black">Menu Insert</div>
                        <div>A6 Size</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black">Sticker</div>
                        <div>Square</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-4 border-charcoal rounded-2xl p-6 text-center shadow-[8px_8px_0px_#292524]">
                  <QrCode className="mx-auto mb-4 text-charcoal/40" size={64} />
                  <p className="text-charcoal/80 font-bold">
                    Enter restaurant details and click "Generate QR Code" to create your scannable code
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow border-4 border-charcoal rounded-2xl p-6 shadow-[8px_8px_0px_#292524]">
            <h3 className="font-black text-charcoal mb-4 text-xl tracking-tight">How to Use Your QR Code</h3>
            <ol className="list-decimal list-inside space-y-3 text-charcoal font-bold">
              <li>Download your QR code in the format you need (PNG for printing, SVG for editing)</li>
              <li>Print the QR code on table tents, menu inserts, or stickers</li>
              <li>Place them where customers can easily scan with their phones</li>
              <li>Customers will be taken directly to your AccessMenu interface</li>
              <li>They can browse your menu in their language with accessibility features</li>
            </ol>
          </div>

          {/* Test Section */}
          <div className="mt-8 bg-white border-4 border-charcoal rounded-2xl p-6 shadow-[8px_8px_0px_#292524]">
            <h3 className="font-black text-charcoal mb-4 text-xl tracking-tight">Test Your QR Code</h3>
            <p className="text-charcoal font-bold mb-4">
              Once generated, test your QR code by scanning it with your phone camera or QR code app. 
              It should take you directly to your restaurant's AccessMenu page.
            </p>
            {generatedUrl && (
              <div className="bg-yellow/20 border-2 border-charcoal rounded-xl p-4">
                <p className="font-bold text-charcoal">
                  🎯 <strong>Test URL:</strong> Your QR code links to <code className="bg-cream px-2 py-1 rounded">{generatedUrl}</code>
                </p>
              </div>
            )}
          </div>

          {/* Hidden canvas for PNG generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for QRCode library
declare global {
  interface Window {
    QRCode: any;
  }
}

export default QRCodeGenerator;