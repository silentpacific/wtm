// src/services/counterService.ts
import { supabase } from './supabaseClient';

export interface GlobalCounters {
  menus_scanned: number;
  dish_explanations: number;
}

// Get current counter values
export const getGlobalCounters = async (): Promise<GlobalCounters> => {
  try {
    const { data, error } = await supabase
      .from('global_counters')
      .select('counter_type, count');

    if (error) {
      console.error('Error fetching counters:', error);
      // Return default values on error
      return { menus_scanned: 1337, dish_explanations: 0 };
    }

    // Convert array to object
    const counters: GlobalCounters = {
      menus_scanned: 1337,
      dish_explanations: 0
    };

    data?.forEach(row => {
      if (row.counter_type === 'menus_scanned') {
        counters.menus_scanned = row.count;
      } else if (row.counter_type === 'dish_explanations') {
        counters.dish_explanations = row.count;
      }
    });

    return counters;
  } catch (error) {
    console.error('Error in getGlobalCounters:', error);
    return { menus_scanned: 1337, dish_explanations: 0 };
  }
};

// Increment menu scanned counter
export const incrementMenuScanned = async (): Promise<number | null> => {
  try {
    const { data, error } = await supabase.rpc('increment_counter', {
      counter_name: 'menus_scanned'
    });

    if (error) {
      console.error('Error incrementing menu counter:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in incrementMenuScanned:', error);
    return null;
  }
};

// Increment dish explanation counter
export const incrementDishExplanation = async (): Promise<number | null> => {
  try {
    const { data, error } = await supabase.rpc('increment_counter', {
      counter_name: 'dish_explanations'
    });

    if (error) {
      console.error('Error incrementing dish explanation counter:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in incrementDishExplanation:', error);
    return null;
  }
};

// Subscribe to real-time counter changes
export const subscribeToCounters = (callback: (counters: GlobalCounters) => void) => {
  return supabase
    .channel('global_counters_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'global_counters'
      },
      async () => {
        // Fetch updated counters when any change occurs
        const counters = await getGlobalCounters();
        callback(counters);
      }
    )
    .subscribe();
};