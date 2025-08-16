// src/components/QRCodeTest.tsx
import React, { useState, useEffect } from 'react';
import { QRCodeService } from '../services/qrCodeService';

const QRCodeTest: React.FC = () => {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [qrSizes, setQrSizes] = useState<any>(null);

  const generateQRCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Test with Bob's Bistro
      const qrDataURL = await QRCodeService.generateQRDataURL('bobs-bistro', {
        size: 300,
        margin: 2
      });
      
      setQrCode(qrDataURL);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMultipleSizes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const sizes = await QRCodeService.generateMultipleSizes('bobs-bistro');
      setQrSizes(sizes);
    } catch (err) {
      setError('Failed to generate QR code sizes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (qrCode) {
      QRCodeService.downloadQRCode(qrCode, 'bobs-bistro-qr.png');
    }
  };

  const generateTableTent = async () => {
    try {
      const qrDataURL = await QRCodeService.generateQRDataURL('bobs-bistro');
      const tableTentHTML = QRCodeService.generateTableTentHTML(
        "Bob's Bistro",
        qrDataURL,
        "Scan to view our accessible menu"
      );
      
      // Open in new window for printing
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(tableTentHTML);
        newWindow.document.close();
      }
    } catch (err) {
      setError('Failed to generate table tent');
      console.error(err);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">QR Code Generator Test</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Single QR Code */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-3">Standard QR Code</h3>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <img 
                src={qrCode} 
                alt="QR Code for Bob's Bistro" 
                className="mx-auto border-2 border-gray-200 rounded"
              />
              <p className="text-sm text-gray-600">
                Scan this QR code to visit: /restaurants/bobs-bistro
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={generateQRCode}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Regenerate
                </button>
                <button
                  onClick={downloadQR}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Download PNG
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Multiple Sizes */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Multiple Sizes</h3>
          <div className="text-center mb-4">
            <button
              onClick={generateMultipleSizes}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Generate All Sizes
            </button>
          </div>
          
          {qrSizes && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <h4 className="font-medium mb-2">Small (150px)</h4>
                <p className="text-xs text-gray-600 mb-2">Business cards</p>
                <img src={qrSizes.small} alt="Small QR" className="mx-auto border rounded" />
                <button
                  onClick={() => QRCodeService.downloadQRCode(qrSizes.small, 'bobs-bistro-small.png')}
                  className="mt-2 text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                >
                  Download
                </button>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-2">Medium (300px)</h4>
                <p className="text-xs text-gray-600 mb-2">Table tents</p>
                <img src={qrSizes.medium} alt="Medium QR" className="mx-auto border rounded" />
                <button
                  onClick={() => QRCodeService.downloadQRCode(qrSizes.medium, 'bobs-bistro-medium.png')}
                  className="mt-2 text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                >
                  Download
                </button>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-2">Large (600px)</h4>
                <p className="text-xs text-gray-600 mb-2">Posters</p>
                <img src={qrSizes.large} alt="Large QR" className="mx-auto border rounded max-w-32" />
                <button
                  onClick={() => QRCodeService.downloadQRCode(qrSizes.large, 'bobs-bistro-large.png')}
                  className="mt-2 text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Tent Generator */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Table Tent Template</h3>
          <div className="text-center">
            <button
              onClick={generateTableTent}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              Generate Printable Table Tent
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Opens a printable table tent in a new window
            </p>
          </div>
        </div>

        {/* Test URL */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Test QR Code</h3>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              QR code points to: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}/restaurants/bobs-bistro</code>
            </p>
            <a 
              href="/restaurants/bobs-bistro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded text-sm"
            >
              Test Restaurant Page →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeTest;