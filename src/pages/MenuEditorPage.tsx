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
  const { user } = useAuth();
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

  const getChipClass = (type: 'dietary' | 'allergen') => {
    return type === 'dietary' ? 'chip--veg' : 'chip--shell';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="card p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--wtm-text)' }}>
            Menu Editor
          </h1>
          
          {/* File Upload Section */}
          <div className="mb-8">
            <div className="border-2 border-dashed rounded-lg p-8 text-center" 
                 style={{ borderColor: 'var(--wtm-muted)' }}>
              <input
                type="file"
                id="menu-file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="menu-file" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 mb-4" style={{ color: 'var(--wtm-muted)' }} />
                  <p className="text-lg font-medium mb-2" style={{ color: 'var(--wtm-text)' }}>
                    Upload Menu Image or PDF
                  </p>
                  <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>
                    Supports JPG, PNG, and PDF files up to 10MB
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 rounded-lg flex items-center justify-between" 
                   style={{ backgroundColor: 'var(--chip-shell-bg)' }}>
                <div className="flex items-center">
                  {file.type === 'application/pdf' ? (
                    <FileText className="w-8 h-8 mr-3" style={{ color: 'var(--chip-shell-fg)' }} />
                  ) : (
                    <FileImage className="w-8 h-8 mr-3" style={{ color: 'var(--chip-shell-fg)' }} />
                  )}
                  <div>
                    <p className="font-medium" style={{ color: 'var(--chip-shell-fg)' }}>{file.name}</p>
                    <p className="text-sm" style={{ color: 'var(--chip-shell-fg)' }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={scanMenu}
                  disabled={isScanning}
                  className={`btn flex items-center ${
                    isScanning ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'
                  }`}
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
              <div className="mt-4 p-4 rounded-lg flex items-start" 
                   style={{ 
                     backgroundColor: 'var(--chip-gluten-bg)', 
                     border: `1px solid var(--chip-gluten-fg)`
                   }}>
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--chip-gluten-fg)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--chip-gluten-fg)' }}>Scan Error</p>
                  <p className="text-sm" style={{ color: 'var(--chip-gluten-fg)' }}>{scanError}</p>
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="mt-4 p-4 rounded-lg flex items-center" 
                   style={{ 
                     backgroundColor: 'var(--chip-veg-bg)', 
                     border: `1px solid var(--chip-veg-fg)`
                   }}>
                <CheckCircle className="w-5 h-5 mr-3" style={{ color: 'var(--chip-veg-fg)' }} />
                <p className="font-medium" style={{ color: 'var(--chip-veg-fg)' }}>
                  Menu saved successfully!
                </p>
              </div>
            )}
          </div>

          {/* Scan Stats */}
          {scanStats && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--chip-veg-bg)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--chip-veg-fg)' }}>
                Scan Results
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium" style={{ color: 'var(--chip-veg-fg)' }}>
                    {scanStats.sections}
                  </p>
                  <p style={{ color: 'var(--chip-veg-fg)' }}>Sections</p>
                </div>
                <div className="text-center">
                  <p className="font-medium" style={{ color: 'var(--chip-veg-fg)' }}>
                    {scanStats.totalDishes}
                  </p>
                  <p style={{ color: 'var(--chip-veg-fg)' }}>Dishes</p>
                </div>
                <div className="text-center">
                  <p className="font-medium" style={{ color: 'var(--chip-veg-fg)' }}>
                    {(scanStats.processingTime / 1000).toFixed(1)}s
                  </p>
                  <p style={{ color: 'var(--chip-veg-fg)' }}>Processing Time</p>
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
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--wtm-text)' }}>
                  Restaurant Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuData.restaurant.name && (
                    <div>
                      <label className="block text-sm font-medium mb-1" 
                             style={{ color: 'var(--wtm-text)' }}>Name</label>
                      <p style={{ color: 'var(--wtm-text)' }}>{menuData.restaurant.name}</p>
                    </div>
                  )}
                  {menuData.restaurant.address && (
                    <div>
                      <label className="block text-sm font-medium mb-1" 
                             style={{ color: 'var(--wtm-text)' }}>Address</label>
                      <p style={{ color: 'var(--wtm-text)' }}>{menuData.restaurant.address}</p>
                    </div>
                  )}
                  {menuData.restaurant.phone && (
                    <div>
                      <label className="block text-sm font-medium mb-1" 
                             style={{ color: 'var(--wtm-text)' }}>Phone</label>
                      <p style={{ color: 'var(--wtm-text)' }}>{menuData.restaurant.phone}</p>
                    </div>
                  )}
                  {menuData.restaurant.website && (
                    <div>
                      <label className="block text-sm font-medium mb-1" 
                             style={{ color: 'var(--wtm-text)' }}>Website</label>
                      <p style={{ color: 'var(--wtm-text)' }}>{menuData.restaurant.website}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Menu Sections */}
            {menuData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                    {section.name}
                  </h2>
                  <button
                    onClick={() => addDish(sectionIndex)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Dish
                  </button>
                </div>

                <div className="space-y-4">
                  {section.dishes.map((dish, dishIndex) => (
                    <div key={dishIndex} className="p-4 rounded-lg" 
                         style={{ border: `1px solid #EFE7E2` }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Dish Name */}
                        <div>
                          <label className="block text-sm font-medium mb-1" 
                                 style={{ color: 'var(--wtm-text)' }}>Dish Name</label>
                          <input
                            type="text"
                            value={dish.price}
                            onChange={(e) => updateDish(sectionIndex, dishIndex, { ...dish, price: e.target.value })}
                            className="input-field w-full"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-end">
                          <button
                            onClick={() => deleteDish(sectionIndex, dishIndex)}
                            className="btn-danger-ghost flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" 
                               style={{ color: 'var(--wtm-text)' }}>Description</label>
                        <textarea
                          value={dish.description}
                          onChange={(e) => updateDish(sectionIndex, dishIndex, { ...dish, description: e.target.value })}
                          rows={2}
                          className="input-field w-full"
                        />
                      </div>

                      {/* Dietary Tags */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" 
                               style={{ color: 'var(--wtm-text)' }}>Dietary Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {dish.dietaryTags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="chip chip--veg flex items-center"
                            >
                              {tag}
                              <button
                                onClick={() => removeDietaryTag(sectionIndex, dishIndex, tag)}
                                className="ml-1 hover:opacity-80"
                                style={{ color: 'var(--chip-veg-fg)' }}
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
                            className="input-field flex-1 text-sm"
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
                        <label className="block text-sm font-medium mb-2" 
                               style={{ color: 'var(--wtm-text)' }}>Allergens</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {dish.allergens.map((allergen, allergenIndex) => (
                            <span
                              key={allergenIndex}
                              className="chip chip--gluten flex items-center"
                            >
                              {allergen}
                              <button
                                onClick={() => removeAllergen(sectionIndex, dishIndex, allergen)}
                                className="ml-1 hover:opacity-80"
                                style={{ color: 'var(--chip-gluten-fg)' }}
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
                            className="input-field flex-1 text-sm"
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
                    <div className="text-center py-8" style={{ color: 'var(--wtm-muted)' }}>
                      No dishes in this section. Click "Add Dish" to get started.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Save Button */}
            <div className="card p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--wtm-text)' }}>
                    Ready to save your menu?
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>
                    This will create a new menu in your restaurant dashboard.
                  </p>
                </div>
                <button
                  onClick={saveMenu}
                  disabled={isSaving}
                  className={`btn flex items-center px-8 py-3 text-lg ${
                    isSaving ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'
                  }`}
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
          <div className="card p-8 text-center">
            <div className="max-w-md mx-auto">
              <FileImage className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--wtm-muted)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--wtm-text)' }}>
                No menu uploaded yet
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
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