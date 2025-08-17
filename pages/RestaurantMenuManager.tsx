import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import RestaurantLayout from '../components/RestaurantLayout';

export default function RestaurantMenuManager() {
  const [dishes, setDishes] = useState([]);
  const [editingDish, setEditingDish] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({
    dish_name: '',
    section_name: '',
    price: '',
    currency: 'GBP',
    description_en: '',
    allergens: [],
    dietary_tags: []
  });

  const sections = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'];
  const allergenOptions = ['gluten', 'dairy', 'eggs', 'nuts', 'fish', 'shellfish', 'soy'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb'];

  return (
    <RestaurantLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
            <p className="text-gray-600">Add, edit, and organize your menu items</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Dish
          </button>
        </div>

        {/* Add Dish Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Dish</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  value={newDish.dish_name}
                  onChange={(e) => setNewDish({...newDish, dish_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Fish & Chips"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  value={newDish.section_name}
                  onChange={(e) => setNewDish({...newDish, section_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select section</option>
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="flex">
                  <select
                    value={newDish.currency}
                    onChange={(e) => setNewDish({...newDish, currency: e.target.value})}
                    className="p-2 border border-gray-300 rounded-l-lg"
                  >
                    <option value="GBP">£</option>
                    <option value="EUR">€</option>
                    <option value="USD">$</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={newDish.price}
                    onChange={(e) => setNewDish({...newDish, price: e.target.value})}
                    className="flex-1 p-2 border border-gray-300 rounded-r-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newDish.description_en}
                onChange={(e) => setNewDish({...newDish, description_en: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg h-20"
                placeholder="Describe the dish..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
                <div className="space-y-2">
                  {allergenOptions.map(allergen => (
                    <label key={allergen} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newDish.allergens.includes(allergen)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDish({...newDish, allergens: [...newDish.allergens, allergen]});
                          } else {
                            setNewDish({...newDish, allergens: newDish.allergens.filter(a => a !== allergen)});
                          }
                        }}
                        className="mr-2"
                      />
                      {allergen}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
                <div className="space-y-2">
                  {dietaryOptions.map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newDish.dietary_tags.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDish({...newDish, dietary_tags: [...newDish.dietary_tags, option]});
                          } else {
                            setNewDish({...newDish, dietary_tags: newDish.dietary_tags.filter(t => t !== option)});
                          }
                        }}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Save dish logic here
                  setShowAddForm(false);
                  setNewDish({
                    dish_name: '', section_name: '', price: '', currency: 'GBP',
                    description_en: '', allergens: [], dietary_tags: []
                  });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Dish
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Menu Sections */}
        {sections.map(section => (
          <div key={section} className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{section}</h2>
            <div className="space-y-3">
              {/* Sample dishes - replace with real data */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">Sample Dish</h3>
                  <p className="text-sm text-gray-600">Sample description</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">gluten</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">vegetarian</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">£12.99</div>
                  <div className="flex gap-2 mt-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </RestaurantLayout>
  );
}