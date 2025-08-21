// Debug script to check restaurant slug in database
// Run this in your browser console on any WhatTheMenu page

async function debugRestaurantSlug() {
  try {
    console.log('🔍 Debugging restaurant slug...');
    
    // Check if restaurant exists with slug "rahuls-coffee-shop-2"
    const response = await fetch('/.netlify/functions/getRestaurantData?slug=rahuls-coffee-shop-2');
    const data = await response.json();
    
    console.log('📋 Restaurant data response:', data);
    
    if (data.restaurant) {
      console.log('✅ Restaurant found!');
      console.log('- ID:', data.restaurant.id);
      console.log('- Name:', data.restaurant.business_name);
      console.log('- Slug:', data.restaurant.slug);
      console.log('- URL should be: /restaurants/' + data.restaurant.slug);
    } else {
      console.log('❌ Restaurant not found with slug "rahuls-coffee-shop-2"');
      
      // Let's check what restaurants do exist
      console.log('🔍 Checking all restaurants...');
      
      // Check restaurant business accounts table
      const allRestaurantsResponse = await fetch('/.netlify/functions/getRestaurantData?listAll=true');
      const allData = await allRestaurantsResponse.json();
      
      if (allData.restaurants && allData.restaurants.length > 0) {
        console.log('📋 Found restaurants:');
        allData.restaurants.forEach(restaurant => {
          console.log(`- ${restaurant.business_name} (slug: ${restaurant.slug})`);
        });
      } else {
        console.log('❌ No restaurants found in database');
      }
    }
    
    // Also check dishes for restaurant ID 7
    console.log('\n🍽️ Checking dishes for restaurant ID 7...');
    const dishesResponse = await fetch('/.netlify/functions/getRestaurantDishes?restaurantId=7');
    const dishesData = await dishesResponse.json();
    
    console.log('📋 Dishes response:', dishesData);
    console.log(`Found ${dishesData.dishes?.length || 0} dishes`);
    
    if (dishesData.dishes && dishesData.dishes.length > 0) {
      console.log('First few dishes:');
      dishesData.dishes.slice(0, 3).forEach(dish => {
        console.log(`- ${dish.dish_name || dish.name} (${dish.section_name || dish.section})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug function
debugRestaurantSlug();

// Additional manual checks you can run:
console.log(`
🔧 Manual debug commands:

1. Check restaurant data:
   fetch('/.netlify/functions/getRestaurantData?slug=rahuls-coffee-shop-2').then(r => r.json()).then(console.log)

2. Check dishes for restaurant ID 7:
   fetch('/.netlify/functions/getRestaurantDishes?restaurantId=7').then(r => r.json()).then(console.log)

3. Check if the route is working:
   window.location.href = '/restaurants/rahuls-coffee-shop-2'
`);