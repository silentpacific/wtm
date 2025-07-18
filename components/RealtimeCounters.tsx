import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface CounterData {
  menus_scanned: number;
  dishes_explained: number;
}

const RealtimeCounters: React.FC = () => {
  const [counters, setCounters] = useState<CounterData>({
    menus_scanned: 1340,
    dishes_explained: 2847
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial counter values
    const fetchCounters = async () => {
      try {
        const { data, error } = await supabase
          .from('counters')
          .select('menus_scanned, dishes_explained')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error fetching counters:', error);
          return;
        }

        if (data) {
          setCounters(data);
        }
      } catch (error) {
        console.error('Error fetching counters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounters();

    // Set up real-time subscription
    const subscription = supabase
      .channel('counters')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'counters',
          filter: 'id=eq.1'
        },
        (payload) => {
          console.log('Real-time counter update:', payload);
          if (payload.new) {
            setCounters({
              menus_scanned: payload.new.menus_scanned,
              dishes_explained: payload.new.dishes_explained
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-8 text-charcoal/80">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-charcoal/20 rounded animate-pulse"></div>
          <span className="font-bold">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-charcoal/80">
      {/* Menus Scanned Counter */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-black text-charcoal">
            {formatNumber(counters.menus_scanned)}
          </p>
          <p className="text-sm font-bold text-charcoal/60">
            Menus Scanned
          </p>
        </div>
      </div>

      {/* Separator */}
      <div className="hidden sm:block w-px h-12 bg-charcoal/20"></div>

      {/* Dishes Explained Counter */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-black text-charcoal">
            {formatNumber(counters.dishes_explained)}
          </p>
          <p className="text-sm font-bold text-charcoal/60">
            Dishes Explained
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealtimeCounters;