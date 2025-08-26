// src/pages/MenuEditorPage.tsx
import React, { useState } from 'react';
import { Upload, FileImage, FileText, Loader, AlertCircle, CheckCircle, Edit, Trash2, Plus, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import DashboardLayout from '../components/DashboardLayout';

interface RestaurantInfo {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
}

interface Dish {
  name: string;
  description: string;
  price: string;
  allergens: string[];
  dietaryTags: string[];
}

interface MenuSection {
  name: string;
  dishes: Dish[];
}

interface MenuData {
  restaurant: RestaurantInfo;
  sections: MenuSection[];
}

interface ScanStats {
  sections: number;
  totalDishes: number;
  processingTime: number;
}

const MenuEditorPage: React.FC = () => {
  const { user } = useAuth(); // Changed from useContext(AuthContext) to useAuth()
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!supportedTypes.includes(selectedFile.type)) {
        setScanError('Please upload a JPG, PNG, or PDF file.');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setScanError('File size must be less than 10MB.');
        return;
      }

      setFile(selectedFile);
      setScanError(null);
      setMenuData(null);
      setScanStats(null);
      setSaveSuccess(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const scanMenu = async () => {
    if (!file || !user) return;

    setIsScanning(true);
    setScanError(null);
    setMenuData(null);
    setScanStats(null);

    try {
      console.log('Starting menu scan...');
      
      // Convert file to base64
      const base64Data = await convertFileToBase64(file);
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      // Call menu scanner API
      const response = await fetch('/.netlify/functions/menu-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          mimeType: file.type
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      console.log('Menu scan completed:', result);
      setMenuData(result.data);
      setScanStats(result.stats);
      
    } catch (error) {
      console.error('Menu scan error:', error);
      setScanError(error instanceof Error ? error.message : 'Failed to scan menu');
    } finally {
      setIsScanning(false);
    }
  };

  const updateDish = (sectionIndex: number, dishIndex: number, updatedDish: Dish) => {
    if (!menuData) return;

    const newMenuData = { ...menuData };
    newMenuData.sections[sectionIndex].dishes[dishIndex] = updatedDish;
    setMenuData(newMenuData);
  };

  const deleteDish = (sectionIndex: number, dishIndex: number) => {
    if (!menuData) return;

    const newMenuData = { ...menuData };
    newMenuData.sections[sectionIndex].dishes.splice(dishIndex, 1);
    setMenuData(newMenuData);
  };

  const addDish = (sectionIndex: number) => {
    if (!menuData) return;

    const newDish: Dish = {
      name: '',
      description: '',
      price: '',
      allergens: [],
      dietaryTags: []
    };

    const newMenuData = { ...menuData };
    newMenuData.sections[sectionIndex].dishes.push(newDish);
    setMenuData(newMenuData);
  };

  const saveMenu = async () => {
    if (!menuData || !user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // First, get or create restaurant record
      let restaurantId = null;

      if (menuData.restaurant.name) {
        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('id')
          .eq('auth_user_id', user.id)
          .eq('name', menuData.restaurant.name);

        if (restaurants && restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        } else {
          // Create new restaurant
          const { data: newRestaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .insert({
              name: menuData.restaurant.name,
              address: menuData.restaurant.address || null,
              phone: menuData.restaurant.phone || null,
              auth_user_id: user.id,
              owner_name: user.user_metadata?.full_name || null
            })
            .select('id')
            .single();

          if (restaurantError) throw restaurantError;
          restaurantId = newRestaurant.id;
        }
      }

      // Create menu record
      const { data: menu, error: menuError } = await supabase
        .from('accessmenu_menus')
        .insert({
          restaurant_id: restaurantId,
          name: `Menu - ${new Date().toLocaleDateString()}`,
          is_active: true
        })
        .select('id')
        .single();

      if (menuError) throw menuError;

      // Insert all dishes
      const dishInserts = [];
      for (const section of menuData.sections) {
        for (const dish of section.dishes) {
          if (dish.name.trim()) { // Only insert dishes with names
            dishInserts.push({
              accessmenu_menu_id: menu.id,
              section_name: { en: section.name },
              dish_name: { en: dish.name },
              description: { en: dish.description },
              price: parseFloat(dish.price.replace(/[^0-9.]/g, '')) || 0,
              allergens: dish.allergens,
              dietary_tags: dish.dietaryTags,
              explanation: { en: dish.description } // Use description as explanation for now
            });
          }
        }
      }

      if (dishInserts.length > 0) {
        const { error: dishError } = await supabase
          .from('accessmenu_dishes')
          .insert(dishInserts);

        if (dishError) throw dishError;
      }

      console.log(`Successfully saved menu with ${dishInserts.length} dishes`);
      setSaveSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error) {
      console.error('Error saving menu:', error);
      setScanError(error instanceof Error ? error.message : 'Failed to save menu');
    } finally {
      setIsSaving(false);
    }
  };

  const removeAllergen = (sectionIndex: number, dishIndex: number, allergen: string) => {
    if (!menuData) return;
    const dish = menuData.sections[sectionIndex].dishes[dishIndex];
    updateDish(sectionIndex, dishIndex, {
      ...dish,
      allergens: dish.allergens.filter(a => a !== allergen)
    });
  };

  const addAllergen = (sectionIndex: number, dishIndex: number, allergen: string) => {
    if (!menuData || !allergen.trim()) return;
    const dish = menuData.sections[sectionIndex].dishes[dishIndex];
    if (!dish.allergens.includes(allergen)) {
      updateDish(sectionIndex, dishIndex, {
        ...dish,
        allergens: [...dish.allergens, allergen]
      });
    }
  };

  const removeDietaryTag = (sectionIndex: number, dishIndex: number, tag: string) => {
    if (!menuData) return;
    const dish = menuData.sections[sectionIndex].dishes[dishIndex];
    updateDish(sectionIndex, dishIndex, {
      ...dish,
      dietaryTags: dish.dietaryTags.filter(t => t !== tag)
    });
  };

  const addDietaryTag = (sectionIndex: number, dishIndex: number, tag: string) => {
    if (!menuData || !tag.trim()) return;
    const dish = menuData.sections[sectionIndex].dishes[dishIndex];
    if (!dish.dietaryTags.includes(tag)) {
      updateDish(sectionIndex, dishIndex, {
        ...dish,
        dietaryTags: [...dish.dietaryTags, tag]
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu Editor</h1>
          
          {/* File Upload Section */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="menu-file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="menu-file" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Upload Menu Image or PDF
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, and PDF files up to 10MB
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  {file.type === 'application/pdf' ? (
                    <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  ) : (
                    <FileImage className="w-8 h-8 text-blue-600 mr-3" />
                  )}
                  <div>
                    <p className="font-medium text-blue-900">{file.name}</p>
                    <p className="text-sm text-blue-600">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={scanMenu}
                  disabled={isScanning}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isScanning ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    'Scan Menu'
                  )}
                </button>
              </div>
            )}

            {scanError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Scan Error</p>
                  <p className="text-red-700 text-sm">{scanError}</p>
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <p className="text-green-800 font-medium">Menu saved successfully!</p>
              </div>
            )}
          </div>

          {/* Scan Stats */}
          {scanStats && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Scan Results</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-green-800">{scanStats.sections}</p>
                  <p className="text-green-600">Sections</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-800">{scanStats.totalDishes}</p>
                  <p className="text-green-600">Dishes</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-800">{(scanStats.processingTime / 1000).toFixed(1)}s</p>
                  <p className="text-green-600">Processing Time</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Data Editor */}
        {menuData && (
          <div className="space-y-6">
            {/* Restaurant Info */}
            {menuData.restaurant && Object.keys(menuData.restaurant).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuData.restaurant.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{menuData.restaurant.name}</p>
                    </div>
                  )}
                  {menuData.restaurant.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900">{menuData.restaurant.address}</p>
                    </div>
                  )}
                  {menuData.restaurant.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{menuData.restaurant.phone}</p>
                    </div>
                  )}
                  {menuData.restaurant.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <p className="text-gray-900">{menuData.restaurant.website}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Menu Sections */}
            {menuData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{section.name}</h2>
                  <button
                    onClick={() => addDish(sectionIndex)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Dish
                  </button>
                </div>

                <div className="space-y-4">
                  {section.dishes.map((dish, dishIndex) => (
                    <div key={dishIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Dish Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                          <input
                            type="text"
                            value={dish.name}
                            onChange={(e) => updateDish(sectionIndex, dishIndex, { ...dish, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                          />
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <input
                            type="text"
                            value={dish.price}
                            onChange={(e) => updateDish(sectionIndex, dishIndex, { ...dish, price: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-end">
                          <button
                            onClick={() => deleteDish(sectionIndex, dishIndex)}
                            className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={dish.description}
                          onChange={(e) => updateDish(sectionIndex, dishIndex, { ...dish, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                        />
                      </div>

                      {/* Dietary Tags */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {dish.dietaryTags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center"
                            >
                              {tag}
                              <button
                                onClick={() => removeDietaryTag(sectionIndex, dishIndex, tag)}
                                className="ml-1 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add dietary tag..."
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addDietaryTag(sectionIndex, dishIndex, e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Allergens */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {dish.allergens.map((allergen, allergenIndex) => (
                            <span
                              key={allergenIndex}
                              className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm flex items-center"
                            >
                              {allergen}
                              <button
                                onClick={() => removeAllergen(sectionIndex, dishIndex, allergen)}
                                className="ml-1 text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add allergen..."
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addAllergen(sectionIndex, dishIndex, e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {section.dishes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No dishes in this section. Click "Add Dish" to get started.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Save Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready to save your menu?</h3>
                  <p className="text-sm text-gray-600">This will create a new menu in your restaurant dashboard.</p>
                </div>
                <button
                  onClick={saveMenu}
                  disabled={isSaving}
                  className="bg-coral-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-coral-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Menu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!menuData && !isScanning && !scanError && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu uploaded yet</h3>
              <p className="text-gray-600">
                Upload a menu image or PDF to get started. Our AI will automatically extract all the dishes, 
                descriptions, prices, and add dietary information.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenuEditorPage;