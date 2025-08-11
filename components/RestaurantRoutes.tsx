import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Placeholder components - we'll create these next
const RestaurantSignUp = () => <div>Restaurant SignUp Page</div>;
const RestaurantLogin = () => <div>Restaurant Login Page</div>;
const RestaurantDashboard = () => <div>Restaurant Dashboard Page</div>;

const RestaurantRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/signup" element={<RestaurantSignUp />} />
      <Route path="/login" element={<RestaurantLogin />} />
      <Route path="/dashboard" element={<RestaurantDashboard />} />
      <Route path="/" element={<div>Restaurant Landing Page</div>} />
    </Routes>
  );
};

export default RestaurantRoutes;