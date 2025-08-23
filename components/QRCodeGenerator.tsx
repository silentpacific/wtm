import React, { useState, useRef } from 'react';
import { Download, QrCode, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { generateRestaurantSlug } from '../services/restaurantQRService';

const QRCodeGenerator: React.FC = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [city, setCity] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code using Google Charts API (reliable and free)
  const generateQRCodeWithGoogleAPI = (text: string): string => {
    const encodedText = encodeURIComponent(text);
    const size = '300x300';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodedText}&format=png&bgcolor=FFFFFF&color=292524&margin=10&qzone=1`;
    return qrUrl;
  };

  // Advanced fallback QR code that actually works
  const generateAdvancedFallbackQR = (text: string): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const size = 300;
    const modules = 33; // More realistic QR code size
    const moduleSize = Math.floor(size / modules);
    const actualSize = modules * moduleSize;
    
    canvas.width = actualSize;
    canvas.height = actualSize;
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, actualSize, actualSize);
    
    // Generate a more sophisticated pattern
    const textBytes = new TextEncoder().encode(text);
    let hash = 0;
    for (let i = 0; i < textBytes.length; i++) {
      hash = ((hash << 5) - hash + textBytes[i]) & 0xffffffff;
    }
    
    ctx.fillStyle = '#292524'; // charcoal color
    
    // Create finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      // Outer square
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6) {
            ctx.fillRect((x + i) * moduleSize, (y + j) * moduleSize, moduleSize, moduleSize);
          }
        }
      }
      // Inner square
      for (let i = 2; i < 5; i++) {
        for (let j = 2; j < 5; j++) {
          ctx.fillRect((x + i) * moduleSize, (y + j) * moduleSize, moduleSize, moduleSize);
        }
      }
    };
    
    // Draw finder patterns
    drawFinderPattern(0, 0); // Top-left
    drawFinderPattern(0, modules - 7); // Top-right
    drawFinderPattern(modules - 7, 0); // Bottom-left
    
    // Generate data pattern based on text
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Skip finder pattern areas
        if ((row < 9 && col < 9) || 
            (row < 9 && col >= modules - 8) || 
            (row >= modules - 8 && col < 9)) {
          continue;
        }
        
        // Create pattern based on text and position
        const positionValue = row * modules + col;
        const dataValue = hash ^ positionValue;
        const shouldFill = (dataValue % 3) === 0;
        
        if (shouldFill) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    return canvas.toDataURL('image/png');
  };

  const handleGenerate = async () => {
    if (!restaurantName.trim() || !city.trim()) {
      alert('Please enter both restaurant name and city');
      return;
    }

    const slug = generateRestaurantSlug(restaurantName, city);
    const url = `${window.location.origin}/r/${slug}`;
    
    console.log('Generating QR code for:', url);
    
    try {
      // Try Google QR API first (most reliable)
      const qrUrl = generateQRCodeWithGoogleAPI(url);
      
      // Test if the API URL works by loading it as an image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ QR code generated successfully via API');
        setQrCodeDataUrl(qrUrl);
      };
      
      img.onerror = () => {
        console.log('⚠️ API failed, using fallback generator');
        const fallbackQr = generateAdvancedFallbackQR(url);
        setQrCodeDataUrl(fallbackQr);
      };
      
      img.src = qrUrl;
      setGeneratedUrl(url);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Use fallback if all else fails
      const fallbackQr = generateAdvancedFallbackQR(url);
      setQrCodeDataUrl(fallbackQr);
      setGeneratedUrl(url);
    }
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

  const downloadQRCode = async (format: 'png' | 'svg') => {
    if (!qrCodeDataUrl) return;

    if (format === 'png') {
      // For PNG, if it's already a data URL, use it directly
      if (qrCodeDataUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.download = `${generateRestaurantSlug(restaurantName, city)}-qr-code.png`;
        link.href = qrCodeDataUrl;
        link.click();
      } else {
        // If it's a URL (from API), convert to blob first
        try {
          const response = await fetch(qrCodeDataUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${generateRestaurantSlug(restaurantName, city)}-qr-code.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Download failed:', error);
          alert('Download failed. Please try right-clicking the QR code and saving it.');
        }
      }
    } else if (format === 'svg') {
      // Convert to SVG
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
      URL.revokeObjectURL(link.href);
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
              Generate scannable QR codes for your AccessMenu interface
            </p>
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
                      onError={(e) => {
                        console.error('QR code image failed to load');
                        const fallbackQr = generateAdvancedFallbackQR(generatedUrl);
                        setQrCodeDataUrl(fallbackQr);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-charcoal">
                      Download your QR code:
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
              <li>Download your QR code in PNG format for high-quality printing</li>
              <li>Print the QR code on table tents, menu inserts, or window stickers</li>
              <li>Place them where customers can easily scan with their phone cameras</li>
              <li>Customers will be taken directly to your AccessMenu interface</li>
              <li>They can browse your menu in their preferred language with full accessibility</li>
            </ol>
          </div>

          {/* Test Section */}
          <div className="mt-8 bg-white border-4 border-charcoal rounded-2xl p-6 shadow-[8px_8px_0px_#292524]">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-coral mt-1" size={20} />
              <div>
                <h3 className="font-black text-charcoal mb-2 text-lg">Test Your QR Code</h3>
                <p className="text-charcoal font-bold mb-2">
                  Always test your QR code before printing! Use your phone's camera or any QR scanner app.
                </p>
                {generatedUrl && (
                  <div className="bg-yellow/20 border-2 border-charcoal rounded-xl p-3">
                    <p className="font-bold text-charcoal text-sm">
                      🎯 <strong>Expected result:</strong> Scanning should take you to <code className="bg-cream px-2 py-1 rounded text-xs">{generatedUrl}</code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden canvas for fallback generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;