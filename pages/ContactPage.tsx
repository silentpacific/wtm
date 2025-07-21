import React, { useEffect } from 'react';

const ContactPage: React.FC = () => {
  useEffect(() => {
    document.title = "Contact Us | WhatTheMenu - AI Menu Scanner";
    
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Get in touch with WhatTheMenu support team. Contact us for help with AI menu scanning, technical issues, or general questions.";

    let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = "WhatTheMenu contact, customer support, technical help, menu scanner support";
  }, []);

  const inputStyle = "mt-1 block w-full bg-white border-4 border-charcoal rounded-xl shadow-inner py-3 px-4 text-charcoal focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral sm:text-lg font-medium";
  
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-black text-5xl text-charcoal sm:text-6xl tracking-tighter">Contact Us</h1>
          <p className="mt-4 text-xl text-charcoal/80">
            Have a question or feedback? We'd love to hear from you!
          </p>
        </div>
        <div className="mt-12 bg-white border-4 border-charcoal p-8 rounded-2xl shadow-[8px_8px_0px_#292524]">
          <form action="mailto:rahulrrao@gmail.com?subject=WhatTheMenu Contact Form" method="post" encType="text/plain" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-bold text-charcoal">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-bold text-charcoal">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-lg font-bold text-charcoal">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className={inputStyle}
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 border-4 border-charcoal rounded-full shadow-[4px_4px_0px_#292524] text-lg font-bold text-white bg-coral hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;