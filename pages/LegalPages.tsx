import React, { useEffect } from 'react';

const LegalPageLayout: React.FC<{ 
  title: string; 
  children: React.ReactNode;
  description?: string;
  keywords?: string;
}> = ({ title, children, description, keywords }) => {
  
  useEffect(() => {
    // Set page title
    document.title = `${title} | WhatTheMenu - AI Menu Scanner`;
    
    // Set meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // Set meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = keywords;
    }
  }, [title, description, keywords]);

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-black text-5xl text-charcoal sm:text-6xl tracking-tighter mb-10">{title}</h1>
        <div className="text-charcoal/90 text-lg space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const RefundHighlight: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-coral/10 border-4 border-coral rounded-2xl p-6 my-6 shadow-[4px_4px_0_#292524]">
        <h3 className="text-2xl font-black text-coral !mt-0">{title}</h3>
        <div className="prose-lg text-charcoal/90 font-medium space-y-4">
            {children}
        </div>
    </div>
);

export const RefundsPolicyPage: React.FC = () => (
    <LegalPageLayout 
      title="Refunds Policy"
      description="Learn about WhatTheMenu's refund policy for Daily and Weekly passes. We offer refunds for technical issues and have a 7-day refund window."
      keywords="refund policy, WhatTheMenu refunds, AI menu scanner refunds, technical issues, money back guarantee"
    >
        <p>We want you to love using WhatTheMenu! If something goes wrong on our end, we've got your back.</p>

        <h3 className="text-2xl font-black text-coral">When You Can Get a Refund</h3>
        
        <RefundHighlight title="🔧 Technical Issues">
            <p>If our app breaks and prevents you from scanning menus or getting dish explanations, we'll absolutely refund you. Just send us:</p>
            <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
                <li>A screenshot of the error message</li>
                <li>When the error happened</li>
                <li>What device/browser you were using</li>
                <li>A quick description of what you were trying to do</li>
            </ul>
            <p className="mt-2">We take technical issues seriously because they help us improve the app for everyone. Once we approve your refund, you'll see the money back in your account within 5-7 business days.</p>
        </RefundHighlight>

        <h3 className="text-2xl font-black text-coral">When We Can't Offer Refunds</h3>
        <h4 className="text-xl font-bold mt-4">❌ No Refunds For:</h4>
        <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
            <li><strong>Change of mind</strong> - "Actually, I don't need this anymore"</li>
            <li><strong>Poor image quality</strong> - Blurry photos, bad lighting, or unclear menu text that our AI can't read</li>
            <li><strong>Already used your pass</strong> - If you've successfully scanned menus and got explanations, the pass has done its job</li>
        </ul>

        <h3 className="text-2xl font-black text-coral">How to Request a Refund</h3>
        <p className="mt-2"><strong>Email us:</strong> <a href="mailto:support@whatthemenu.com" className="text-coral hover:underline">support@whatthemenu.com</a></p>
        
        <h4 className="text-xl font-bold mt-4">Include:</h4>
        <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
            <li>Your payment details (order number, email used for purchase)</li>
            <li>Screenshots of any errors</li>
            <li>Brief explanation of the problem</li>
        </ul>
        
        <p className="mt-2"><strong>Important:</strong> Not providing the info we need might delay your refund, so please include everything listed above.</p>

        <h3 className="text-2xl font-black text-coral">Time Limits</h3>
        <p className="mt-2">You have <strong>7 calendar days</strong> from your purchase to request a refund. After that, we can't help because our error logs get automatically deleted to protect your privacy.</p>

        <h3 className="text-2xl font-black text-coral">Questions?</h3>
        <p className="mt-2">Hit us up at <a href="mailto:support@whatthemenu.com" className="text-coral hover:underline">support@whatthemenu.com</a> if you need clarification on anything. We're here to help!</p>

        <div className="bg-yellow/20 border-2 border-yellow rounded-lg p-4 mt-6">
            <p className="text-charcoal font-medium text-center">
                <em>This policy applies to Daily ($1) and Weekly ($5) passes. Free scans don't require refunds because, well, they're free! 😊</em>
            </p>
        </div>
    </LegalPageLayout>
);

const FaqSection: React.FC<{ title: string; emoji: string; children: React.ReactNode }> = ({ title, emoji, children }) => (
    <div className="bg-white border-4 border-charcoal rounded-2xl p-6 mb-8 shadow-[6px_6px_0px_#292524]">
        <h2 className="text-3xl font-black text-coral mb-6 flex items-center gap-3">
            <span className="text-4xl">{emoji}</span>
            {title}
        </h2>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const FaqQuestion: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <div>
        <h3 className="text-xl font-bold text-charcoal mb-2">{question}</h3>
        <div className="text-charcoal/80 space-y-2">
            {children}
        </div>
    </div>
);

