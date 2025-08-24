import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Utensils className="h-8 w-8 text-coral-500" />
              <span className="text-2xl font-black">
                WhatTheMenu<span className="text-coral-500">?</span>
              </span>
            </div>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Making every restaurant accessible to every customer, regardless of hearing ability or language. 
              We help restaurants serve all customers with confidence.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-coral-500" />
                <span className="text-gray-300">restaurants@whatthemenu.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-coral-500" />
                <span className="text-gray-300">Adelaide, South Australia</span>
              </div>
            </div>
          </div>

          {/* Restaurant Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-coral-500">For Restaurants</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/restaurants" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Platform Overview
                </Link>
              </li>
              <li>
                <Link 
                  to="/consumers" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  See Demo
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Book Demo Call
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-coral-500">Legal & Support</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/terms" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/refunds" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h4 className="text-xl font-bold mb-3 text-coral-500">Our Mission</h4>
            <p className="text-gray-300 text-lg italic">
              "Making every restaurant accessible to every customer, regardless of hearing ability or language."
            </p>
            <p className="text-gray-400 mt-2">
              Building bridges between restaurants and customers who face accessibility or language barriers.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © {currentYear} LoFi Simplify Pty Ltd (ABN 35340346478). All rights reserved.
            </div>
            
            <div className="text-gray-400 text-sm">
              Built with ❤️ for restaurants and their customers worldwide.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;