import { supabase } from './supabaseClient';

export const incrementMenusScanned = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_counter', {
      counter_type: 'menus_scanned'
    });
    
    if (error) {
      console.error('Error incrementing menus_scanned:', error);
    } else {
      console.log('✅ Incremented menus_scanned counter');
    }
  } catch (error) {
    console.error('Error incrementing menus_scanned:', error);
  }
};

export const incrementDishesExplained = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_counter', {
      counter_type: 'dishes_explained'
    });
    
    if (error) {
      console.error('Error incrementing dishes_explained:', error);
    } else {
      console.log('✅ Incremented dishes_explained counter');
    }
  } catch (error) {
    console.error('Error incrementing dishes_explained:', error);
  }
};