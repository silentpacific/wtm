import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Menu, User, CreditCard, BarChart3, Plus } from 'lucide-react';
import RestaurantLayout from '../components/RestaurantLayout';

export default function RestaurantDashboard() {
  const [restaurantData, setRestaurantData] = useState(null);
  const [stats, setStats] = useState({
    totalViews: 1247,
    thisWeek: 89,
    popularDishes: []
  });

  return (
    <RestaurantLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your Restaurant Dashboard</h1>
          <p className="text-gray-600">Manage your menu, QR codes, and view analytics</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Menu className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menu Items</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/restaurant/menu" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Menu className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Manage Menu</h3>
            <p className="text-sm text-gray-600">Edit dishes, prices, and descriptions</p>
          </Link>

          <Link to="/restaurant/qr-codes" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <QrCode className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">QR Codes</h3>
            <p className="text-sm text-gray-600">Download QR codes for tables</p>
          </Link>

          <Link to="/restaurant/profile" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <User className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Restaurant Profile</h3>
            <p className="text-sm text-gray-600">Update restaurant information</p>
          </Link>

          <Link to="/restaurant/billing" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CreditCard className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Billing</h3>
            <p className="text-sm text-gray-600">Manage subscription and billing</p>
          </Link>
        </div>
      </div>
    </RestaurantLayout>
  );
}