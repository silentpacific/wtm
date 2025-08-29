// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import RestaurantLandingPage from './pages/RestaurantLandingPage';
import RestaurantSignupPage from './pages/RestaurantSignupPage';
import RestaurantLoginPage from './pages/RestaurantLoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MenuEditorPage from './pages/MenuEditorPage';
import QRCodesPage from './pages/QRCodesPage';
import BillingPage from './pages/BillingPage';
import ConsumersPage from './pages/ConsumersPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import DemosPage from './pages/DemosPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PublicMenuPage from './pages/PublicMenuPage';
import SampleMenu1 from './pages/SampleMenu1';
import SampleMenu2 from './pages/SampleMenu2';
import SampleMenu3 from './pages/SampleMenu3';
import SampleMenu4 from './pages/SampleMenu4';
import LoadingPage from './components/LoadingPage';

// ✅ Simplified ProtectedRoute
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RestaurantLandingPage />} />
      <Route path="/signup" element={<RestaurantSignupPage />} />
      <Route path="/login" element={<RestaurantLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/demos" element={<DemosPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Public menus */}
      <Route path="/r/:slug" element={<PublicMenuPage />} />
      <Route path="/sample-menu-1" element={<SampleMenu1 />} />
      <Route path="/sample-menu-2" element={<SampleMenu2 />} />
      <Route path="/sample-menu-3" element={<SampleMenu3 />} />
      <Route path="/sample-menu-4" element={<SampleMenu4 />} />

      {/* Dashboard routes (protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/menu-editor"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MenuEditorPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/qr-codes"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QRCodesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/billing"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BillingPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/consumers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ConsumersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
