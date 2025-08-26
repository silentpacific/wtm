// src/pages/DashboardPage.tsx - Restaurant Dashboard Overview
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  QrCode, 
  Eye, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const DashboardPage: React.FC = () => {
  const { restaurant } = useAuth();

  // Real stats from database - all zeros for now
  const stats = {
    totalViews: 0,
    todayViews: 0,
    qrScans: 0,
    activeToday: 0
  };

  const quickActions = [
    {
      title: 'Edit Menu',
      description: 'Update dishes, prices, and descriptions',
      href: '/dashboard/menu-editor',
      icon: Edit3,
      color: 'bg-blue-500'
    },
    {
      title: 'Download QR Codes',
      description: 'Get print-ready QR codes for tables',
      href: '/dashboard/qr-codes',
      icon: QrCode,
      color: 'bg-green-500'
    },
    {
      title: 'View Live Menu',
      description: 'See what customers see',
      href: `/demos/sample-menu-1`, // This would be dynamic: `/r/${restaurant?.slug}`
      icon: Eye,
      color: 'bg-purple-500'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {restaurant?.owner_name || 'Restaurant Owner'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with {restaurant?.name || 'your restaurant'} today.
          </p>
        </div>

        {/* Status alerts */}
        <div className="mb-6 space-y-3">
          {/* Setup complete alert */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="text-green-500 mr-3" size={20} />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Your restaurant is live!</p>
              <p className="text-green-700 text-sm">
                Customers can now scan your QR codes to access accessible menus.
              </p>
            </div>
            <Link 
              to="/dashboard/qr-codes" 
              className="text-green-700 hover:text-green-800 font-medium text-sm"
            >
              Get QR Codes →
            </Link>
          </div>

          {/* Demo alert - would be conditional based on real setup status */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center">
            <AlertTriangle className="text-amber-500 mr-3" size={20} />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">Complete your menu setup</p>
              <p className="text-amber-700 text-sm">
                Upload your actual menu to replace the demo content.
              </p>
            </div>
            <Link 
              to="/dashboard/menu-editor" 
              className="text-amber-700 hover:text-amber-800 font-medium text-sm"
            >
              Upload Menu →
            </Link>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="text-blue-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <QrCode className="text-purple-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">QR Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.qrScans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-coral-100 rounded-lg">
                <Users className="text-coral-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isExternal = action.href.startsWith('/demos') || action.href.startsWith('/r/');
              
              return (
                <Link
                  key={index}
                  to={action.href}
                  target={isExternal ? '_blank' : undefined}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 ${action.color} rounded-lg`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    {isExternal && (
                      <ExternalLink className="text-gray-400 ml-auto" size={16} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;