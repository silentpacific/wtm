// src/pages/SampleMenu2.tsx - Tokyo Sushi Bar Demo Menu  
import React from 'react';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { tokyoSushiMenu } from '../data/sampleMenuData';

const SampleMenu2: React.FC = () => {
  return (
    <RestaurantMenuPage 
      menuData={tokyoSushiMenu}
      menuId="demo-menu-2"
      isDemo={true}
    />
  );
};

export default SampleMenu2;