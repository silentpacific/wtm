import React from 'react';
import RestaurantHeader from './RestaurantHeader';
import RestaurantFooter from './RestaurantFooter';

interface RestaurantLayoutProps {
  children: React.ReactNode;
}

export default function RestaurantLayout({ children }: RestaurantLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <RestaurantHeader />
      <main className="flex-grow">
        {children}
      </main>
      <RestaurantFooter />
    </div>
  );
}