export const FaqPage: React.FC = () => {
  useEffect(() => {
    // Add structured data for FAQ (helps Google show rich snippets)
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does WhatTheMenu work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simply upload a photo of any menu or use your camera to take a picture. Our AI will analyze the menu and provide detailed explanations for each dish."
          }
        },
        {
          "@type": "Question",
          "name": "What file formats do you accept?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We accept JPG, JPEG, PNG, and WEBP files. We don't support QR codes yet."
          }
        },
        {
          "@type": "Question",
          "name": "Is the information always accurate?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our AI is usually very accurate, but always double-check with restaurant staff about allergens or dietary restrictions."
          }
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <LegalPageLayout 
      title="Frequently Asked Questions"
      description="Find answers to common questions about WhatTheMenu AI menu scanner. Learn about pricing, file formats, accuracy, refunds, and how our AI-powered menu translation works."
      keywords="WhatTheMenu FAQ, AI menu scanner questions, menu translation help, pricing questions, file formats, allergen detection"
    >
        <p className="text-xl text-charcoal/80 mb-8">Got questions? We've got answers! Here's everything you need to know about WhatTheMenu.</p>

        <FaqSection title="Getting Started" emoji="🚀">
            <FaqQuestion question="How does it work?">
                <p>Super simple! Just upload a photo of any menu (or snap one with your camera), and our AI will analyze it and explain what each dish actually is. No more playing menu roulette!</p>
            </FaqQuestion>

            <FaqQuestion question="What file formats do you accept?">
                <p>We accept JPG, JPEG, PNG, and WEBP files. Sorry, but we can't read QR codes yet - you'll need an actual image of the menu.</p>
            </FaqQuestion>

            <FaqQuestion question="Is there a file size limit?">
                <p>Yep, keep it under 10 MB. Most phone photos are way smaller than this, so you should be fine.</p>
            </FaqQuestion>

            <FaqQuestion question="How long does processing take?">
                <p>Pretty fast! Menu scanning takes 2-3 seconds, and each dish explanation takes 1-3 seconds. If lots of hungry people are using the app at once, it might take a bit longer.</p>
            </FaqQuestion>
        </FaqSection>

        <FaqSection title="Using the App" emoji="📱">
            <FaqQuestion question="What happens if my menu has multiple pages?">
                <p>Each page counts as one scan. You could try fitting two pages in one photo, but we recommend one page at a time for the best results.</p>
            </FaqQuestion>

            <FaqQuestion question="Can I scan multiple menus at once?">
                <p>Nope, one menu at a time. But hey, that keeps things simple!</p>
            </FaqQuestion>

            <FaqQuestion question="Does the app work offline?">
                <p>You'll need an internet connection since our AI lives in the cloud.</p>
            </FaqQuestion>

            <FaqQuestion question="Are my menu scans saved?">
                <p>You can see your dish explanations as long as you keep the browser tab open. Close the tab? You'll need to scan again. We don't save your scans for privacy reasons.</p>
            </FaqQuestion>

            <FaqQuestion question="Can I save or share the menu explanations?">
                <p>Not right now - each person gets their own explanations. If you're eating with friends, just pass the phone around or read the good stuff out loud! 😊</p>
            </FaqQuestion>
        </FaqSection>

        <FaqSection title="Languages & Accuracy" emoji="🌍">
            <FaqQuestion question="What languages does the app support?">
                <p>Our AI can read menus in pretty much any major language - it's been trained on tons of different cuisines and writing systems.</p>
                <p>The explanations come in 4 languages: English, Spanish, Chinese (中文), and French. We're adding more languages gradually!</p>
            </FaqQuestion>

            <FaqQuestion question="Is the information always accurate?">
                <p>Our AI is usually spot-on, but it's not perfect. The explanations are for guidance only. <strong>Always double-check with restaurant staff about allergens or specific dietary needs</strong> - especially if you have celiac disease or serious allergies.</p>
            </FaqQuestion>
        </FaqSection>

        <FaqSection title="Food & Menu Types" emoji="🍽️">
            <FaqQuestion question="Does this work for drink/cocktail menus or just food?">
                <p>It works for everything you'd typically find on a menu - food, drinks, cocktails, desserts, specialty items, the works!</p>
            </FaqQuestion>

            <FaqQuestion question="Can it identify allergens and dietary restrictions?">
                <p>Yes! The system mentions common allergens in dishes, but <strong>please always confirm with your waiter before ordering</strong>. AI tools are generic and might miss something specific to your needs.</p>
                <p>We're thinking about adding a feature where you can specify your dietary restrictions. Stay tuned!</p>
            </FaqQuestion>

            <FaqQuestion question="Can it help with wine lists and beverage pairings?">
                <p>Great idea! We're planning to add wine pairing suggestions in the future. Imagine scanning a wine list and getting perfect pairing recommendations - pretty cool, right?</p>
            </FaqQuestion>

            <FaqQuestion question="Does it work with dessert menus or specialty cuisine menus?">
                <p>Absolutely! Whether it's molecular gastronomy, traditional regional dishes, or fancy desserts, our AI has seen it all.</p>
            </FaqQuestion>
        </FaqSection>

        <FaqSection title="Pricing & Plans" emoji="💰">
            <FaqQuestion question="What's included in each plan?">
                <div>
                    <p><strong>Free (Start Here!):</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>5 menu scans</li>
                        <li>5 dish explanations per menu</li>
                        <li>No signup required</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Daily Pass ($1):</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Unlimited scans for 24 hours</li>
                        <li>All dishes explained on every menu</li>
                        <li>Perfect for a day of food exploring</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Weekly Pass ($5):</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Unlimited scans for 7 days</li>
                        <li>All dishes explained on every menu</li>
                        <li>Great for travelers or food adventurers</li>
                    </ul>
                </div>
            </FaqQuestion>

            <FaqQuestion question="Why do you charge when some translation apps are free?">
                <p>Fair question! We're not just translating text - we're analyzing entire menus, identifying dishes, explaining ingredients, flagging allergens, and providing cultural context. That takes some serious AI power (and server costs)!</p>
            </FaqQuestion>

            <FaqQuestion question="Is an account required for paid passes?">
                <p>Yes, you'll need to create an account. This helps us track your purchase, investigate any technical issues, and process refunds if needed.</p>
            </FaqQuestion>

            <FaqQuestion question="Are upgrades allowed?">
                <p>Totally! You can upgrade from free to paid, or from daily to weekly. Just heads up: if you upgrade from daily to weekly after using some of your daily hours, you don't get those hours back. Our system isn't set up for partial refunds.</p>
            </FaqQuestion>

            <FaqQuestion question="Do you offer subscriptions?">
                <p>Not yet, but we're thinking about it! Some frequent travelers have asked for monthly or yearly options. We'll probably add those in the future.</p>
            </FaqQuestion>
        </FaqSection>

        <FaqSection title="Time & Renewals" emoji="⏰">
            <FaqQuestion question="Does my pass account for daylight saving time?">
                <p>Yep! Our system is smart about time zones and will give you an extra hour when needed.</p>
            </FaqQuestion>

            <FaqQuestion question="Can I renew my pass?">
                <p>There's no automatic renewal button yet. Just buy another daily or weekly pass when your current one expires, and unlimited scans start again right after payment goes through.</p>
            </FaqQuestion>

            <FaqQuestion question="Will I get reminded before my pass expires?">
                <div>
                    <p>Absolutely! We'll email you:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><strong>Daily pass:</strong> 1 hour before it expires</li>
                        <li><strong>Weekly pass:</strong> 1 day before + 1 hour before it expires</li>
                    </ul>
                </div>
            </FaqQuestion>
        </FaqSection>

        <FaqSection title="Privacy & Data" emoji="🔒">
            <FaqQuestion question="Do you store my menu images?">
                <p>Nope! We process your images to give you explanations, then they're gone. We don't keep any copies.</p>
            </FaqQuestion>

            <FaqQuestion question="Do you track my location?">
                <p>Only if you give us permission. We use location data for analytics to improve the app and understand where our users are. It helps us serve you better!</p>
            </FaqQuestion>

            <FaqQuestion question="Do you collect personal data beyond payment info?">
                <p>No, we keep it minimal. Just what we need for payments and the occasional support email.</p>
            </FaqQuestion>

            <FaqQuestion question="Can other users see my scanned menus?">
                <p>Never! Your menu scans are completely private - only you can see them.</p>
            </FaqQuestion>
        </FaqSection>

        <FaqSection title="Technical Issues" emoji="🔧">
            <FaqQuestion question="What if the AI doesn't recognize my menu properly?">
                <p>Try taking a clearer photo with better lighting. If it still doesn't work, you can always scan another menu or contact us for help.</p>
            </FaqQuestion>

            <FaqQuestion question="What should I do if I encounter an error?">
                <p>Take a screenshot and email us at <a href="mailto:support@whatthemenu.com" className="text-coral hover:underline">support@whatthemenu.com</a>. Include details about when it happened and what device you're using. We investigate all technical issues!</p>
            </FaqQuestion>
        </FaqSection>

        <FaqSection title="Refunds" emoji="💸">
            <FaqQuestion question="Can I get a refund?">
                <p>Check out our <a href="/refunds" className="text-coral hover:underline">Refunds Policy</a> for full details. Short version: we refund for technical issues on our end, but not for change of mind or if you've already used your pass successfully.</p>
            </FaqQuestion>

            <FaqQuestion question="How long do I have to request a refund?">
                <p>7 calendar days from purchase. After that, our error logs get deleted for privacy reasons.</p>
            </FaqQuestion>

            <FaqQuestion question="Can I get a refund if I paid but haven't used the service?">
                <p>Unfortunately, no. Once you've purchased a pass, it's considered active whether you use it or not.</p>
            </FaqQuestion>
        </FaqSection>

        <div className="bg-teal/10 border-4 border-teal rounded-2xl p-6 mt-8 text-center">
            <h2 className="text-2xl font-black text-charcoal mb-4">Still Have Questions?</h2>
            <p className="text-lg text-charcoal/80">Drop us a line at <a href="mailto:support@whatthemenu.com" className="text-coral hover:underline font-bold">support@whatthemenu.com</a> - we're always happy to help!</p>
        </div>
    </LegalPageLayout>
  );
};

