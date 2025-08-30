// src/pages/MenuEditorPage.tsx - Enhanced with restaurant dropdown
import React, { useState, useEffect } from 'react';
import { 
  Upload, FileImage, FileText, Loader, AlertCircle, CheckCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface RestaurantProfile {
  id: string;
  auth_user_id: string;
  restaurant_name: string;
}

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

  // NEW: restaurant state
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRestaurants();
    }
  }, [user]);

  const loadRestaurants = async () => {
    const { data, error } = await supabase
	  .from("user_restaurant_profiles")
	  .select("id, restaurant_name");

    if (error) {
      console.error('Error loading restaurants:', error);
      return;
    }
    setRestaurants(data || []);
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
    if (!file) return;
    if (!selectedRestaurantId) {
      setScanError("Please select a restaurant first.");
      return;
    }

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
          restaurantId: selectedRestaurantId,   // ✅ send restaurant choice
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
      setScanStats(result.stats);

    } catch (error) {
      console.error('Menu scan error:', error);
      setScanError(error instanceof Error ? error.message : 'Failed to scan menu');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="card p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--wtm-text)' }}>
          Menu Scanner & Editor
        </h1>

        {/* Restaurant Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--wtm-text)' }}>
            Select Restaurant
          </label>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="input-field w-full"
          >
            <option value="">-- Choose a restaurant --</option>
            {restaurants.map(r => (
              <option key={r.id} value={r.auth_user_id}>
                {r.restaurant_name}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
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
                menuData ? 'Add to Menu' : 'Scan Menu'
              )}
            </button>
          </div>
        )}

        {scanError && (
          <div className="mt-4 p-4 rounded-lg flex items-start bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Scan Error</p>
              <p className="text-sm text-red-700">{scanError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rest of your editor UI (dietary analysis, dish editing, save) stays unchanged */}
    </div>
  );
};

export default MenuEditorPage;
