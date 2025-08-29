// src/pages/DemosPage.tsx
import React from "react";
import { Link } from "react-router-dom";

const DemosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-6">
          Explore Our Demo Menus
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          No app download required. Works on any phone.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
          {/* Removed Free Trial button */}
          {/* <Link 
            to="/signup" 
            className="bg-wtm-primary text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-wtm-primary-600 hover:scale-[1.02] transition-all duration-200 shadow-lg"
          >
            Start Your Free Trial
          </Link> */}

          <Link
            to="/faq"
            className="bg-transparent text-wtm-primary border-2 border-wtm-primary font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-wtm-primary hover:text-white transition-all duration-200"
          >
            Have Questions?
          </Link>

          <Link
            to="/contact"
            className="bg-transparent text-wtm-primary border-2 border-wtm-primary font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-wtm-primary hover:text-white transition-all duration-200"
          >
            Contact Us
          </Link>
        </div>

        {/* Demo Menus */}
        <h2 className="text-2xl font-semibold text-center mb-10">
          Sample Restaurants
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Sample Menu 1 */}
          <div className="border rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Sample Restaurant 1</h3>
              <p className="text-gray-600">Bella Vista Italian</p>
            </div>
            <div className="mt-6 text-right">
              <Link
                to="/demos/sample-menu-1"
                className="text-wtm-primary hover:underline"
              >
                View Full Menu →
              </Link>
            </div>
          </div>

          {/* Sample Menu 2 */}
          <div className="border rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Sample Restaurant 2</h3>
              <p className="text-gray-600">Tokyo Sushi Bar</p>
            </div>
            <div className="mt-6 text-right">
              <Link
                to="/demos/sample-menu-2"
                className="text-wtm-primary hover:underline"
              >
                View Full Menu →
              </Link>
            </div>
          </div>

          {/* Sample Menu 3 */}
          <div className="border rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Sample Restaurant 3</h3>
              <p className="text-gray-600">Spice of India</p>
            </div>
            <div className="mt-6 text-right">
              <Link
                to="/demos/sample-menu-3"
                className="text-wtm-primary hover:underline"
              >
                View Full Menu →
              </Link>
            </div>
          </div>

          {/* Sample Menu 4 */}
          <div className="border rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Sample Restaurant 4</h3>
              <p className="text-gray-600">Downtown Burger Grill</p>
            </div>
            <div className="mt-6 text-right">
              <Link
                to="/demos/sample-menu-4"
                className="text-wtm-primary hover:underline"
              >
                View Full Menu →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemosPage;
