import React, { useState } from 'react';
import { CheckCircle, Users, Globe, Filter, MessageSquare, QrCode, Star, ArrowRight, Play } from 'lucide-react';

export default function RestaurantLandingPage() {
  const [email, setEmail] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const benefits = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Welcome New Customers",
      description: "Serve deaf, hard-of-hearing, and international customers with confidence"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "Clear Communication",
      description: "Customers can ask questions about ingredients, allergens, and customizations"
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "Multiple Languages",
      description: "Automatic translation to English, Spanish, Chinese, and French"
    },
    {
      icon: <Filter className="w-6 h-6 text-blue-600" />,
      title: "Dietary Filtering",
      description: "Customers can filter by dietary needs and exclude allergens safely"
    }
  ];

  const features = [
    "QR code for easy access",
    "Mobile-optimized menu display",
    "Visual allergen warnings",
    "Customization notes for each dish",
    "Question & answer system",
    "Order summary for waitstaff",
    "No app download required",
    "Works on any smartphone"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      restaurant: "Golden Dragon Restaurant",
      text: "We've welcomed so many new customers who couldn't communicate with us before. The QR menu has been a game-changer for accessibility.",
      rating: 5
    },
    {
      name: "Marco Rossi", 
      restaurant: "Bella Vista Pizzeria",
      text: "International tourists love being able to read our menu in their language. It's increased our customer satisfaction dramatically.",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      restaurant: "Spice Garden",
      text: "The allergen filtering gives our customers confidence. They can see exactly what's safe for them to eat.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Make Your Restaurant 
                <span className="text-blue-600"> Accessible</span> to Everyone
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Serve deaf, hard-of-hearing, and international customers with a simple QR code menu. 
                No training required. No app downloads. Just inclusive hospitality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Start Free Trial
                </button>
                <button 
                  onClick={() => setShowDemo(true)}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <Play size={20} />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>7-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Setup in 24 hours</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gray-100 rounded-xl p-4 mb-4">
                  <QrCode size={120} className="mx-auto text-gray-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Scan for Accessible Menu</h3>
                <p className="text-gray-600 text-sm">Customers simply scan to access your menu in their preferred language with full accessibility features.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Are You Missing Out on Customers?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🤲</div>
              <h3 className="font-semibold text-lg mb-2">Deaf & Hard-of-Hearing</h3>
              <p className="text-gray-600">15% of adults have some degree of hearing loss, yet most restaurants aren't equipped to serve them effectively.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-semibold text-lg mb-2">International Tourists</h3>
              <p className="text-gray-600">Language barriers prevent tourists from fully understanding your menu and feeling confident ordering.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="font-semibold text-lg mb-2">Allergen Concerns</h3>
              <p className="text-gray-600">Customers with dietary restrictions often avoid restaurants due to unclear allergen information.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              One QR Code. Unlimited Accessibility.
            </h2>
            <p className="text-xl text-gray-600">
              Transform your menu into an inclusive, multilingual, accessible experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Simple Setup. Immediate Impact.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Upload Your Menu</h3>
              <p className="text-gray-600">Send us a photo or PDF of your current menu. We'll create your accessible digital version within 24 hours.</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">Get Your QR Code</h3>
              <p className="text-gray-600">We provide high-quality QR codes for your tables, windows, and marketing materials. Print and display anywhere.</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Welcome New Customers</h3>
              <p className="text-gray-600">Customers scan, browse, and communicate their orders clearly. No training needed for your staff.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Everything Your Customers Need
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our accessible menu platform includes all the features needed for inclusive dining experiences.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <MessageSquare size={16} className="text-white" />
                    </div>
                    <span className="font-medium">Customer Question</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                    "Does the pasta contain nuts?"
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">✓ No</button>
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">? Checking</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">✗ Yes</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Restaurants Love the Results
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.restaurant}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            One price. All features. No hidden fees.
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">$25</div>
              <div className="text-gray-600">per month</div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span>Accessible menu page</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span>4 language translations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span>QR codes & table tents</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span>Menu updates included</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span>Customer support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span>7-day free trial</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Welcome Everyone?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join restaurants creating more inclusive dining experiences. Setup takes less than 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <input
              type="email"
              placeholder="Enter your restaurant email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-6 py-4 rounded-lg text-gray-900 w-full sm:w-auto sm:min-w-[300px]"
            />
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              Get Started Free
              <ArrowRight size={20} />
            </button>
          </div>

          <p className="text-blue-200 text-sm">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">See How It Works</h3>
              <button
                onClick={() => setShowDemo(false)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play size={64} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Demo video would be embedded here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing customer scanning QR code, browsing menu, and placing order
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}