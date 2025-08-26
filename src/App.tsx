// src/App.tsx - Clean routes matching final sitemap only
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';

// Existing pages
import RestaurantLandingPage from './pages/RestaurantLandingPage';
import ConsumersPage from './pages/ConsumersPage';
import DemosPage from './pages/DemosPage';
import SampleMenu1 from './pages/SampleMenu1';
import SampleMenu2 from './pages/SampleMenu2';
import SampleMenu3 from './pages/SampleMenu3';
import SampleMenu4 from './pages/SampleMenu4';

// Auth pages
import RestaurantSignupPage from './pages/RestaurantSignupPage';
import RestaurantLoginPage from './pages/RestaurantLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Dashboard pages
import DashboardPage from './pages/DashboardPage';
import MenuEditorPage from './pages/MenuEditorPage';
import QRCodesPage from './pages/QRCodesPage';
import ProfilePage from './pages/ProfilePage';

// Support pages
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
      <div className="min-h-screen bg-white">
        <Header />
        
        <main>
          <Routes>
            {/* Homepage - Restaurant marketing */}
            <Route path="/" element={<RestaurantLandingPage />} />
            
            {/* Hidden consumer page - URL discovery only */}
            <Route path="/consumers" element={<ConsumersPage />} />
            
            {/* Demo system routes */}
            <Route path="/demos" element={<DemosPage />} />
            <Route path="/demos/sample-menu-1" element={<SampleMenu1 />} />
            <Route path="/demos/sample-menu-2" element={<SampleMenu2 />} />
            <Route path="/demos/sample-menu-3" element={<SampleMenu3 />} />
            <Route path="/demos/sample-menu-4" element={<SampleMenu4 />} />
            
            {/* Authentication routes */}
            <Route path="/signup" element={<RestaurantSignupPage />} />
            <Route path="/login" element={<RestaurantLoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/menu-editor" element={<MenuEditorPage />} />
            <Route path="/dashboard/qr-codes" element={<QRCodesPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            
            {/* Support pages */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            
            <Route path="/terms" element={
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-600">Terms of service coming soon</p>
              </div>
            } />
            
            <Route path="/privacy" element={
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-600">Privacy policy coming soon</p>
              </div>
            } />
            
            <Route path="/help" element={
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
                <p className="text-gray-600">Help documentation coming soon</p>
              </div>
            } />
            
            {/* 404 - Redirect to homepage */}
            <Route path="*" element={
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600">This page doesn't exist yet.</p>
                <a href="/" className="text-coral-600 hover:text-coral-700 font-semibold">
                  Return to Homepage
                </a>
              </div>
            } />
          </Routes>
        </main>
        
        <footer className="bg-gray-50 py-8 border-t">
          <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
            <p>&copy; 2025 WhatTheMenu - Making restaurants accessible to everyone</p>
          </div>
        </footer>
      </div>
    </Router>
    </AuthProvider>
  );
};

export default App;