// src/pages/SampleMenu3.tsx - Garden Bistro Demo Menu
import React from 'react';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { gardenBistroMenu } from '../data/sampleMenuData';

const SampleMenu3: React.FC = () => {
  return (
    <RestaurantMenuPage 
      menuData={gardenBistroMenu}
      menuId="demo-menu-3"
      isDemo={true}
    />
  );
};

export default SampleMenu3;