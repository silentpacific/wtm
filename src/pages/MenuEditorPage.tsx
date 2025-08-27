// src/pages/MenuEditorPage.tsx - Enhanced with all requested features
import React, { useState, useEffect } from 'react';
import { 
  Upload, FileImage, FileText, Loader, AlertCircle, CheckCircle, 
  Edit, Trash2, Plus, Save, Sparkles, Eye, ExternalLink, 
  DollarSign, Clock, Users
} from 'lucide-react';
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
  id?: string;
  name: string;
  description: string;
  price: number | null;
  allergens: string[];
  dietary_tags: string[];
  dietaryTags?: string[]; // For backward compatibility
}

interface MenuSection {
  name: string;
  dishes: Dish[];
}

interface MenuData {
  menuId?: string;
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
  const [isDietaryAnalyzing, setIsDietaryAnalyzing] = useState(false);
  const [isDietaryAnalysisComplete, setIsDietaryAnalysisComplete] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);

  // Load existing menu data on component mount
  useEffect(() => {
    loadExistingMenu();
    loadRestaurantInfo();
  }, [user]);

  const loadRestaurantInfo = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('user_restaurant_profiles')
        .select('restaurant_name')
        .eq('id', user.id)
        .single();
      
      if (profile?.restaurant_name) {
        const slug = profile.restaurant_name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        setRestaurantSlug(slug);
      }
    } catch (error) {
      console.error('Error loading restaurant info:', error);
    }
  };

  const loadExistingMenu = async () => {
    if (!user) return;

    try {
      const { data: menus, error } = await supabase
        .from('menus')
        .select(`
          id,
          name,
          status,
          menu_sections (
            id,
            name,
            display_order,
            menu_items (
              id,
              name,
              description,
              price,
              allergens,
              dietary_tags,
              display_order
            )
          )
        `)
        .eq('restaurant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (menus && menus.length > 0) {
        const menu = menus[0];
        setCurrentMenuId(menu.id);
        
        setIsDietaryAnalysisComplete(menu.status === 'active');

        const sections = (menu.menu_sections || [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((section: any) => ({
            name: section.name,
            dishes: (section.menu_items || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((item: any) => ({
                id: item.id,
                name: item.name || '',
                description: item.description || '',
                price: item.price,
                allergens: item.allergens || [],
                dietary_tags: item.dietary_tags || []
              }))
          }));

        setMenuData({
          menuId: menu.id,
          restaurant: {},
          sections
        });

        setScanStats({
          sections: sections.length,
          totalDishes: sections.reduce((total: number, section: any) => total + section.dishes.length, 0),
          processingTime: 0
        });
      }
    } catch (error) {
      console.error('Error loading existing menu:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!supportedTypes.includes(selectedFile.type)) {
        setScanError('Please upload a JPG, PNG, or PDF file.');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setScanError('File size must be less than 10MB.');
        return;
      }

      setFile(selectedFile);
      setScanError(null);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const scanMenu = async () => {
    if (!file || !user) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const base64Data = await convertFileToBase64(file);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/.netlify/functions/menu-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          mimeType: file.type,
          existingMenuId: currentMenuId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (menuData && menuData.sections) {
        const mergedSections = [...menuData.sections];
        
        for (const newSection of result.data.sections) {
          const existingSectionIndex = mergedSections.findIndex(
            s => s.name.toLowerCase() === newSection.name.toLowerCase()
          );
          
          if (existingSectionIndex >= 0) {
            const existingDishes = mergedSections[existingSectionIndex].dishes;
            for (const newDish of newSection.dishes) {
              const isDuplicate = existingDishes.some(
                d => d.name.toLowerCase().trim() === newDish.name.toLowerCase().trim()
              );
              if (!isDuplicate) {
                existingDishes.push({
                  ...newDish,
                  allergens: newDish.allergens || [],
                  dietary_tags: newDish.dietary_tags || []
                });
              }
            }
          } else {
            mergedSections.push({
              name: newSection.name,
              dishes: newSection.dishes.map((dish: any) => ({
                ...dish,
                allergens: dish.allergens || [],
                dietary_tags: dish.dietary_tags || []
              }))
            });
          }
        }
        
        setMenuData({
          ...menuData,
          sections: mergedSections
        });
      } else {
        setMenuData({
          menuId: result.menuId,
          restaurant: result.data.restaurant || {},
          sections: result.data.sections.map((section: any) => ({
            ...section,
            dishes: section.dishes.map((dish: any) => ({
              ...dish,
              allergens: dish.allergens || [],
              dietary_tags: dish.dietary_tags || []
            }))
          }))
        });
        setCurrentMenuId(result.menuId);
      }
      
      setScanStats(result.stats);
      
    } catch (error) {
      console.error('Menu scan error:', error);
      setScanError(error instanceof Error ? error.message : 'Failed to scan menu');
    } finally {
      setIsScanning(false);
    }
  };

  const runDietaryAnalysis = async () => {
    if (!currentMenuId) return;
    
    setIsDietaryAnalyzing(true);
    try {
      const response = await fetch('/.netlify/functions/dietary-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          menuId: currentMenuId 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsDietaryAnalysisComplete(true);
        await loadExistingMenu();
        console.log('Dietary analysis completed:', result);
      } else {
        throw new Error(result.error || 'Dietary analysis failed');
      }
    } catch (error) {
      console.error('Dietary analysis error:', error);
      setScanError('Failed to analyze dietary information. Please try again.');
    } finally {
      setIsDietaryAnalyzing(false);
    }
  };

  const saveMenu = async () => {
    if (!menuData || !user) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/.netlify/functions/save-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          menuId: currentMenuId,
          menuData: menuData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save menu');
      }

      setSaveMessage('Menu saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (error) {
      console.error('Save menu error:', error);
      setSaveMessage('Failed to save menu. Please try again.');
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
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
      price: null,
      allergens: [],
      dietary_tags: []
    };

    const newMenuData = { ...menuData };
    newMenuData.sections[sectionIndex].dishes.push(newDish);
    setMenuData(newMenuData);
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
      dietary_tags: dish.dietary_tags.filter(t => t !== tag)
    });
  };

  const addDietaryTag = (sectionIndex: number, dishIndex: number, tag: string) => {
    if (!menuData || !tag.trim()) return;
    const dish = menuData.sections[sectionIndex].dishes[dishIndex];
    if (!dish.dietary_tags.includes(tag)) {
      updateDish(sectionIndex, dishIndex, {
        ...dish,
        dietary_tags: [...dish.dietary_tags, tag]
      });
    }
  };

  const getDishesWithoutPrices = () => {
    if (!menuData) return [];
    const dishesWithoutPrices: Array<{section: string, dish: string}> = [];
    
    menuData.sections.forEach(section => {
      section.dishes.forEach(dish => {
        if (!dish.price || dish.price <= 0) {
          dishesWithoutPrices.push({
            section: section.name,
            dish: dish.name
          });
        }
      });
    });
    
    return dishesWithoutPrices;
  };

  const dishesWithoutPrices = getDishesWithoutPrices();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Floating Save Button */}
        {menuData && (
          <div className="fixed top-20 right-6 z-40">
            <div className="flex flex-col gap-3">
              <button
                onClick={saveMenu}
                disabled={isSaving}
                className={`btn flex items-center shadow-lg ${
                  isSaving ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Menu
                  </>
                )}
              </button>
              
              {/* View Live Menu Button */}
              {restaurantSlug && isDietaryAnalysisComplete && (
                <a
                  href={`/r/${restaurantSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary flex items-center shadow-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Live
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Save Message */}
        {saveMessage && (
          <div className={`fixed top-32 right-6 z-50 p-3 rounded-lg shadow-lg ${
            saveMessage.includes('success') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {saveMessage.includes('success') ? (
              <CheckCircle className="w-4 h-4 inline mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 inline mr-2" />
            )}
            {saveMessage}
          </div>
        )}

        <div className="card p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--wtm-text)' }}>
            Menu Scanner & Editor
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
                    {menuData ? ' • Additional images will be merged with existing menu' : ''}
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
                    menuData ? 'Add to Menu' : 'Scan Menu'
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
          </div>

          {/* Menu Stats & Missing Prices Alert */}
          {scanStats && (
            <div className="space-y-4 mb-6">
              {/* Menu Overview */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--chip-veg-bg)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--chip-veg-fg)' }}>
                  Menu Overview
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
                      {isDietaryAnalysisComplete ? 'Complete' : 'Pending'}
                    </p>
                    <p style={{ color: 'var(--chip-veg-fg)' }}>Analysis</p>
                  </div>
                </div>
              </div>

              {/* Missing Prices Alert */}
              {dishesWithoutPrices.length > 0 && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <h3 className="font-semibold mb-2 text-red-800 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Missing Prices ({dishesWithoutPrices.length} items)
                  </h3>
                  <p className="text-red-700 text-sm mb-3">
                    The following dishes need prices to be complete:
                  </p>
                  <div className="space-y-1">
                    {dishesWithoutPrices.slice(0, 5).map((item, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <strong>{item.section}:</strong> {item.dish || 'Unnamed dish'}
                      </div>
                    ))}
                    {dishesWithoutPrices.length > 5 && (
                      <div className="text-sm text-red-700">
                        ...and {dishesWithoutPrices.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dietary Analysis Button */}
        {menuData && !isDietaryAnalysisComplete && (
          <div className="card p-6 mb-6 bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Populate Allergen and Dietary Tags
                </h3>
                <p className="text-blue-700">
                  Your menu has been extracted successfully. Click below to automatically 
                  analyze all dishes for allergens and dietary tags (vegetarian, gluten-free, etc.).
                </p>
              </div>
              <button
                onClick={runDietaryAnalysis}
                disabled={isDietaryAnalyzing}
                className={`btn px-6 py-3 flex items-center ${
                  isDietaryAnalyzing ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'
                }`}
              >
                {isDietaryAnalyzing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add Dietary Tags
                  </>
                )}
              </button>
            </div>
          </div>
        )}

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
                  {Object.entries(menuData.restaurant).map(([key, value]) => 
                    value && (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1 capitalize" 
                               style={{ color: 'var(--wtm-text)' }}>{key}</label>
                        <p style={{ color: 'var(--wtm-text)' }}>{value}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Menu Sections - Improved Layout */}
            {menuData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="card p-6">
                <div className="flex items-center justify-between mb-6">
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

                {/* Improved Dish Layout */}
                <div className="grid gap-4">
                  {section.dishes.map((dish, dishIndex) => (
                    <div 
                      key={dishIndex} 
                      className={`p-4 rounded-lg border-2 ${
                        !dish.price || dish.price <= 0 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Dish Header */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium mb-1" 
                                 style={{ color: 'var(--wtm-text)' }}>
                            Dish Name *
                          </label>
                          <input
                            type="text"
                            value={dish.name || ''}
                            onChange={(e) => updateDish(sectionIndex, dishIndex, { ...dish, name: e.target.value })}
                            className="input-field w-full"
                            placeholder="Enter dish name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" 
                                 style={{ color: 'var(--wtm-text)' }}>
                            Price ($) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={dish.price || ''}
                            onChange={(e) => updateDish(sectionIndex, dishIndex, { 
                              ...dish, 
                              price: parseFloat(e.target.value) || null 
                            })}
                            className={`input-field w-full ${
                              !dish.price || dish.price <= 0 ? 'border-red-300' : ''
                            }`}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            onClick={() => deleteDish(sectionIndex, dishIndex)}
                            className="btn-danger-ghost flex items-center w-full justify-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" 
                               style={{ color: 'var(--wtm-text)' }}>
                          Description
                        </label>
                        <textarea
                          value={dish.description || ''}
                          onChange={(e) => updateDish(sectionIndex, dishIndex, { 
                            ...dish, 
                            description: e.target.value 
                          })}
                          rows={2}
                          className="input-field w-full"
                          placeholder="Describe this dish..."
                        />
                      </div>

                      {/* Tags Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Dietary Tags */}
                        <div>
                          <label className="block text-sm font-medium mb-2" 
                                 style={{ color: 'var(--wtm-text)' }}>
                            Dietary Tags
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(dish.dietary_tags || dish.dietaryTags || []).map((tag, tagIndex) => (
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
                          <input
                            type="text"
                            placeholder="Add dietary tag (e.g., Vegetarian, Gluten-Free)"
                            className="input-field w-full text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addDietaryTag(sectionIndex, dishIndex, e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>

                        {/* Allergens */}
                        <div>
                          <label className="block text-sm font-medium mb-2" 
                                 style={{ color: 'var(--wtm-text)' }}>
                            Allergens
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(dish.allergens || []).map((allergen, allergenIndex) => (
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
                          <input
                            type="text"
                            placeholder="Add allergen (e.g., Nuts, Dairy, Shellfish)"
                            className="input-field w-full text-sm"
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
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--wtm-muted)' }} />
                      <p style={{ color: 'var(--wtm-muted)' }}>
                        No dishes in this section yet
                      </p>
                      <p className="text-sm mt-2" style={{ color: 'var(--wtm-muted)' }}>
                        Click "Add Dish" above to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!menuData && !isScanning && !scanError && (
          <div className="card p-8 text-center">
            <div className="max-w-md mx-auto">
              <FileImage className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--wtm-muted)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--wtm-text)' }}>
                Ready to create your digital menu?
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
                Upload a menu image or PDF to get started. Our AI will automatically extract all the dishes, 
                descriptions, and prices. You can then add dietary information with one click.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Quick Setup Process</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>1. Upload your menu → 2. Scan automatically → 3. Add tags → 4. Go live!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenuEditorPage;