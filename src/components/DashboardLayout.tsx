import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Edit,
  QrCode,
  User,
  CreditCard,
  LogOut,
  Building
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { signOut, restaurant } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Menu Editor',
      href: '/dashboard/menu-editor',
      icon: Edit,
      current: location.pathname === '/dashboard/menu-editor'
    },
    {
      name: 'QR Codes',
      href: '/dashboard/qr-codes',
      icon: QrCode,
      current: location.pathname === '/dashboard/qr-codes'
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      current: location.pathname === '/dashboard/profile'
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard,
      current: location.pathname === '/dashboard/billing'
    }
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--wtm-bg)' }}>
      {/* Sidebar */}
      <div className="w-64" style={{ backgroundColor: 'var(--wtm-surface)' }}>
        <div className="h-full flex flex-col" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          {/* Restaurant Info */}
          <div className="px-6 py-4 border-b" style={{ borderColor: '#EFE7E2' }}>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" 
                   style={{ backgroundColor: '#FCEDEA' }}>
                <Building className="w-5 h-5" style={{ color: 'var(--wtm-primary)' }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--wtm-text)' }}>
                  {restaurant?.name || 'Restaurant Name'}
                </h2>
                <p className="text-xs" style={{ color: 'var(--wtm-muted)' }}>
                  {restaurant?.cuisine_type || 'Cuisine Type'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        item.current
                          ? ''
                          : ''
                      }`}
                      style={{
                        backgroundColor: item.current ? '#FCEDEA' : 'transparent',
                        color: item.current ? 'var(--wtm-primary)' : 'var(--wtm-muted)',
                        borderRight: item.current ? '2px solid var(--wtm-primary)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!item.current) {
                          e.target.style.backgroundColor = 'var(--wtm-bg)';
                          e.target.style.color = 'var(--wtm-text)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!item.current) {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--wtm-muted)';
                        }
                      }}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign Out */}
          <div className="px-4 pb-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: '#B91C1C' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#FEF2F2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <main className="min-h-screen" style={{ backgroundColor: 'var(--wtm-bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;