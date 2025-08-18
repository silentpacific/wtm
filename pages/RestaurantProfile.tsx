import React, { useState } from 'react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function RestaurantProfile() {
  const { restaurant, updateRestaurant } = useRestaurantAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [formData, setFormData] = useState({
    business_name: restaurant?.business_name || '',
    contact_email: restaurant?.contact_email || '',
    contact_phone: restaurant?.contact_phone || '',
    address: restaurant?.address || '',
    city: restaurant?.city || '',
    country: restaurant?.country || '',
    cuisine_type: restaurant?.cuisine_type || '',
    website: restaurant?.website || '',
    opening_hours: restaurant?.opening_hours || '',
    special_notes: restaurant?.special_notes || '',
    description_en: restaurant?.description_en || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const result = await updateRestaurant(formData);
      
      if (result.success) {
        setSaveMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setSaveMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      business_name: restaurant?.business_name || '',
      contact_email: restaurant?.contact_email || '',
      contact_phone: restaurant?.contact_phone || '',
      address: restaurant?.address || '',
      city: restaurant?.city || '',
      country: restaurant?.country || '',
      cuisine_type: restaurant?.cuisine_type || '',
      website: restaurant?.website || '',
      opening_hours: restaurant?.opening_hours || '',
      special_notes: restaurant?.special_notes || '',
      description_en: restaurant?.description_en || '',
    });
    setIsEditing(false);
    setSaveMessage('');
  };

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading restaurant profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant information and settings</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          saveMessage.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {saveMessage.includes('Error') ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          {saveMessage}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-sm">
        
        {/* Basic Information */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Restaurant Name - NOT EDITABLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                disabled={true}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Restaurant name cannot be changed to maintain QR code links
              </p>
            </div>

            {/* Public URL - NOT EDITABLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public URL
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  whatthemenu.com/restaurants/
                </span>
                <input
                  type="text"
                  value={restaurant.slug}
                  disabled={true}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                URL cannot be changed to maintain QR code functionality
              </p>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                }`}
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                }`}
                placeholder="+44 123 456 7890"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                }`}
                placeholder="https://your-restaurant.com"
              />
            </div>

            {/* Cuisine Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
              </label>
              <select
                value={formData.cuisine_type}
                onChange={(e) => handleInputChange('cuisine_type', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                }`}
              >
                <option value="">Select cuisine type</option>
                <option value="italian">Italian</option>
                <option value="chinese">Chinese</option>
                <option value="indian">Indian</option>
                <option value="french">French</option>
                <option value="mexican">Mexican</option>
                <option value="japanese">Japanese</option>
                <option value="thai">Thai</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="american">American</option>
                <option value="british">British</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                }`}
                placeholder="123 Main Street"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                }`}
                placeholder="London"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                }`}
                placeholder="United Kingdom"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          
          {/* Opening Hours */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Hours
            </label>
            <textarea
              value={formData.opening_hours}
              onChange={(e) => handleInputChange('opening_hours', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
              }`}
              placeholder="Mon-Fri: 9:00 AM - 10:00 PM&#10;Sat-Sun: 10:00 AM - 11:00 PM"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Description
            </label>
            <textarea
              value={formData.description_en}
              onChange={(e) => handleInputChange('description_en', e.target.value)}
              disabled={!isEditing}
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
              }`}
              placeholder="Describe your restaurant, atmosphere, and specialties..."
            />
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Notes
            </label>
            <textarea
              value={formData.special_notes}
              onChange={(e) => handleInputChange('special_notes', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
              }`}
              placeholder="Any special notes for customers (accessibility info, dietary accommodations, etc.)"
            />
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Current Status:</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
              restaurant.subscription_status === 'active' 
                ? 'bg-green-100 text-green-800'
                : restaurant.subscription_status === 'trial'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {restaurant.subscription_status === 'active' && '✓ Active Subscription'}
              {restaurant.subscription_status === 'trial' && '⏱️ Free Trial'}
              {restaurant.subscription_status === 'cancelled' && '⚠️ Cancelled'}
            </span>
            
            {restaurant.subscription_status === 'trial' && (
              <p className="text-sm text-gray-500 mt-1">
                Trial expires: {new Date(restaurant.trial_expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <a
            href="/restaurant/billing"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Billing
          </a>
        </div>
      </div>
    </div>
  );
}