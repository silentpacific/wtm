import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Smartphone, Globe, Zap, Camera, Upload, FileText } from 'lucide-react';
import DemoSection from '../components/DemoSection';
import LoginModal from '../components/LoginModal';
import { supabase } from '../services/supabaseClient';
import { User } from '@supabase/supabase-js';

const ConsumersPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/profile');
    } else {
      setShowLoginModal(true);
    }
  };

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <Camera className="w-8 h-8 text-coral-500" />,
      title: "Instant Menu Scanning",
      description: "Just snap a photo of any menu and get detailed explanations of every dish in seconds."
    },
    {
      icon: <Globe className="w-8 h-8 text-coral-500" />,
      title: "Multi-Language Support",
      description: "Get explanations in English, Spanish, Chinese, or French - perfect for international dining."
    },
    {
      icon: <Zap className="w-8 h-8 text-coral-500" />,
      title: "AI-Powered Insights",
      description: "Our advanced AI understands cuisines, ingredients, allergens, and dietary restrictions."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-coral-500" />,
      title: "Mobile-First Design",
      description: "Designed for your phone - scan menus anywhere, anytime, with a touch-friendly interface."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Never Wonder
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-orange-500">
                What's on the Menu
              </span>
              <br />
              Again! 🍽️
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Snap a photo of any menu and get instant, detailed explanations of every dish. 
              Perfect for trying new cuisines, avoiding allergens, or dining in a foreign language.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={scrollToDemo}
                className="bg-coral-500 hover:bg-coral-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Try the Demo 🚀
              </button>
              
              <button
                onClick={handleGetStarted}
                className="bg-white hover:bg-gray-50 text-coral-500 font-bold py-4 px-8 rounded-full text-lg border-2 border-coral-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started Free
              </button>
            </div>

            <div className="text-sm text-gray-600">
              ✨ <strong>Free to try</strong> • No signup required for demo • Multi-language support
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-16">
            How WhatTheMenu Works ✨
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              See WhatTheMenu in Action 🎯
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Upload a menu photo or try our sample French menu to see how our AI 
              explains dishes in perfect detail, in your preferred language.
            </p>
          </div>
          
          <DemoSection />
        </div>
      </section>

      {/* Upload Methods Section */}
      <section className="py-20 px-4 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-12">
            Three Ways to Scan Menus 📱
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <Camera className="w-12 h-12 text-coral-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Take a Photo</h3>
              <p className="text-gray-600">
                Point your camera at any menu and snap a quick photo. Works great with restaurant menus, takeout menus, or food truck boards.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <Upload className="w-12 h-12 text-coral-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Image</h3>
              <p className="text-gray-600">
                Have a menu photo saved on your phone? Upload it directly and get instant explanations of every dish.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <FileText className="w-12 h-12 text-coral-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Try the Demo</h3>
              <p className="text-gray-600">
                Not sure how it works? Try our sample French bistro menu and see how WhatTheMenu explains each dish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-8">
            Speak Your Language 🌍
          </h2>
          <p className="text-xl text-gray-700 mb-12">
            Get menu explanations in your preferred language, making it easy to dine anywhere in the world.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-2">🇺🇸</div>
              <div className="font-bold text-gray-900">English</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-2">🇪🇸</div>
              <div className="font-bold text-gray-900">Spanish</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-2">🇨🇳</div>
              <div className="font-bold text-gray-900">Chinese</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-2">🇫🇷</div>
              <div className="font-bold text-gray-900">French</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-coral-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Ready to Never Wonder Again? 🚀
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of food lovers who use WhatTheMenu to explore new cuisines 
            with confidence. Start scanning menus today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={scrollToDemo}
              className="bg-white hover:bg-gray-100 text-coral-500 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Try Demo First
            </button>
            
            <button
              onClick={handleGetStarted}
              className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full text-lg border-2 border-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started Free
            </button>
          </div>
          
          <div className="mt-6 text-white/80 text-sm">
            ✨ No credit card required • Free demo available • Works on any device
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default ConsumersPage;