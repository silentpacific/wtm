// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import AuthCallbackPage from "./pages/AuthCallbackPage";

// Import pages
import RestaurantLandingPage from './pages/RestaurantLandingPage';
import RestaurantSignupPage from './pages/RestaurantSignupPage';
import RestaurantLoginPage from './pages/RestaurantLoginPage';
import ConsumersPage from './pages/ConsumersPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import DemosPage from './pages/DemosPage';

// Dashboard pages
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

// Dashboard layout
import DashboardLayout from './components/DashboardLayout';

// Dashboard component
const Dashboard: React.FC = () => {
  const { user, restaurant, authLoading } = useAuth();

  if (authLoading) return <div className="text-center py-12">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto py-12 px-6">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Setup</h1>
            <p className="text-gray-600 mb-6">
              It looks like your restaurant profile wasn't created during signup. 
              Please sign up again to complete your profile, or contact support if you need help.
            </p>
            <div className="space-y-3">
              <a href="/signup" className="block w-full bg-orange-500 text-white py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors">
                Complete Profile Setup
              </a>
              <a href="/contact" className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {restaurant.owner_name || 'Restaurant Owner'}!
        </h1>
        <p className="text-gray-600 mb-8">{restaurant.restaurant_name} Dashboard</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/dashboard/menu-editor" className="block w-full bg-orange-500 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                Menu Editor
              </a>
              <a href="/dashboard/qr-codes" className="block w-full bg-blue-500 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                QR Codes
              </a>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Restaurant Info</h3>
            <p><strong>Name:</strong> {restaurant.restaurant_name}</p>
            <p><strong>Cuisine:</strong> {restaurant.cuisine_type}</p>
            <p><strong>City:</strong> {restaurant.city}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <div className="text-center py-12">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// Layout wrapper
const Layout: React.FC<{ children: React.ReactNode; showHeader?: boolean }> = ({ children, showHeader = true }) => (
  <div className="min-h-screen bg-gray-50">
    {showHeader && <Header />}
    <main>{children}</main>
  </div>
);

// Redirector
const DashboardRedirector: React.FC = () => {
  const { restaurant, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!restaurant) {
      navigate("/dashboard/profile");
      return;
    }

    if (!restaurant.restaurant_name || !restaurant.city) {
      navigate("/dashboard/profile");
      return;
    }

    if (!restaurant.menu_uploaded) {
      navigate("/dashboard/menu-editor");
      return;
    }

    navigate("/dashboard/qr-codes");
  }, [restaurant, authLoading, navigate]);

  return null;
};

// App routes
const AppRoutes: React.FC = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <div className="text-center py-12">Loading...</div>;

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Layout><RestaurantLandingPage /></Layout>
        }
      />
      <Route path="/restaurants" element={<Layout><RestaurantLandingPage /></Layout>} />
      <Route path="/consumers" element={<Layout><ConsumersPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
      <Route path="/demos" element={<Layout><DemosPage /></Layout>} />

      {/* Auth routes */}
      <Route path="/signup" element={<Layout showHeader={false}><RestaurantSignupPage /></Layout>} />
      <Route path="/login" element={<Layout showHeader={false}><RestaurantLoginPage /></Layout>} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirector /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/qr-codes" element={<ProtectedRoute><DashboardLayout><QRCodesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/menu-editor" element={<ProtectedRoute><DashboardLayout><MenuEditorPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/billing" element={<ProtectedRoute><DashboardLayout><BillingPage /></DashboardLayout></ProtectedRoute>} />

      {/* Public menu routes */}
      <Route path="/demos/sample-menu-1" element={<Layout><SampleMenu1 /></Layout>} />
      <Route path="/demos/sample-menu-2" element={<Layout><SampleMenu2 /></Layout>} />
      <Route path="/demos/sample-menu-3" element={<Layout><SampleMenu3 /></Layout>} />
      <Route path="/demos/sample-menu-4" element={<Layout><SampleMenu4 /></Layout>} />
      <Route path="/r/:slug" element={<Layout><PublicMenuPage /></Layout>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
