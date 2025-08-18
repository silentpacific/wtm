import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
          <p className="text-gray-600 mt-1">Add, edit, and organize your menu items</p>
        </div>
        
        <button
          onClick={() => setIsAddingItem(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Dish
        </button>
      </div>

      {/* Add New Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  Dish Name
                </label>
                <input
                  type="text"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter dish name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the dish"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select
                    value={newItem.section || 'Appetizers'}
                    onChange={(e) => setNewItem({...newItem, section: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergens
                </label>
                <div className="flex flex-wrap gap-2">
                  {allergenOptions.map(allergen => (
                    <label key={allergen} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newItem.allergens?.includes(allergen) || false}
                        onChange={(e) => {
                          const allergens = newItem.allergens || [];
                          if (e.target.checked) {
                            setNewItem({...newItem, allergens: [...allergens, allergen]});
                          } else {
                            setNewItem({...newItem, allergens: allergens.filter(a => a !== allergen)});
                          }
                        }}
                        className="mr-1"
                      />
                      <span className="text-sm">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(tag => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newItem.dietary_tags?.includes(tag) || false}
                        onChange={(e) => {
                          const tags = newItem.dietary_tags || [];
                          if (e.target.checked) {
                            setNewItem({...newItem, dietary_tags: [...tags, tag]});
                          } else {
                            setNewItem({...newItem, dietary_tags: tags.filter(t => t !== tag)});
                          }
                        }}
                        className="mr-1"
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsAddingItem(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Dish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items by Section */}
      <div className="space-y-8">
        {sections.map(section => (
          <div key={section} className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{section}</h2>
            </div>
            
            <div className="p-6">
              {groupedItems[section]?.length > 0 ? (
                <div className="space-y-4">
                  {groupedItems[section].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            
                            <div className="flex gap-2 mt-2">
                              {item.allergens.map(allergen => (
                                <span
                                  key={allergen}
                                  className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                >
                                  {allergen}
                                </span>
                              ))}
                              
                              {item.dietary_tags.map(tag => (
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
                            <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
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
                  <button
                    onClick={() => setIsAddingItem(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Add your first dish
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Menu Management Tips</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Use clear, descriptive names for your dishes</li>
          <li>• Include important allergen information for customer safety</li>
          <li>• Add dietary tags to help customers filter options</li>
          <li>• Keep descriptions concise but informative</li>
          <li>• Update prices regularly to reflect current costs</li>
        </ul>
      </div>
    </div>
  );
}