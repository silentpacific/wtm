// services/counterService.ts

export interface GlobalCounters {
  menus_scanned: number;
  dish_explanations: number;
}

// In-memory storage for counters (replace with your actual database logic)
let globalCounters: GlobalCounters = {
  menus_scanned: 1337,
  dish_explanations: 0
};

// Subscribers for real-time updates
type CounterSubscriber = (counters: GlobalCounters) => void;
let subscribers: CounterSubscriber[] = [];

// Get current global counters
export const getGlobalCounters = async (): Promise<GlobalCounters> => {
  // TODO: Replace with actual database call
  // For now, return the in-memory counters
  return { ...globalCounters };
};

// Increment menu scans counter
export const incrementMenuScans = async (): Promise<void> => {
  try {
    // TODO: Replace with actual database update
    // For example, if using Supabase:
    // const { error } = await supabase
    //   .from('global_counters')
    //   .update({ menus_scanned: globalCounters.menus_scanned + 1 })
    //   .eq('id', 1);
    
    // For now, update in-memory counter
    globalCounters.menus_scanned += 1;
    
    // Notify all subscribers of the update
    notifySubscribers();
    
    console.log('Menu scan counter incremented to:', globalCounters.menus_scanned);
  } catch (error) {
    console.error('Error incrementing menu scans:', error);
    throw error;
  }
};

// Increment dish explanations counter
export const incrementDishExplanations = async (): Promise<void> => {
  try {
    // TODO: Replace with actual database update
    // For example, if using Supabase:
    // const { error } = await supabase
    //   .from('global_counters')
    //   .update({ dish_explanations: globalCounters.dish_explanations + 1 })
    //   .eq('id', 1);
    
    // For now, update in-memory counter
    globalCounters.dish_explanations += 1;
    
    // Notify all subscribers of the update
    notifySubscribers();
    
    console.log('Dish explanation counter incremented to:', globalCounters.dish_explanations);
  } catch (error) {
    console.error('Error incrementing dish explanations:', error);
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
const notifySubscribers = () => {
  subscribers.forEach(callback => {
    callback({ ...globalCounters });
  });
};

// If you're using Supabase, you could set up real-time subscriptions like this:
/*
import { supabase } from './supabase';

export const setupRealtimeCounters = () => {
  const subscription = supabase
    .channel('global_counters')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'global_counters' },
      (payload) => {
        globalCounters = payload.new as GlobalCounters;
        notifySubscribers();
      }
    )
    .subscribe();

  return subscription;
};
*/