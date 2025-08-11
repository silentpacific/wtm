import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RestaurantLanding from '../pages/restaurant/RestaurantLanding';
import RestaurantSignUp from '../pages/restaurant/RestaurantSignUp';
import RestaurantLogin from '../pages/restaurant/RestaurantLogin';

// Placeholder components - we'll create these next
const RestaurantDashboard = () => <div>Restaurant Dashboard Page</div>;

const RestaurantRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RestaurantLanding />} />
      <Route path="/signup" element={<RestaurantSignUp />} />
      <Route path="/login" element={<RestaurantLogin />} />
      <Route path="/dashboard" element={<RestaurantDashboard />} />
    </Routes>
  );
};

export default RestaurantRoutes;