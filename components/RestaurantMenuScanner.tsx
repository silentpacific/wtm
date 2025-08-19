import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Loader, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';

interface ScannedDish {
  name: string;
  section: string;
  price?: number;
  description?: string;
  allergens: string[];
  dietary_tags: string[];
}

interface MenuScanResult {
  restaurant_name?: string;
  cuisine_type?: string;
  dishes: ScannedDish[];
  header_notes?: string;
  footer_notes?: string;
  special_notes?: string;
}

export default function RestaurantMenuScanner() {
  const { restaurant } = useRestaurantAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<MenuScanResult | null>(null);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.heif'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const scanMenu = async () => {
    if (!selectedFile || !restaurant) return;

    setIsScanning(true);
    setError('');

    try {
      console.log('🔍 Starting menu scan for restaurant:', restaurant.business_name);

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Call the enhanced getDishExplanation function for menu scanning
      const response = await fetch('/.netlify/functions/scanRestaurantMenu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          filename: selectedFile.name,
          restaurantId: restaurant.id,
          restaurantName: restaurant.business_name,
          scanType: 'full_menu'
        }),
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Menu scan result:', result);

      setScanResult(result);

    } catch (error) {
      console.error('❌ Menu scan error:', error);
      setError('Failed to scan menu. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const saveToMenu = async () => {
    if (!scanResult || !restaurant) return;

    try {
      console.log('💾 Saving scanned menu to database...');

      // Update restaurant notes if captured
      if (scanResult.header_notes || scanResult.footer_notes || scanResult.special_notes) {
        const notesUpdate = {
          special_notes: [
            scanResult.header_notes && `Header: ${scanResult.header_notes}`,
            scanResult.footer_notes && `Footer: ${scanResult.footer_notes}`,
            scanResult.special_notes && `Notes: ${scanResult.special_notes}`
          ].filter(Boolean).join('\n\n')
        };

        await fetch('/.netlify/functions/updateRestaurantProfile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: restaurant.id,
            updates: notesUpdate
          })
        });
      }

      // Save dishes to menu
      const dishPromises = scanResult.dishes.map(async (dish) => {
        const dishData = {
          restaurant_id: restaurant.id,
          dish_name: dish.name,
          section_name: dish.section,
          price: dish.price || null,
          currency: 'USD',
          description_en: dish.description || '',
          allergens: dish.allergens || [],
          dietary_tags: dish.dietary_tags || [],
          is_available: true,
          display_order: 0
        };

        return fetch('/.netlify/functions/addRestaurantDish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dishData)
        });
      });

      await Promise.all(dishPromises);

      console.log('✅ Menu saved successfully!');
      
      // Reset state
      setScanResult(null);
      setSelectedFile(null);
      
      // Show success message
      alert('Menu scanned and saved successfully! Check your Menu Manager to review and edit items.');

    } catch (error) {
      console.error('❌ Error saving menu:', error);
      setError('Failed to save menu. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Scanner</h1>
        <p className="text-gray-600">Upload a photo or PDF of your menu to automatically populate your digital menu</p>
      </div>

      {!scanResult ? (
        <>
          {/* File Upload Area */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="mb-4">
                {selectedFile ? (
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                )}
              </div>
              
              {selectedFile ? (
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">File selected:</p>
                  <p className="text-gray-600">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-2">Click to change file</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive ? 'Drop your menu here' : 'Upload your menu'}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Drag and drop a photo or PDF of your menu, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, HEIC, PDF • Max 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scan Button */}
          {selectedFile && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={scanMenu}
                disabled={isScanning}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Scanning menu...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Scan Menu
                  </>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">How Menu Scanning Works</h3>
            <div className="space-y-2 text-blue-800 text-sm">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <span>Upload a clear photo or PDF of your current menu</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <span>Our AI will extract dishes, prices, sections, and notes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <span>Review and approve the scanned items</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                <span>Items are automatically added to your digital menu</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Scan Results Review */
        <div className="space-y-6">
          {/* Header with restaurant info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Scan Results</h2>
            
            {scanResult.header_notes && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800">Header Notes:</h4>
                <p className="text-yellow-700 text-sm">{scanResult.header_notes}</p>
              </div>
            )}
            
            {scanResult.footer_notes && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800">Footer Notes:</h4>
                <p className="text-yellow-700 text-sm">{scanResult.footer_notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Found {scanResult.dishes.length} dishes</p>
                {scanResult.cuisine_type && (
                  <p className="text-sm text-gray-500">Cuisine: {scanResult.cuisine_type}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setScanResult(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Scan Again
                </button>
                <button
                  onClick={saveToMenu}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add to Menu
                </button>
              </div>
            </div>
          </div>

          {/* Dishes by Section */}
          {Object.entries(
            scanResult.dishes.reduce((acc, dish) => {
              if (!acc[dish.section]) acc[dish.section] = [];
              acc[dish.section].push(dish);
              return acc;
            }, {} as Record<string, ScannedDish[]>)
          ).map(([section, dishes]) => (
            <div key={section} className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{section}</h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  {dishes.map((dish, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{dish.name}</h4>
                        {dish.price && (
                          <span className="font-bold text-gray-900">${dish.price.toFixed(2)}</span>
                        )}
                      </div>
                      
                      {dish.description && (
                        <p className="text-gray-600 text-sm mb-3">{dish.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {dish.dietary_tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        
                        {dish.allergens.map((allergen) => (
                          <span
                            key={allergen}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                          >
                            Contains: {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}