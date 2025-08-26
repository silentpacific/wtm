// src/pages/SampleMenu4.tsx - Spice Route Demo Menu
import React from 'react';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { spiceRouteMenu } from '../data/sampleMenuData';

const SampleMenu4: React.FC = () => {
  return (
    <RestaurantMenuPage 
      menuData={spiceRouteMenu}
      menuId="demo-menu-4"
      isDemo={true}
    />
  );
};

export default SampleMenu4;