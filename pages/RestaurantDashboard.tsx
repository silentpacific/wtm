import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Menu, User, CreditCard, BarChart3, Plus, TrendingUp, Eye } from 'lucide-react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';
import { restaurantAnalyticsService, RestaurantStats } from '../services/restaurantAnalyticsService';

export default function RestaurantDashboard() {
  const { restaurant } = useRestaurantAuth();
  const [stats, setStats] = useState<RestaurantStats>({
    totalViews: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalDishes: 0,
    popularDishes: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics data when component mounts
  useEffect(() => {
    if (restaurant?.id) {
      loadStats();
    }
  }, [restaurant?.id]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const analyticsData = await restaurantAnalyticsService.getRestaurantStats(restaurant!.id);
      setStats(analyticsData);
    } catch (error) {
      console.error('Error loading restaurant stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {restaurant?.business_name || 'Restaurant Owner'}!
        </h1>
        <p className="text-gray-600">Manage your menu, QR codes, and view analytics</p>
        
        {restaurant?.subscription_status === 'trial' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Free Trial Active
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Your 30-day free trial is active. No payment required yet!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : stats.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : stats.thisWeek.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : stats.thisMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Menu className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : stats.totalDishes.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
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

      {/* Popular Dishes Section */}
      {stats.popularDishes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Dishes</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {stats.popularDishes.slice(0, 5).map((dish, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{dish.name}</p>
                    <p className="text-sm text-gray-500">{dish.section}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{dish.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Info Summary */}
      {restaurant && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Restaurant Name</h3>
              <p className="text-gray-900">{restaurant.business_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Public URL</h3>
              <a 
                href={`/restaurants/${restaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                whatthemenu.com/restaurants/{restaurant.slug}
              </a>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Email</h3>
              <p className="text-gray-900">{restaurant.contact_email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Subscription Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                restaurant.subscription_status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : restaurant.subscription_status === 'trial'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {restaurant.subscription_status === 'active' && '✓ Active'}
                {restaurant.subscription_status === 'trial' && '⏱️ Trial'}
                {restaurant.subscription_status === 'cancelled' && '⚠️ Cancelled'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}