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
export const findOrCreateRestaurant = async (
  restaurantName: string,
  cuisineType: string,
  userLocation: any
): Promise<number | null> => {
  if (!restaurantName || restaurantName.trim() === '') {
    return null;
  }

  try {
    const hash = createRestaurantHash(restaurantName, userLocation.city, userLocation.state);
    
    // Try to find existing restaurant
    const { data: existingRestaurants, error: searchError } = await supabase
      .from('restaurants')
      .select('id, total_scans')
      .eq('name_location_hash', hash)
      .limit(1);

    if (searchError) {
      console.error('Error searching for restaurant:', searchError);
      return null;
    }

    if (existingRestaurants && existingRestaurants.length > 0) {
      // Update scan count for existing restaurant
      const restaurantId = existingRestaurants[0].id;
      await supabase
        .from('restaurants')
        .update({ 
          total_scans: existingRestaurants[0].total_scans + 1,
          last_scanned_at: new Date().toISOString()
        })
        .eq('id', restaurantId);
      
      return restaurantId;
    }

    // Create new restaurant
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
        last_scanned_at: new Date().toISOString(),
        name_location_hash: hash
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating restaurant:', insertError);
      return null;
    }

    return newRestaurant.id;
  } catch (error) {
    console.error('Error in findOrCreateRestaurant:', error);
    return null;
  }
};