import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Menu, User, CreditCard, BarChart3, Plus, TrendingUp, Eye, Brain, CheckCircle, Clock, Zap } from 'lucide-react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';
import { supabase } from '../services/supabaseClient';

interface RestaurantStats {
  totalViews: number;
  thisWeek: number;
  thisMonth: number;
  totalDishes: number;
}

interface AIProcessingStatus {
  isProcessing: boolean;
  completed: number;
  total: number;
  currentTask: string;
  timeRemaining: string;
}

// AI Processing Indicator Component
function AIProcessingIndicator({ restaurant }: { restaurant: any }) {
  const [processingStatus, setProcessingStatus] = useState<AIProcessingStatus>({
    isProcessing: false,
    completed: 0,
    total: 0,
    currentTask: '',
    timeRemaining: ''
  });

  useEffect(() => {
    if (restaurant?.id) {
      checkProcessingStatus();
      
      // Check status every 30 seconds while processing
      const interval = setInterval(() => {
        if (processingStatus.isProcessing) {
          checkProcessingStatus();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [restaurant?.id, processingStatus.isProcessing]);

  const checkProcessingStatus = async () => {
    try {
      // Check restaurant special_notes for processing status
      const { data: restaurantData } = await supabase
        .from('restaurant_business_accounts')
        .select('special_notes')
        .eq('id', restaurant.id)
        .single();

      const notes = restaurantData?.special_notes || '';
      
      // Parse different status messages
      if (notes.includes('AI processing:') && !notes.includes('complete')) {
        // Active processing: "AI processing: 45/120 explanations complete"
        const match = notes.match(/AI processing: (\d+)\/(\d+) explanations complete/);
        if (match) {
          const completed = parseInt(match[1]);
          const total = parseInt(match[2]);
          const remaining = total - completed;
          const timeRemaining = formatTimeRemaining(remaining * 10); // 10 seconds per explanation
          
          setProcessingStatus({
            isProcessing: true,
            completed,
            total,
            currentTask: `Generating multilingual explanations...`,
            timeRemaining
          });
        }
      } else if (notes.includes('AI processing complete')) {
        // Just completed: "AI processing complete: 120 explanations generated"
        const match = notes.match(/AI processing complete: (\d+) explanations generated/);
        if (match) {
          const total = parseInt(match[1]);
          setProcessingStatus({
            isProcessing: false,
            completed: total,
            total: total,
            currentTask: 'All explanations ready!',
            timeRemaining: ''
          });

          // Clear the completion message after 10 seconds
          setTimeout(() => {
            setProcessingStatus(prev => ({ ...prev, completed: 0, total: 0 }));
          }, 10000);
        }
      } else {
        // No processing
        setProcessingStatus({
          isProcessing: false,
          completed: 0,
          total: 0,
          currentTask: '',
          timeRemaining: ''
        });
      }
    } catch (error) {
      console.error('Error checking processing status:', error);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${seconds}s remaining`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)}m remaining`;
    return `${Math.ceil(seconds / 3600)}h remaining`;
  };

  // Don't render if no processing happening
  if (!processingStatus.isProcessing && processingStatus.completed === 0) {
    return null;
  }

  const progressPercentage = processingStatus.total > 0 
    ? (processingStatus.completed / processingStatus.total) * 100 
    : 0;

  return (
    <div className={`rounded-lg p-6 mb-6 border-2 ${
      processingStatus.isProcessing 
        ? 'bg-blue-50 border-blue-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-2 rounded-full ${
          processingStatus.isProcessing 
            ? 'bg-blue-100' 
            : 'bg-green-100'
        }`}>
          {processingStatus.isProcessing ? (
            <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
          ) : (
            <CheckCircle className="w-6 h-6 text-green-600" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${
              processingStatus.isProcessing 
                ? 'text-blue-900' 
                : 'text-green-900'
            }`}>
              {processingStatus.isProcessing ? (
                <>
                  <Zap className="inline w-4 h-4 mr-1" />
                  AI Processing Your Menu
                </>
              ) : (
                <>
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Menu Processing Complete!
                </>
              )}
            </h3>
            
            {processingStatus.timeRemaining && (
              <span className="flex items-center text-sm text-blue-600">
                <Clock className="w-3 h-3 mr-1" />
                {processingStatus.timeRemaining}
              </span>
            )}
          </div>

          <p className={`text-sm mb-3 ${
            processingStatus.isProcessing 
              ? 'text-blue-800' 
              : 'text-green-800'
          }`}>
            {processingStatus.isProcessing ? (
              <>
                Creating detailed explanations for all dishes in English, Spanish, Chinese, and French.
                Your customers will get instant multilingual dish information!
              </>
            ) : (
              <>
                🎉 All dish explanations are ready! Your customers can now get instant explanations 
                in 4 languages when they scan your QR codes.
              </>
            )}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className={processingStatus.isProcessing ? 'text-blue-700' : 'text-green-700'}>
                {processingStatus.currentTask}
              </span>
              <span className={`font-medium ${
                processingStatus.isProcessing ? 'text-blue-900' : 'text-green-900'
              }`}>
                {processingStatus.completed}/{processingStatus.total} explanations
              </span>
            </div>
            
            <div className={`w-full h-3 rounded-full ${
              processingStatus.isProcessing ? 'bg-blue-200' : 'bg-green-200'
            }`}>
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  processingStatus.isProcessing 
                    ? 'bg-blue-600' 
                    : 'bg-green-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-600 mt-2">
              {processingStatus.isProcessing ? (
                <>
                  <div className="flex items-center gap-4">
                    <span>✅ English explanations</span>
                    <span>✅ Spanish explanations</span>
                    <span>✅ Chinese explanations</span>
                    <span>✅ French explanations</span>
                  </div>
                  <p className="mt-1 italic">
                    Processing happens in the background. You can continue managing your menu while AI works.
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-green-600">🌍 4 languages ready</span>
                  <span className="text-green-600">⚡ Instant responses</span>
                  <span className="text-green-600">🎯 Zero wait time</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantDashboard() {
  console.log('🏪 RestaurantDashboard component is rendering!');
  const { restaurant } = useRestaurantAuth();
  const [stats, setStats] = useState<RestaurantStats>({
    totalViews: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalDishes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics data when component mounts
  useEffect(() => {
    if (restaurant?.id) {
      loadStats();
    }
  }, [restaurant?.id]);

  const loadStats = async () => {
    if (!restaurant?.id) return;
    
    try {
      setIsLoading(true);
      console.log('Loading stats for restaurant ID:', restaurant.id);
      
      // Get restaurant views from restaurants table
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('total_scans, dishes_explained, last_scanned_at')
        .eq('id', restaurant.id)
        .maybeSingle();

      if (restaurantError && restaurantError.code !== 'PGRST116') {
        console.error('Error fetching restaurant data:', restaurantError);
      }

      console.log('Restaurant data:', restaurantData);

      // Get total dishes count
      const { count: dishCount, error: dishError } = await supabase
        .from('restaurant_dishes')
        .select('id', { count: 'exact' })
        .eq('restaurant_id', restaurant.id)
        .eq('is_available', true);

      if (dishError) {
        console.error('Error fetching dish count:', dishError);
      }

      console.log('Dish count:', dishCount);

      // Calculate total views (scans + dish explanations)
      const totalScans = restaurantData?.total_scans || 0;
      const totalExplanations = restaurantData?.dishes_explained || 0;
      const totalViews = totalScans + totalExplanations;

      // Calculate time-based stats - more conservative estimates
      const estimatedWeeklyViews = Math.max(0, Math.floor(totalViews * 0.1)); // 10% in last week
      const estimatedMonthlyViews = Math.max(0, Math.floor(totalViews * 0.3)); // 30% in last month

      const newStats = {
        totalViews: totalViews,
        thisWeek: estimatedWeeklyViews,
        thisMonth: estimatedMonthlyViews,
        totalDishes: dishCount || 0
      };

      console.log('Setting stats:', newStats);
      setStats(newStats);

    } catch (error) {
      console.error('Error loading restaurant stats:', error);
      // Set zero stats on error
      setStats({
        totalViews: 0,
        thisWeek: 0,
        thisMonth: 0,
        totalDishes: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading restaurant information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {restaurant.business_name}!
        </h1>
        <p className="text-gray-600">Manage your menu, QR codes, and view analytics</p>
        
        {restaurant.subscription_status === 'trial' && (
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

      {/* AI Processing Indicator */}
      <AIProcessingIndicator restaurant={restaurant} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 rounded w-16 h-8"></div>
                ) : (
                  stats.totalViews
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Page visits + dish views</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 rounded w-12 h-8"></div>
                ) : (
                  stats.thisWeek
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Estimated recent activity</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 rounded w-14 h-8"></div>
                ) : (
                  stats.thisMonth
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Estimated monthly activity</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Menu className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 rounded w-8 h-8"></div>
                ) : (
                  stats.totalDishes
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Available dishes</p>
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

      {/* Restaurant Info Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
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

      {/* Getting Started Section (for new restaurants) */}
      {!isLoading && stats.totalDishes === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Get Started with Your Restaurant</h3>
          <p className="text-blue-800 text-sm mb-4">
            Welcome to WhatTheMenu! Here's how to get your restaurant set up:
          </p>
          <div className="space-y-2 text-blue-800 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Add your menu items in the Menu Manager</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Download QR codes for your tables</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Test your public restaurant page</span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/restaurant/menu"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Your First Menu Item
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}