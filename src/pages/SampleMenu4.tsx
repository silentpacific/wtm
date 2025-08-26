// src/pages/SampleMenu4.tsx - Spice Route Demo Menu
import React from 'react';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { spiceRouteMenu } from '../data/sampleMenuData';

const SampleMenu4: React.FC = () => {
  return (
	<div className="px-4 sm:px-6 lg:px-32 xl:px-48">
    <RestaurantMenuPage 
      menuData={spiceRouteMenu}
      menuId="demo-menu-4"
      isDemo={true}
    />
	</div>
  );
};

export default SampleMenu4;