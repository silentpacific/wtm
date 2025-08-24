// pages/RestaurantLandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Globe, 
  Users, 
  Star, 
  CheckCircle, 
  QrCode,
  ArrowRight,
  Smartphone,
  Eye,
  Volume2,
  Languages,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

const RestaurantLandingPage: React.FC = () => {
  const benefits = [
    {
      icon: <Heart className="text-coral" size={32} />,
      title: "Serve Every Customer",
      description: "Welcome guests with hearing impairments, language barriers, and visual needs. Show you care about accessibility."
    },
    {
      icon: <Globe className="text-coral" size={32} />,
      title: "Attract International Visitors",
      description: "Menus in English, Chinese, Spanish & French. Perfect for tourist areas and diverse communities."
    },
    {
      icon: <Star className="text-coral" size={32} />,
      title: "Boost Your Reviews",
      description: "Customers love restaurants that go the extra mile. Accessibility efforts lead to glowing reviews."
    },
    {
      icon: <TrendingUp className="text-coral" size={32} />,
      title: "Increase Revenue",
      description: "Reach customers you never could before. Every accessible experience is a potential repeat customer."
    }
  ];

  const features = [
    {
      icon: <Languages size={24} />,
      title: "Multi-Language Menus",
      description: "English, Chinese, Spanish, French - all automatically translated"
    },
    {
      icon: <Eye size={24} />,
      title: "Visual Accessibility",
      description: "Large fonts, high contrast, screen reader friendly"
    },
    {
      icon: <Volume2 size={24} />,
      title: "Audio Support", 
      description: "Compatible with assistive hearing devices and apps"
    },
    {
      icon: <Smartphone size={24} />,
      title: "Mobile-First Design",
      description: "Works perfectly on any phone, tablet, or device"
    },
    {
      icon: <QrCode size={24} />,
      title: "Easy QR Codes",
      description: "Print-ready codes for tables, menus, and windows"
    },
    {
      icon: <Clock size={24} />,
      title: "Quick Setup",
      description: "From menu upload to QR codes in under 15 minutes"
    }
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream to-yellow/30 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-coral/10 text-coral font-black rounded-full text-sm border-2 border-coral/20">
                🍽️ FOR RESTAURANTS
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-charcoal mb-6 tracking-tight leading-tight">
              Make Your Menu
              <span className="block text-coral">Accessible to Everyone</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-bold text-charcoal/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Serve customers with hearing impairments, language barriers, and visual needs. 
              <span className="text-coral"> Increase your revenue while doing good.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/restaurants/signup"
                className="px-8 py-4 bg-coral text-cream font-black text-xl rounded-xl border-4 border-charcoal shadow-[6px_6px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              
              <Link
                to="/demo"
                className="px-8 py-4 bg-white text-charcoal font-black text-xl rounded-xl border-4 border-charcoal shadow-[6px_6px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                See Demo
              </Link>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border-4 border-charcoal rounded-2xl p-6 shadow-[8px_8px_0px_#292524]">
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-bold text-charcoal">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  30-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  No setup fees
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-charcoal mb-6 tracking-tight">
                Why Restaurants Love AccessMenu
              </h2>
              <p className="text-xl font-bold text-charcoal/80 max-w-2xl mx-auto">
                Turn your restaurant into an inclusive space that welcomes everyone
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-cream border-4 border-charcoal rounded-2xl p-6 shadow-[6px_6px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-charcoal mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-charcoal/80 font-bold leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-yellow/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-charcoal mb-6 tracking-tight">
                Simple 3-Step Setup
              </h2>
              <p className="text-xl font-bold text-charcoal/80">
                From menu upload to serving customers in under 15 minutes
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-coral text-cream rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 border-4 border-charcoal shadow-[4px_4px_0px_#292524]">
                  1
                </div>
                <h3 className="text-2xl font-black text-charcoal mb-4">Upload Your Menu</h3>
                <p className="text-charcoal/80 font-bold">
                  Take a photo or upload a PDF of your current menu. Our AI does the rest.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-coral text-cream rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 border-4 border-charcoal shadow-[4px_4px_0px_#292524]">
                  2
                </div>
                <h3 className="text-2xl font-black text-charcoal mb-4">Get Your QR Codes</h3>
                <p className="text-charcoal/80 font-bold">
                  Print QR codes for tables, menus, and windows. Customers scan to access.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-coral text-cream rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 border-4 border-charcoal shadow-[4px_4px_0px_#292524]">
                  3
                </div>
                <h3 className="text-2xl font-black text-charcoal mb-4">Welcome Everyone</h3>
                <p className="text-charcoal/80 font-bold">
                  Customers enjoy accessible menus in their preferred language.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-charcoal mb-6 tracking-tight">
                Everything You Need Included
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-cream border-4 border-charcoal rounded-xl p-6 text-center shadow-[4px_4px_0px_#292524]"
                >
                  <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center text-coral mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-black text-charcoal mb-2">{feature.title}</h3>
                  <p className="text-sm text-charcoal/80 font-bold">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-yellow/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-charcoal mb-6 tracking-tight">
                Join Forward-Thinking Restaurants
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white border-4 border-charcoal rounded-xl p-6 shadow-[6px_6px_0px_#292524]">
                <div className="text-3xl font-black text-coral mb-2">15%</div>
                <div className="font-black text-charcoal text-sm">Average Revenue Increase</div>
              </div>
              
              <div className="bg-white border-4 border-charcoal rounded-xl p-6 shadow-[6px_6px_0px_#292524]">
                <div className="text-3xl font-black text-coral mb-2">4.8★</div>
                <div className="font-black text-charcoal text-sm">Customer Satisfaction</div>
              </div>
              
              <div className="bg-white border-4 border-charcoal rounded-xl p-6 shadow-[6px_6px_0px_#292524]">
                <div className="text-3xl font-black text-coral mb-2">2 min</div>
                <div className="font-black text-charcoal text-sm">Average Setup Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-cream border-4 border-charcoal rounded-2xl p-8 shadow-[8px_8px_0px_#292524] text-center">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-500 fill-current" size={32} />
                ))}
              </div>
              
              <blockquote className="text-2xl font-bold text-charcoal mb-6 italic">
                "AccessMenu transformed how we serve our international customers. The setup was incredibly easy, and we've seen more positive reviews than ever. It shows we care about everyone who walks through our doors."
              </blockquote>
              
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center text-cream font-black text-xl">
                  M
                </div>
                <div className="text-left">
                  <div className="font-black text-charcoal">Maria Rodriguez</div>
                  <div className="text-charcoal/60 font-bold">Owner, Casa Bonita</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-charcoal text-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
              Simple, Honest Pricing
            </h2>
            <p className="text-xl font-bold text-cream/80 mb-12">
              Everything included. No hidden fees. Cancel anytime.
            </p>
            
            <div className="bg-cream text-charcoal border-4 border-cream rounded-2xl p-8 shadow-[8px_8px_0px_rgba(255,255,255,0.1)] inline-block">
              <div className="text-center">
                <div className="mb-4">
                  <Award className="text-coral mx-auto mb-2" size={48} />
                  <h3 className="text-3xl font-black mb-2">AccessMenu Pro</h3>
                  <p className="text-charcoal/60 font-bold">Perfect for local restaurants</p>
                </div>
                
                <div className="mb-6">
                  <span className="text-6xl font-black text-coral">$25</span>
                  <span className="text-2xl font-bold text-charcoal/80">/month</span>
                </div>
                
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-bold">Unlimited menu items</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-bold">4 languages included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-bold">QR codes & printing guides</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-bold">Full accessibility features</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-bold">Menu updates anytime</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-bold">Email support</span>
                  </div>
                </div>
                
                <Link
                  to="/restaurants/signup"
                  className="w-full inline-block px-8 py-4 bg-coral text-cream font-black text-xl rounded-xl border-4 border-charcoal shadow-[6px_6px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Start Free Trial
                </Link>
                
                <p className="text-sm font-bold text-charcoal/60 mt-4">
                  30-day free trial • No setup fees • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-coral to-coral/90">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-cream">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
              Ready to Welcome Everyone?
            </h2>
            <p className="text-xl font-bold mb-8 opacity-90">
              Join restaurants creating inclusive dining experiences
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/restaurants/signup"
                className="px-8 py-4 bg-cream text-charcoal font-black text-xl rounded-xl border-4 border-charcoal shadow-[6px_6px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              
              <Link
                to="/contact"
                className="px-8 py-4 bg-transparent text-cream font-black text-xl rounded-xl border-4 border-cream hover:bg-cream hover:text-charcoal transition-all"
              >
                Questions? Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RestaurantLandingPage;