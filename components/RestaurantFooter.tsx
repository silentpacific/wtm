import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, HelpCircle, Mail, Phone } from 'lucide-react';

export default function RestaurantFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">WTM</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">WhatTheMenu</h3>
                <p className="text-sm text-gray-500">Restaurant Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Helping restaurants serve international customers with accessible, multilingual menus and seamless communication tools.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://whatthemenu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
              >
                <ExternalLink size={16} className="mr-1" />
                Visit Customer Site
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/restaurant/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/restaurant/menu" className="text-sm text-gray-600 hover:text-gray-900">
                  Menu Management
                </Link>
              </li>
              <li>
                <Link to="/restaurant/qr-codes" className="text-sm text-gray-600 hover:text-gray-900">
                  QR Codes
                </Link>
              </li>
              <li>
                <Link to="/restaurant/billing" className="text-sm text-gray-600 hover:text-gray-900">
                  Billing & Subscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:restaurants@whatthemenu.com"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <Mail size={16} className="mr-2" />
                  restaurants@whatthemenu.com
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <HelpCircle size={16} className="mr-2" />
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Restaurant Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          
          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            
            {/* Copyright */}
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              © 2025 WhatTheMenu. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Restaurant Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}