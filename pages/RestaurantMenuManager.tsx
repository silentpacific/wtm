import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Camera } from 'lucide-react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';

// Interface matches exact database schema
interface MenuItem {
  id: string;
  dish_name: string;
  description_en?: string;
  price: number;
  section_name: string;
  allergens: string[];
  dietary_tags: string[];
  is_available?: boolean;
}

// Simplified menu scanner component to test
function SimpleMenuScanner({ onDishesScanned }: { onDishesScanned?: () => void }) {
  const { restaurant } = useRestaurantAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loadingDish, setLoadingDish] = useState<string | null>(null);
  const [dishExplanations, setDishExplanations] = useState<Record<string, any>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setScanResult(null);
      setDishExplanations({});
    }
  };

  // Function to get dish explanation (like consumer app)
  const getDishInfo = async (dishName: string) => {
    if (dishExplanations[dishName] || !restaurant) return;
    
    setLoadingDish(dishName);
    
    try {
      const response = await fetch('/.netlify/functions/getDishExplanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishName: dishName,
          language: 'en',
          restaurantId: restaurant.id.toString(),
          restaurantName: restaurant.business_name
        }),
      });

      if (response.ok) {
        const explanation = await response.json();
        setDishExplanations(prev => ({
          ...prev,
          [dishName]: explanation
        }));
      }
    } catch (error) {
      console.error('Error getting dish explanation:', error);
    } finally {
      setLoadingDish(null);
    }
  };

  const scanMenu = async () => {
    if (!selectedFile || !restaurant) {
      alert('Please select a file and ensure you are logged in');
      return;
    }
    
    setIsScanning(true);
    setScanResult(null);
    
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
      console.log('🏪 Restaurant ID:', restaurant.id, 'Name:', restaurant.business_name);
      
      const response = await fetch('/.netlify/functions/scanRestaurantMenu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          filename: selectedFile.name,
          restaurantId: restaurant.id.toString(),
          restaurantName: restaurant.business_name,
          scanType: 'production'
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);
      
      if (result.dishes && result.dishes.length > 0) {
        console.log(`🍽️ Found ${result.dishes.length} dishes:`);
        result.dishes.forEach((dish, index) => {
          console.log(`${index + 1}. ${dish.name} (${dish.section}) - ${dish.price || 'N/A'}`);
        });
        
        setScanResult(result);
        
        // Automatically save dishes to database and reload menu
        console.log('💾 Saving dishes to database...');
        
        try {
          const saveResponse = await fetch('/.netlify/functions/saveScannedDishes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dishes: result.dishes,
              restaurantId: restaurant.id.toString(),
              restaurantName: restaurant.business_name,
              cuisineType: result.cuisine_type
            }),
          });

          console.log('💾 Save response status:', saveResponse.status);
          
          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('✅ Dishes saved to database:', saveResult);
            
            // Call the callback to reload dishes in parent component
            if (onDishesScanned) {
              console.log('🔄 Triggering dish reload...');
              setTimeout(() => onDishesScanned(), 1000); // Small delay to ensure DB is updated
            }
            
            alert(`Menu scan successful! Found ${result.dishes.length} dishes and saved them to your restaurant menu. Switch to "Manage Menu" to edit them.`);
          } else {
            const errorText = await saveResponse.text();
            console.error('❌ Failed to save dishes:', errorText);
            alert(`Menu scan successful! Found ${result.dishes.length} dishes, but failed to save them. Error: ${errorText}`);
          }
        } catch (saveError) {
          console.error('Error saving dishes:', saveError);
          alert(`Menu scan successful! Found ${result.dishes.length} dishes. Check console for full details.`);
        }
      } else {
        console.log('❌ No dishes found or error occurred:', result);
        setScanResult(result);
        alert(`Scan completed but no dishes found. Response: ${JSON.stringify(result, null, 2)}`);
      }

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Scanner</h1>
        <p className="text-gray-600">Upload a photo of your menu to automatically populate your digital menu</p>
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

      {scanResult && (
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Scan Results</h3>
          
          {scanResult.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800">Error:</h4>
              <p className="text-red-700 text-sm">{scanResult.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scanResult.restaurant_name && (
                <div>
                  <strong>Restaurant:</strong> {scanResult.restaurant_name}
                </div>
              )}
              
              {scanResult.cuisine_type && (
                <div>
                  <strong>Cuisine:</strong> {scanResult.cuisine_type}
                </div>
              )}
              
              {scanResult.dishes && scanResult.dishes.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-2">Found {scanResult.dishes.length} dishes (click for details):</h4>
                  <div className="space-y-3">
                    {scanResult.dishes.map((dish, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <button
                              onClick={() => getDishInfo(dish.name)}
                              className="text-left w-full hover:bg-gray-50 p-2 rounded transition-colors"
                              disabled={loadingDish === dish.name}
                            >
                              <h5 className="font-medium text-blue-600 hover:text-blue-700">
                                {dish.name}
                                {loadingDish === dish.name && (
                                  <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                )}
                              </h5>
                              <p className="text-sm text-gray-600">Section: {dish.section}</p>
                            </button>
                            
                            {dishExplanations[dish.name] && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <p className="text-gray-700">{dishExplanations[dish.name].explanation}</p>
                                {dishExplanations[dish.name].tags?.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {dishExplanations[dish.name].tags.map((tag) => (
                                      <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {dishExplanations[dish.name].allergens?.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {dishExplanations[dish.name].allergens.map((allergen) => (
                                      <span key={allergen} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                        {allergen}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {dish.price && (
                            <span className="font-bold text-green-600">${dish.price}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No dishes found in the menu.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RestaurantMenuManager() {
  const { restaurant } = useRestaurantAuth();
  const [activeTab, setActiveTab] = useState<'manage' | 'scan'>('manage');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    dish_name: '',
    description_en: '',
    price: 0,
    section_name: '',
    allergens: [],
    dietary_tags: []
  });
  
  const [editFormData, setEditFormData] = useState<Partial<MenuItem>>({});

  const handleStartEdit = (item: MenuItem) => {
    setEditingItem(item.id);
    setEditFormData({
      dish_name: item.dish_name,
      description_en: item.description_en,
      price: item.price,
      section_name: item.section_name,
      allergens: item.allergens,
      dietary_tags: item.dietary_tags,
      is_available: item.is_available
    });
  };

  const allergenOptions = ['gluten', 'dairy', 'nuts', 'eggs', 'fish', 'shellfish', 'soy'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'];

  // Use getRestaurantDishes endpoint (now returns sections too)
  const loadDishes = useCallback(async () => {
    if (!restaurant?.id) {
      console.log('⚠️ No restaurant ID available');
      setLoading(false);
      return;
    }
    
    console.log(`📋 Loading dishes for restaurant ID: ${restaurant.id}`);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/.netlify/functions/getRestaurantDishes?restaurantId=${restaurant.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 Raw API response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      const dishes = data.dishes || [];
      const dynamicSections = data.sections || [];
      
      console.log(`✅ Loaded ${dishes.length} dishes from database`);
      console.log(`📂 Dynamic sections: ${dynamicSections.join(', ')}`);
      console.log('🔍 Sample dish:', dishes[0]);
      
      setMenuItems(dishes);
      setSections(dynamicSections);
      
      // Update newItem default section if sections exist
      if (dynamicSections.length > 0 && (!newItem.section_name || newItem.section_name === '')) {
        setNewItem(prev => ({ ...prev, section_name: dynamicSections[0] }));
      }
      
    } catch (err) {
      console.error('❌ Error loading dishes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
      setMenuItems([]);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  // Load dishes when restaurant is available
  useEffect(() => {
    console.log('🔄 RestaurantMenuManager - Restaurant state changed:', {
      hasRestaurant: !!restaurant,
      restaurantId: restaurant?.id,
      restaurantName: restaurant?.business_name
    });
    
    if (restaurant?.id) {
      loadDishes();
    } else {
      setLoading(false);
      setMenuItems([]);
      setSections([]);
    }
  }, [restaurant?.id, loadDishes]);

  const handleAddItem = async () => {
    if (!newItem.dish_name || !newItem.section_name || !restaurant) {
      alert('Please fill in dish name and section');
      return;
    }
    
    try {
      const response = await fetch('/.netlify/functions/manageRestaurantDish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          dish: newItem,
          restaurantId: restaurant.id.toString()
        })
      });

      if (response.ok) {
        await loadDishes(); // Reload all data
        
        // Reset form
        setNewItem({
          dish_name: '',
          description_en: '',
          price: 0,
          section_name: sections[0] || '',
          allergens: [],
          dietary_tags: []
        });
        setIsAddingItem(false);
      } else {
        const errorText = await response.text();
        alert(`Failed to add dish: ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding dish:', error);
      alert('Error adding dish. Please try again.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData.dish_name || !editFormData.section_name || !restaurant || !editingItem) {
      alert('Please fill in dish name and section');
      return;
    }
    
    try {
      const response = await fetch('/.netlify/functions/manageRestaurantDish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          dish: {
            id: editingItem,
            dish_name: editFormData.dish_name,
            section_name: editFormData.section_name,
            price: editFormData.price,
            description_en: editFormData.description_en,
            allergens: editFormData.allergens,
            dietary_tags: editFormData.dietary_tags
          },
          restaurantId: restaurant.id.toString()
        })
      });

      if (response.ok) {
        await loadDishes(); // Reload all data
        setEditingItem(null);
        setEditFormData({});
      } else {
        const errorText = await response.text();
        alert(`Failed to update dish: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating dish:', error);
      alert('Error updating dish. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const handleDeleteItem = async (id: string) => {
    if (!restaurant || !confirm('Are you sure you want to delete this dish?')) return;
    
    try {
      const response = await fetch('/.netlify/functions/manageRestaurantDish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          dish: { id },
          restaurantId: restaurant.id.toString()
        })
      });

      if (response.ok) {
        await loadDishes(); // Reload all data
      } else {
        const errorText = await response.text();
        alert(`Failed to delete dish: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('Error deleting dish. Please try again.');
    }
  };

  // Group items using actual section names from database
  const groupedItems = menuItems.reduce((acc, item) => {
    const section = item.section_name || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Show loading state properly
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Menu</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => loadDishes()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header with Tabs */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Menu Manager</h1>
        
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
              Manage Menu ({menuItems.length} items)
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
              Scan Menu
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'scan' ? (
        <SimpleMenuScanner onDishesScanned={loadDishes} />
      ) : (
        <>
          {/* Manage Menu Content */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600">Add, edit, and organize your menu items</p>
              <p className="text-sm text-gray-500 mt-1">
                {menuItems.length > 0 && `Currently showing ${menuItems.length} dishes across ${sections.length} sections`}
              </p>
            </div>
            <button
              onClick={() => setIsAddingItem(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Dish
            </button>
          </div>
          
          {/* Add Dish Modal */}
          {isAddingItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add New Dish</h3>
                  <button
                    onClick={() => setIsAddingItem(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      value={newItem.dish_name || ''}
                      onChange={(e) => setNewItem({ ...newItem, dish_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter dish name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newItem.description_en || ''}
                      onChange={(e) => setNewItem({ ...newItem, description_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Describe the dish"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price || 0}
                      onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section *
                    </label>
                    {sections.length > 0 ? (
                      <select
                        value={newItem.section_name || ''}
                        onChange={(e) => setNewItem({ ...newItem, section_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select section</option>
                        {sections.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={newItem.section_name || ''}
                        onChange={(e) => setNewItem({ ...newItem, section_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter section name (e.g., Appetizers, Mains)"
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsAddingItem(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Add Dish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Dish Modal */}
          {editingItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Edit Dish</h3>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.dish_name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dish_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter dish name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description_en || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, description_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Describe the dish"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.price || 0}
                      onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section *
                    </label>
                    {sections.length > 0 ? (
                      <select
                        value={editFormData.section_name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, section_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select section</option>
                        {sections.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editFormData.section_name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, section_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter section name (e.g., Appetizers, Mains)"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergens
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allergenOptions.map(allergen => (
                        <label key={allergen} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.allergens?.includes(allergen) || false}
                            onChange={(e) => {
                              const updatedAllergens = e.target.checked
                                ? [...(editFormData.allergens || []), allergen]
                                : (editFormData.allergens || []).filter(a => a !== allergen);
                              setEditFormData({ ...editFormData, allergens: updatedAllergens });
                            }}
                            className="mr-1"
                          />
                          <span className="text-sm">{allergen}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dietary Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryOptions.map(tag => (
                        <label key={tag} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.dietary_tags?.includes(tag) || false}
                            onChange={(e) => {
                              const updatedTags = e.target.checked
                                ? [...(editFormData.dietary_tags || []), tag]
                                : (editFormData.dietary_tags || []).filter(t => t !== tag);
                              setEditFormData({ ...editFormData, dietary_tags: updatedTags });
                            }}
                            className="mr-1"
                          />
                          <span className="text-sm">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Display dishes using dynamic sections */}
          {menuItems.length > 0 ? (
            <div className="space-y-8">
              {sections.map(section => (
                <div key={section} className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {section} ({groupedItems[section]?.length || 0} items)
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    {groupedItems[section]?.length > 0 ? (
                      <div className="space-y-4">
                        {groupedItems[section].map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-gray-900">{item.dish_name}</h3>
                                  {item.description_en && (
                                    <p className="text-gray-600 text-sm mt-1">{item.description_en}</p>
                                  )}
                                  
                                  <div className="flex gap-2 mt-2">
                                    {item.allergens?.map(allergen => (
                                      <span
                                        key={allergen}
                                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                      >
                                        {allergen}
                                      </span>
                                    ))}
                                    
                                    {item.dietary_tags?.map(tag => (
                                      <span
                                        key={tag}
                                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">${item.price?.toFixed(2) || '0.00'}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-2 text-gray-400 hover:text-blue-600"
                                title="Edit dish"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600"
                                title="Delete dish"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No items in {section} yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
              <p className="text-gray-600 mb-6">Get started by scanning your menu or adding dishes manually.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('scan')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Camera size={16} />
                  Scan Menu
                </button>
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Manually
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}