// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import RestaurantLandingPage from "./pages/RestaurantLandingPage";
import PublicMenuPage from "./pages/PublicMenuPage";
import RestaurantLoginPage from "./pages/RestaurantLoginPage";
import MenuEditorPage from "./pages/MenuEditorPage";
import QRCodesPage from "./pages/QRCodesPage";
import DemosPage from "./pages/DemosPage";
import SampleMenu1 from "./pages/SampleMenu1";
import SampleMenu2 from "./pages/SampleMenu2";
import SampleMenu3 from "./pages/SampleMenu3";
import SampleMenu4 from "./pages/SampleMenu4";

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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
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
		  <Route path="/demos/sample-menu-1" element={<SampleMenu1 />} />
			<Route path="/demos/sample-menu-2" element={<SampleMenu2 />} />
			<Route path="/demos/sample-menu-3" element={<SampleMenu3 />} />
			<Route path="/demos/sample-menu-4" element={<SampleMenu4 />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
