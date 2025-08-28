// src/App.tsx - Simplified for debugging routing issues
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';

// Import pages
import RestaurantLandingPage from './pages/RestaurantLandingPage';
import RestaurantSignupPage from './pages/RestaurantSignupPage';
import RestaurantLoginPage from './pages/RestaurantLoginPage';
import ConsumersPage from './pages/ConsumersPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import DemosPage from './pages/DemosPage';

// Dashboard pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import QRCodesPage from './pages/QRCodesPage';
import MenuEditorPage from './pages/MenuEditorPage';
import BillingPage from './pages/BillingPage';

// Sample menu pages
import SampleMenu1 from './pages/SampleMenu1';
import SampleMenu2 from './pages/SampleMenu2';
import SampleMenu3 from './pages/SampleMenu3';
import SampleMenu4 from './pages/SampleMenu4';
import PublicMenuPage from './pages/PublicMenuPage';

// Simple loading component
const LoadingPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected route wrapper - SIMPLIFIED
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useAuth();

  console.log('ProtectedRoute - user:', !!user, 'authLoading:', authLoading);

  if (authLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, showing protected content');
  return <>{children}</>;
};

// Layout wrapper
const Layout: React.FC<{ children: React.ReactNode; showHeader?: boolean }> = ({ 
  children, 
  showHeader = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      <main>{children}</main>
    </div>
  );
};

// Simple dashboard component for testing
const SimpleDashboard: React.FC = () => {
  const { user, restaurant } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <p className="mb-2"><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
          <p className="mb-2"><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p className="mb-2"><strong>Restaurant Name:</strong> {restaurant?.restaurant_name || 'No restaurant profile'}</p>
          <p className="mb-2"><strong>Restaurant ID:</strong> {restaurant?.id || 'N/A'}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/dashboard/menu-editor"
                className="block w-full bg-orange-500 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Menu Editor
              </a>
              <a
                href="/dashboard/profile"
                className="block w-full bg-blue-500 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Profile
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <p className="text-gray-600">
              {restaurant 
                ? 'Your restaurant profile is complete.' 
                : 'Complete your restaurant profile to get started.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><RestaurantLandingPage /></Layout>} />
          <Route path="/restaurants" element={<Layout><RestaurantLandingPage /></Layout>} />
          <Route path="/consumers" element={<Layout><ConsumersPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
          <Route path="/demos" element={<Layout><DemosPage /></Layout>} />

          {/* Auth routes */}
          <Route path="/signup" element={<Layout showHeader={false}><RestaurantSignupPage /></Layout>} />
          <Route path="/login" element={<Layout showHeader={false}><RestaurantLoginPage /></Layout>} />
          
          {/* SIMPLIFIED Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/profile" element={
            <ProtectedRoute>
              <Layout><ProfilePage /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/qr-codes" element={
            <ProtectedRoute>
              <Layout><QRCodesPage /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/menu-editor" element={
            <ProtectedRoute>
              <Layout><MenuEditorPage /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/billing" element={
            <ProtectedRoute>
              <Layout><BillingPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Public menu routes */}
          <Route path="/demos/sample-menu-1" element={<Layout><SampleMenu1 /></Layout>} />
          <Route path="/demos/sample-menu-2" element={<Layout><SampleMenu2 /></Layout>} />
          <Route path="/demos/sample-menu-3" element={<Layout><SampleMenu3 /></Layout>} />
          <Route path="/demos/sample-menu-4" element={<Layout><SampleMenu4 /></Layout>} />
          
          {/* Dynamic restaurant menu route */}
          <Route path="/r/:slug" element={<Layout><PublicMenuPage /></Layout>} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;