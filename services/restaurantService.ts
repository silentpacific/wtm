import { supabase } from './supabaseClient';
import { Restaurant } from '../types';

// Get user location (with permission)
export const getUserLocation = (): Promise<{city?: string, state?: string, country?: string, latitude?: number, longitude?: number}> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get location details
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          
          resolve({
            city: data.city || data.locality,
            state: data.principalSubdivision,
            country: data.countryName,
            latitude,
            longitude
          });
        } catch (error) {
          console.error('Error getting location details:', error);
          resolve({ latitude, longitude });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve({});
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
};

// Create hash for restaurant deduplication
const createRestaurantHash = (name: string, city?: string, state?: string): string => {
  const normalizedName = name.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const locationPart = `${city || ''}_${state || ''}`.toLowerCase();
  return `${normalizedName}_${locationPart}`;
};

// Find or create restaurant
// Find or create restaurant
export const findOrCreateRestaurant = async (
  restaurantName: string,
  cuisineType: string,
  userLocation: {
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  },
  dishCount: number = 0 // NEW: Add dish count parameter
): Promise<number | null> => {
  if (!restaurantName || restaurantName.trim() === '') {
    console.log('No restaurant name provided');
    return null;
  }

  try {
    const hash = createRestaurantHash(restaurantName, userLocation.city, userLocation.state);
    console.log(`Looking for restaurant with hash: ${hash}`);
    
    // Try to find existing restaurant
    const { data: existingRestaurants, error: searchError } = await supabase
      .from('restaurants')
      .select('id, total_scans, dishes_scanned')
      .eq('name_location_hash', hash)
      .limit(1);

    if (searchError) {
      console.error('Error searching for restaurant:', searchError);
      return null;
    }

    if (existingRestaurants && existingRestaurants.length > 0) {
      // Update scan count AND dish count for existing restaurant
      const restaurantId = existingRestaurants[0].id;
      console.log(`Found existing restaurant with ID: ${restaurantId}`);
      
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ 
          total_scans: existingRestaurants[0].total_scans + 1,
          dishes_scanned: (existingRestaurants[0].dishes_scanned || 0) + dishCount, // NEW: Add dish count
          last_scanned_at: new Date().toISOString()
        })
        .eq('id', restaurantId);
      
      if (updateError) {
        console.error('Error updating restaurant scan count:', updateError);
      } else {
        console.log(`Updated restaurant ${restaurantId}: +1 scan, +${dishCount} dishes`);
      }
      
      return restaurantId;
    }

    // Create new restaurant with initial dish count
    console.log('Creating new restaurant:', {
      name: restaurantName,
      city: userLocation.city,
      state: userLocation.state,
      country: userLocation.country,
      dishCount
    });

    const { data: newRestaurant, error: insertError } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantName.trim(),
        cuisine_type: cuisineType || null,
        city: userLocation.city || null,
        state: userLocation.state || null,
        country: userLocation.country || null,
        latitude: userLocation.latitude || null,
        longitude: userLocation.longitude || null,
        total_scans: 1,
        dishes_scanned: dishCount, // NEW: Set initial dish count
        last_scanned_at: new Date().toISOString(),
        name_location_hash: hash
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating restaurant:', insertError);
      return null;
    }

    console.log(`Created new restaurant with ID: ${newRestaurant.id}, ${dishCount} dishes`);
    return newRestaurant.id;
  } catch (error) {
    console.error('Error in findOrCreateRestaurant:', error);
    return null;
  }
};

// Increment dish explanation count for a restaurant
export const incrementRestaurantDishExplanation = async (restaurantId: number): Promise<void> => {
  try {
    // Get current count
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('dishes_explained')
      .eq('id', restaurantId)
      .single();

    if (fetchError) {
      console.error('Error fetching restaurant for explanation count:', fetchError);
      return;
    }

    // Increment the count
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ 
        dishes_explained: (restaurant.dishes_explained || 0) + 1
      })
      .eq('id', restaurantId);

    if (updateError) {
      console.error('Error updating restaurant explanation count:', updateError);
    } else {
      console.log(`Incremented explanation count for restaurant ${restaurantId}`);
    }
  } catch (error) {
    console.error('Error in incrementRestaurantDishExplanation:', error);
  }
};