import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Camera } from 'lucide-react';

// Simplified menu scanner component to test
function SimpleMenuScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const scanMenu = async () => {
    if (!selectedFile) return;
    
    setIsScanning(true);
    
    try {
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

      console.log('📸 File converted to base64, length:', base64.length);
      
      // Test call to your existing getDishExplanation endpoint
      const response = await fetch('/.netlify/functions/getDishExplanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishName: 'Test Menu Scan',
          language: 'en',
          restaurantId: '7', // Your restaurant ID from the logs
          restaurantName: "Rahul's Coffee Shop 2"
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);
      alert('Scanning test successful! Check console for details.');

    } catch (error) {
      console.error('❌ Scanning error:', error);
      alert(`Scanning failed: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Scanner (Debug Mode)</h1>
        <p className="text-gray-600">Upload a photo of your menu to test the scanning functionality</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="mb-4">
            <Camera className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          
          <div className="mb-4">
            <label htmlFor="menu-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-900 mb-2 block">
                Upload Menu Image
              </span>
              <span className="text-gray-600 mb-4 block">
                Select a photo of your menu to test scanning
              </span>
              <input
                id="menu-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Choose File
              </div>
            </label>
          </div>
          
          {selectedFile && (
            <div className="mt-4">
              <p className="text-green-600 font-medium">Selected: {selectedFile.name}</p>
              <p className="text-sm text-gray-500">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={scanMenu}
            disabled={isScanning}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Testing scan...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Test Scan Menu
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-3">Debug Information</h3>
        <div className="text-yellow-800 text-sm space-y-1">
          <p>• This is a simplified scanner to test if the basic functionality works</p>
          <p>• Your restaurant ID: 7</p>
          <p>• The Supabase errors in console suggest connection issues</p>
          <p>• This test bypasses the tab system to isolate the scanning feature</p>
        </div>
      </div>
    </div>
  );
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  section: string;
  allergens: string[];
  dietary_tags: string[];
}

export default function RestaurantMenuManager() {
  const [activeTab, setActiveTab] = useState<'manage' | 'scan'>('scan'); // Default to scan for testing
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Sample Dish',
      description: 'Sample description',
      price: 12.99,
      section: 'Appetizers',
      allergens: ['gluten'],
      dietary_tags: ['vegetarian']
    }
  ]);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    section: 'Appetizers',
    allergens: [],
    dietary_tags: []
  });

  const sections = ['Appetizers', 'Mains', 'Desserts', 'Drinks'];
  const allergenOptions = ['gluten', 'dairy', 'nuts', 'eggs', 'fish', 'shellfish', 'soy'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'];

  const handleAddItem = () => {
    if (newItem.name && newItem.description && newItem.price) {
      const item: MenuItem = {
        id: Date.now().toString(),
        name: newItem.name!,
        description: newItem.description!,
        price: newItem.price!,
        section: newItem.section || 'Appetizers',
        allergens: newItem.allergens || [],
        dietary_tags: newItem.dietary_tags || []
      };
      
      setMenuItems([...menuItems, item]);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        section: 'Appetizers',
        allergens: [],
        dietary_tags: []
      });
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header with Tabs */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Menu Manager (Debug Version)</h1>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Menu
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'scan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Camera size={16} />
              Scan Menu (Debug)
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'scan' ? (
        <SimpleMenuScanner />
      ) : (
        // Original manage content (simplified)
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Add, edit, and organize your menu items</p>
            <button
              onClick={() => setIsAddingItem(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Dish
            </button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-2">Debug Mode Active</h3>
            <p className="text-yellow-800 text-sm">
              This is a simplified version to test the scanner functionality. 
              Switch to "Scan Menu (Debug)" tab to test the upload feature.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}