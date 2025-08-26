// src/pages/SampleMenu3.tsx - Garden Bistro Demo Menu
import React from 'react';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { gardenBistroMenu } from '../data/sampleMenuData';

const SampleMenu3: React.FC = () => {
  return (
	<div className="px-4 sm:px-6 lg:px-32 xl:px-48">
    <RestaurantMenuPage 
      menuData={gardenBistroMenu}
      menuId="demo-menu-3"
      isDemo={true}
    />
	</div>
  );
};

export default SampleMenu3;