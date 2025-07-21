// services/counterService.ts - Updated with Supabase integration

import { supabase } from './supabaseClient';

export interface GlobalCounters {
  menus_scanned: number;
  dish_explanations: number;
}

// Subscribers for real-time updates
type CounterSubscriber = (counters: GlobalCounters) => void;
let subscribers: CounterSubscriber[] = [];

// Get current global counters from database
export const getGlobalCounters = async (): Promise<GlobalCounters> => {
  try {
    const { data, error } = await supabase
      .from('global_counters')
      .select('counter_type, count')
      .in('counter_type', ['menus_scanned', 'dish_explanations'])
      .order('updated_at', { ascending: false }); // Force fresh data

    if (error) {
      console.error('Error fetching global counters:', error);
      // Return default values on error
      return { menus_scanned: 0, dish_explanations: 0 };
    }

    // Convert array to object
    const counters: GlobalCounters = {
      menus_scanned: 0,
      dish_explanations: 0
    };

    console.log('🔍 Raw counter data from database:', data);

    data?.forEach(row => {
      if (row.counter_type === 'menus_scanned') {
        counters.menus_scanned = row.count;
      } else if (row.counter_type === 'dish_explanations') {
        counters.dish_explanations = row.count;
      }
    });

    console.log('🔍 Parsed counters:', counters);
    return counters;
  } catch (error) {
    console.error('Error in getGlobalCounters:', error);
    return { menus_scanned: 0, dish_explanations: 0 };
  }
};

// Initialize counter if it doesn't exist
const initializeCounter = async (counterType: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('global_counters')
      .upsert({
        counter_type: counterType,
        count: 0
      }, {
        onConflict: 'counter_type'
      });

    if (error) {
      console.error(`Error initializing ${counterType} counter:`, error);
    }
  } catch (error) {
    console.error(`Error in initializeCounter for ${counterType}:`, error);
  }
};

// Increment menu scans counter in database
export const incrementMenuScans = async (): Promise<void> => {
  try {
    // First ensure the counter exists
    await initializeCounter('menus_scanned');

    // Increment the counter
    const { data, error } = await supabase.rpc('increment_global_counter', {
      counter_name: 'menus_scanned'
    });

    if (error) {
      console.error('Error incrementing menu scans:', error);
      throw error;
    }

    console.log('Menu scan counter incremented successfully');

    // Manual refresh since real-time isn't available
    setTimeout(async () => {
      const updatedCounters = await getGlobalCounters();
      console.log('📊 Manually refreshed counters:', updatedCounters);
      notifySubscribers(updatedCounters);
    }, 300);
  } catch (error) {
    console.error('Error in incrementMenuScans:', error);
    throw error;
  }
};

// Increment dish explanations counter in database
export const incrementDishExplanations = async (): Promise<void> => {
  try {
    // First ensure the counter exists
    await initializeCounter('dish_explanations');

    // Increment the counter
    const { data, error } = await supabase.rpc('increment_global_counter', {
      counter_name: 'dish_explanations'
    });

    if (error) {
      console.error('Error incrementing dish explanations:', error);
      throw error;
    }

    console.log('Dish explanation counter incremented successfully');

    // Manual refresh since real-time isn't available
    setTimeout(async () => {
      const updatedCounters = await getGlobalCounters();
      console.log('📊 Manually refreshed counters:', updatedCounters);
      notifySubscribers(updatedCounters);
    }, 300);
  } catch (error) {
    console.error('Error in incrementDishExplanations:', error);
    throw error;
  }
};

// Subscribe to counter updates
export const subscribeToCounters = (callback: CounterSubscriber) => {
  subscribers.push(callback);
  
  return {
    unsubscribe: () => {
      subscribers = subscribers.filter(sub => sub !== callback);
    }
  };
};

// Notify all subscribers of counter updates
const notifySubscribers = (counters: GlobalCounters) => {
  subscribers.forEach(callback => {
    callback(counters);
  });
};

// Set up real-time subscriptions for counter changes (simplified - real-time not available)
export const setupRealtimeCounters = () => {
  console.log('⚠️ Real-time replication not available, using manual refresh approach');
  
  // Return a proper mock subscription object that matches Supabase's interface
  return {
    on: () => ({ unsubscribe: () => {} }),
    unsubscribe: () => {
      console.log('Mock subscription unsubscribed');
    }
  };
};