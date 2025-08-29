// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import RestaurantLoginPage from "./pages/RestaurantLoginPage";
import PublicMenuPage from "./pages/PublicMenuPage";
import MenuEditorPage from "./pages/MenuEditorPage";
import QRCodesPage from "./pages/QRCodesPage";

function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth();

  console.log("🔐 PrivateRoute check → user:", user, "authLoading:", authLoading);

  if (authLoading) {
    return <p>Loading...</p>;
  }
  if (!user) {
    console.warn("⚠️ No user found → redirecting to /login");
    return <Navigate to="/login" replace />;
  }
  console.log("✅ Access granted → showing page");
  return children;
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public menu pages */}
          <Route path="/r/:slug" element={<PublicMenuPage />} />

          {/* Login */}
          <Route path="/login" element={<RestaurantLoginPage />} />

          {/* Internal tools */}
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

          {/* Default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
