// src/pages/SampleMenu1.tsx - Bella Vista Italian Demo Menu
import React from 'react';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { bellaVistaMenu } from '../data/sampleMenuData';

const SampleMenu1: React.FC = () => {
  return (
    <RestaurantMenuPage 
      menuData={bellaVistaMenu}
      menuId="demo-menu-1"
      isDemo={true}
    />
  );
};

export default SampleMenu1;