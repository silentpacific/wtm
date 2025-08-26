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
      iconBg: '#EAF2FF',
      iconColor: '#1A3E73'
    },
    {
      title: 'Download QR Codes',
      description: 'Get print-ready QR codes for tables',
      href: '/dashboard/qr-codes',
      icon: QrCode,
      iconBg: '#EAF8E6',
      iconColor: '#235A1E'
    },
    {
      title: 'View Live Menu',
      description: 'See what customers see',
      href: `/demos/sample-menu-1`, // This would be dynamic: `/r/${restaurant?.slug}`
      icon: Eye,
      iconBg: '#FCEDEA',
      iconColor: '#7A2E21'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--wtm-text)' }}>
            Welcome back, {restaurant?.owner_name || 'Restaurant Owner'}!
          </h1>
          <p style={{ color: 'var(--wtm-muted)' }}>
            Here's what's happening with {restaurant?.name || 'your restaurant'} today.
          </p>
        </div>

        {/* Status alerts */}
        <div className="mb-6 space-y-3">
          {/* Setup complete alert */}
          <div className="card p-4 flex items-center" 
               style={{ 
                 backgroundColor: 'var(--chip-veg-bg)', 
                 border: `1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--chip-veg-fg')}20`
               }}>
            <CheckCircle className="mr-3" size={20} style={{ color: 'var(--chip-veg-fg)' }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--chip-veg-fg)' }}>
                Your restaurant is live!
              </p>
              <p className="text-sm" style={{ color: 'var(--chip-veg-fg)' }}>
                Customers can now scan your QR codes to access accessible menus.
              </p>
            </div>
            <Link 
              to="/dashboard/qr-codes" 
              className="btn-ghost text-sm font-medium"
              style={{ color: 'var(--chip-veg-fg)' }}
            >
              Get QR Codes →
            </Link>
          </div>

          {/* Demo alert - would be conditional based on real setup status */}
          <div className="card p-4 flex items-center" 
               style={{ 
                 backgroundColor: 'var(--chip-nuts-bg)', 
                 border: `1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--chip-nuts-fg')}20`
               }}>
            <AlertTriangle className="mr-3" size={20} style={{ color: 'var(--chip-nuts-fg)' }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--chip-nuts-fg)' }}>
                Complete your menu setup
              </p>
              <p className="text-sm" style={{ color: 'var(--chip-nuts-fg)' }}>
                Upload your actual menu to replace the demo content.
              </p>
            </div>
            <Link 
              to="/dashboard/menu-editor" 
              className="btn-ghost text-sm font-medium"
              style={{ color: 'var(--chip-nuts-fg)' }}
            >
              Upload Menu →
            </Link>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#EAF2FF' }}>
                <Eye size={20} style={{ color: '#1A3E73' }} />
              </div>
              <div className="ml-4">
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>Total Views</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                  {stats.totalViews}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#EAF8E6' }}>
                <TrendingUp size={20} style={{ color: '#235A1E' }} />
              </div>
              <div className="ml-4">
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>Today's Views</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                  {stats.todayViews}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E9F6F3' }}>
                <QrCode size={20} style={{ color: '#1A5A50' }} />
              </div>
              <div className="ml-4">
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>QR Scans</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                  {stats.qrScans}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCEDEA' }}>
                <Users size={20} style={{ color: 'var(--wtm-primary)' }} />
              </div>
              <div className="ml-4">
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>Active Today</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                  {stats.activeToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--wtm-text)' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isExternal = action.href.startsWith('/demos') || action.href.startsWith('/r/');
              
              return (
                <Link
                  key={index}
                  to={action.href}
                  target={isExternal ? '_blank' : undefined}
                  className="card p-6 block transition-all duration-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-lg" 
                         style={{ backgroundColor: action.iconBg }}>
                      <Icon size={20} style={{ color: action.iconColor }} />
                    </div>
                    {isExternal && (
                      <ExternalLink className="ml-auto" size={16} 
                                  style={{ color: 'var(--wtm-muted)' }} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2" 
                      style={{ color: 'var(--wtm-text)' }}>
                    {action.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>
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