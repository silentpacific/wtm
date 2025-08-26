// src/pages/ContactPage.tsx - Minimalist redesign
import React, { useState } from 'react';
import { Mail, MessageCircle, Clock } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setErrorMessage('Please fill in all fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim().match(emailRegex)) {
      setSubmitStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      console.log('📧 Submitting contact form via Netlify function...');
      
      const response = await fetch('/.netlify/functions/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Contact form submitted successfully:', result);
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });

    } catch (error) {
      console.error('❌ Contact form submission failed:', error);
      setSubmitStatus('error');
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setErrorMessage('Unable to submit form. Please check your internet connection and try again.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Failed to submit form. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 bg-wtm-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight text-wtm-text tracking-tight">
            Let's Talk
          </h1>
          <p className="text-xl text-wtm-muted max-w-2xl mx-auto font-light">
            Ready to make your restaurant accessible to everyone? We're here to help.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-lg font-medium text-wtm-text mb-3">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-lg font-medium text-wtm-text mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg"
                    placeholder="your@restaurant.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-lg font-medium text-wtm-text mb-3">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg resize-none"
                    placeholder="Tell us about your restaurant and how we can help..."
                  />
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-start">
                      <MessageCircle className="text-green-600 mr-4 mt-1 flex-shrink-0" size={24} />
                      <div>
                        <p className="text-green-800 font-semibold text-lg mb-2">
                          Message sent successfully!
                        </p>
                        <p className="text-green-700">
                          We've received your message and will get back to you within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-start">
                      <Mail className="text-red-600 mr-4 mt-1 flex-shrink-0" size={24} />
                      <div>
                        <p className="text-red-800 font-semibold text-lg mb-2">
                          Unable to send message
                        </p>
                        <p className="text-red-700">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-wtm-primary text-white hover:bg-wtm-primary-600 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Sending Message...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-8">
            {/* Quick Response */}
            <div className="bg-wtm-bg rounded-2xl p-8 text-center">
              <Clock size={48} className="text-wtm-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-wtm-text mb-3">
                Quick Response
              </h3>
              <p className="text-wtm-muted font-light leading-relaxed">
                We typically respond within 2-4 hours during business days.
              </p>
            </div>

            {/* Direct Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-2xl font-semibold text-wtm-text mb-6">
                Other Ways to Reach Us
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-wtm-text mb-2">Sales Inquiries</h4>
                  <p className="text-wtm-muted mb-2">Ready to get started?</p>
                  <a 
                    href="mailto:sales@whatthemenu.com" 
                    className="text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors"
                  >
                    sales@whatthemenu.com
                  </a>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-semibold text-wtm-text mb-2">Support</h4>
                  <p className="text-wtm-muted mb-2">Need help with your account?</p>
                  <a 
                    href="mailto:support@whatthemenu.com" 
                    className="text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors"
                  >
                    support@whatthemenu.com
                  </a>
                </div>
              </div>
            </div>

            {/* Development Debug Info */}
            {import.meta.env.DEV && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  🔧 Development Debug Info
                </h4>
                <p className="text-sm text-yellow-700 mb-2">
                  Form submits to: <code>/.netlify/functions/contact-form</code>
                </p>
                <p className="text-sm text-yellow-700">
                  Make sure your Netlify function is deployed and environment variables are set.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;