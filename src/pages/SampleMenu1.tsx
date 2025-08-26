// src/pages/SampleMenu1.tsx - Bella Vista Italian Demo Menu
import React from 'react';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { bellaVistaMenu } from '../data/sampleMenuData';

const SampleMenu1: React.FC = () => {
  return (
	<div className="px-4 sm:px-6 lg:px-32 xl:px-48">
    <RestaurantMenuPage 
      menuData={bellaVistaMenu}
      menuId="demo-menu-1"
      isDemo={true}
    />
	</div>
  );
};

export default SampleMenu1;