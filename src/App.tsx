// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";

// Pages
import RestaurantLandingPage from "./pages/RestaurantLandingPage";
import PublicMenuPage from "./pages/PublicMenuPage";
import RestaurantLoginPage from "./pages/RestaurantLoginPage";
import MenuEditorPage from "./pages/MenuEditorPage";
import QRCodesPage from "./pages/QRCodesPage";
import DemosPage from "./pages/DemosPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";

function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <p>Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ✅ Wrapper so we can safely use useLocation()
const AppContent: React.FC = () => {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/r/");

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        {/* Homepage (always visible) */}
        <Route path="/" element={<RestaurantLandingPage />} />

        {/* Public demos page */}
        <Route path="/demos" element={<DemosPage />} />

        {/* Public menu pages */}
        <Route path="/r/:slug" element={<PublicMenuPage />} />

        {/* Login */}
        <Route path="/login" element={<RestaurantLoginPage />} />

        {/* Internal tools (protected) */}
        <Route
          path="/dashboard/menu-editor"
          element={
            <PrivateRoute>
              <MenuEditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/qr-codes"
          element={
            <PrivateRoute>
              <QRCodesPage />
            </PrivateRoute>
          }
        />

        {/* Catch-all → go home */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Extra pages */}
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>

      {/* Footer (always visible except in /r/ pages) */}
      {!hideHeader && (
        <footer className="mt-16 py-6 border-t text-center text-sm text-gray-500">
          © 2025 WhatTheMenu.com — Made with ❤️ in Adelaide
        </footer>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
