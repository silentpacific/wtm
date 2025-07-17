import React, { useState, useCallback } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import { PrivacyPolicyPage, TermsOfUsePage, FaqPage } from './pages/LegalPages';

const Header: React.FC<{ userScans: number }> = ({ userScans }) => (
  <header className="bg-cream/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b-4 border-charcoal">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-3xl font-black text-charcoal tracking-tighter">
            WhatTheMenu?
          </Link>
          <nav className="hidden md:flex space-x-6">
            <NavLink to="/faq" className={({ isActive }) => `text-lg font-bold ${isActive ? 'text-coral' : 'text-charcoal/70 hover:text-charcoal'}`}>FAQ</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `text-lg font-bold ${isActive ? 'text-coral' : 'text-charcoal/70 hover:text-charcoal'}`}>Contact</NavLink>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
           <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 border-4 border-charcoal rounded-full shadow-[4px_4px_0px_#292524]">
            <span className="font-bold text-sm">Free Scans:</span>
            <span className="font-black text-lg">{userScans}/5</span>
          </div>
          <button className="hidden sm:inline-block px-6 py-2 text-lg font-bold text-charcoal hover:text-coral transition-colors">Login</button>
          <button className="px-6 py-3 text-lg font-bold text-white bg-coral rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-[0px_0px_0px_#292524] active:translate-x-1 active:translate-y-1 transition-all">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  </header>
);

const Footer: React.FC<{ totalScans: number }> = ({ totalScans }) => (
  <footer className="bg-yellow border-t-4 border-charcoal">
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-charcoal/80">
      <p className="font-bold">
        Powered by Google Gemini. Descriptions are AI-generated. Always double-check with the restaurant regarding possible allergens.
      </p>
      <div className="flex justify-center space-x-6 my-4 font-bold">
        <Link to="/privacy" className="hover:text-charcoal">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-charcoal">Terms of Use</Link>
        <Link to="/contact" className="hover:text-charcoal">Contact Us</Link>
      </div>
      <p className="my-2">
        Total menus scanned globally: <span className="font-black">{totalScans.toLocaleString()}</span>
      </p>
      <p className="font-bold">&copy; {new Date().getFullYear()} What The Menu? Built by <a href="https://www.lofisimplify.com.au/" target="_blank" rel="noopener noreferrer" className="underline hover:text-coral transition-colors">LoFi Simplify</a> with ❤️ in Adelaide. All rights reserved.</p>
    </div>
  </footer>
);


const App: React.FC = () => {
  const [totalScans, setTotalScans] = useState(1337);
  const [userScans, setUserScans] = useState(3);

  const incrementScans = useCallback(() => {
    // For MVP, user scans don't decrease, but we show the initial state.
    // setUserScans(prev => Math.min(prev + 1, 5));
    setTotalScans(prev => prev + 1);
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans">
      <Header userScans={userScans} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage onScanSuccess={incrementScans} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </main>
      <Footer totalScans={totalScans} />
    </div>
  );
};

export default App;