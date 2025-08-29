// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import RestaurantLandingPage from "./pages/RestaurantLandingPage";
import PublicMenuPage from "./pages/PublicMenuPage";
import DemosPage from "./pages/DemosPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";

// Admin-only internal tools
import MenuEditorPage from "./pages/MenuEditorPage";
import QRCodesPage from "./pages/QRCodesPage";

// Login page (only you use this now)
import RestaurantLoginPage from "./pages/RestaurantLoginPage";

function AdminRoutes() {
  const { user, authLoading } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === "rahulrrao@gmail.com";

  // While checking session → show spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Route path="/dashboard/menu-editor" element={<MenuEditorPage />} />
      <Route path="/dashboard/qr-codes" element={<QRCodesPage />} />
    </>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public marketing routes */}
          <Route path="/" element={<RestaurantLandingPage />} />
          <Route path="/demos" element={<DemosPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Public menu page */}
          <Route path="/r/:slug" element={<PublicMenuPage />} />

          {/* Admin login (hidden from customers) */}
          <Route path="/login" element={<RestaurantLoginPage />} />

          {/* Admin-only tools */}
          <Route element={<AdminRoutes />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
