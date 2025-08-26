// src/pages/SampleMenu2.tsx - Tokyo Sushi Bar Demo Menu  
import React from 'react';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { tokyoSushiMenu } from '../data/sampleMenuData';

const SampleMenu2: React.FC = () => {
  return (
	<div className="px-12 md:px-24 lg:px-40">
		<RestaurantMenuPage 
		  menuData={tokyoSushiMenu}
		  menuId="demo-menu-2"
		  isDemo={true}
		/>
	</div>
  );
};

export default SampleMenu2;