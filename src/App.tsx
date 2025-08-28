// src/App.tsx - Complete routing with onboarding wizard
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';

// Import pages
import RestaurantLandingPage from './pages/RestaurantLandingPage';
import RestaurantSignup from './pages/RestaurantSignup'; 
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

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, restaurant, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but no restaurant profile, redirect to onboarding
  if (!restaurant) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Onboarding route wrapper - only accessible if user exists but no restaurant profile
const OnboardingRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, restaurant, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If restaurant profile already exists, redirect to dashboard
  if (restaurant) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout wrapper for pages that need header
interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      <main>{children}</main>
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
          <Route path="/signup" element={<Layout showHeader={false}><RestaurantOnboardingWizard /></Layout>} />
          <Route path="/login" element={<Layout showHeader={false}><RestaurantLoginPage /></Layout>} />
          
          {/* Onboarding route - only accessible if user exists but no restaurant profile */}
          <Route path="/onboarding" element={
            <OnboardingRoute>
              <Layout showHeader={false}>
                <RestaurantOnboardingWizard />
              </Layout>
            </OnboardingRoute>
          } />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/qr-codes" element={
            <ProtectedRoute>
              <QRCodesPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/menu-editor" element={
            <ProtectedRoute>
              <MenuEditorPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/billing" element={
            <ProtectedRoute>
              <BillingPage />
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