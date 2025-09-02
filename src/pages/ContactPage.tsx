// src/pages/ContactPage.tsx
import React, { useState } from "react";

const ContactPage: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-6 text-wtm-text">Contact Us</h1>
        <p className="text-lg text-wtm-muted mb-12">
          Have questions? Send us a message and we’ll get back to you.
        </p>

        {/* Netlify Contact Form */}
        <form
          name="contact"
          method="POST"
          data-netlify="true"
          onSubmit={() => setStatus("success")}
          className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow text-left"
        >
          {/* Hidden input required for Netlify */}
          <input type="hidden" name="form-name" value="contact" />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-wtm-primary focus:border-wtm-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-wtm-primary focus:border-wtm-primary"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-wtm-primary focus:border-wtm-primary"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-wtm-primary text-white font-semibold py-3 rounded-xl hover:bg-wtm-primary-600 transition-all duration-200"
          >
            Send Message
          </button>

          {status === "success" && (
            <p className="text-green-600 text-center mt-4">
              Thanks! We’ll be in touch soon.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
