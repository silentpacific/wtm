import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, AlertCircle, Loader2, MapPin, Clock, Phone } from 'lucide-react';
import { getRestaurantBySlug, QRAccessMenu } from '../services/restaurantQRService';

const RestaurantQRPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<QRAccessMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!slug) {
        setError('No restaurant specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const restaurantData = await getRestaurantBySlug(slug);
        
        if (!restaurantData) {
          setError('Restaurant not found or AccessMenu not available');
          return;
        }
        
        setRestaurant(restaurantData);
      } catch (err) {
        setError('Failed to load restaurant data');
        console.error('Error fetching restaurant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [slug]);

  const getTranslatedContent = (content: Record<string, string> | undefined, fallback: string = ''): string => {
    if (!content) return fallback;
    return content[language] || content.en || Object.values(content)[0] || fallback;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-blue-600" size={48} />
          <p className="text-gray-600">Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            {error}
          </h1>
          <p className="text-gray-600 mb-4">
            Please check the QR code or contact the restaurant for assistance.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {restaurant.restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  {restaurant.restaurant.city} • {restaurant.restaurant.cuisine_type}
                </div>
                {restaurant.restaurant.hours && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {restaurant.restaurant.hours}
                  </div>
                )}
                {restaurant.restaurant.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={16} />
                    {restaurant.restaurant.phone}
                  </div>
                )}
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* AccessMenu Interface */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <QrCode className="text-blue-600 mt-1" size={20} />
            <div>
              <h2 className="font-semibold text-blue-800 mb-1">
                Welcome to AccessMenu
              </h2>
              <p className="text-blue-700 text-sm">
                Browse our menu in your language. Tap any dish for detailed information including ingredients and allergens. 
                Show your selections to our staff when ready to order.
              </p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-8">
          {restaurant.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {section.name}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {getTranslatedContent(item.dish_name)}
                        </h3>
                        <span className="text-lg font-bold text-blue-600 ml-4">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {getTranslatedContent(item.description)}
                      </p>
                      
                      {/* Allergens and Dietary Info */}
                      <div className="flex flex-wrap gap-2">
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.map((allergen, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                              >
                                Contains: {allergen}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {item.dietary_tags && item.dietary_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.dietary_tags.map((diet, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {diet}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            How to Order
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            <li>Browse the menu above in your preferred language</li>
            <li>Note down the dishes you'd like to order</li>
            <li>Show this screen to our staff when ready</li>
            <li>Our team will help complete your order</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RestaurantQRPage;