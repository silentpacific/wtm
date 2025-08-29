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

function AdminRoutes() {
  const { user } = useAuth();
  // ✅ Hardcode your admin email (can later move to DB role check)
  const isAdmin = user?.email === "rahulrrao@gmail.com";

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

          {/* Admin-only routes */}
          <Route element={<AdminRoutes />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
