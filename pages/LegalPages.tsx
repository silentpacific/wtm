import React, { useEffect } from 'react';
import { FaqPage, RefundsPolicyPage } from './RefundsandFaq';

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

export const PrivacyPolicyPage: React.FC = () => (
  <LegalPageLayout 
    title="Privacy Policy"
    description="WhatTheMenu privacy policy. Learn how we handle your data, menu images, and personal information with our AI menu scanning service."
    keywords="privacy policy, data protection, WhatTheMenu privacy, AI menu scanner privacy, GDPR compliance"
  >
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <p>
      Your Privacy Matters: What The Menu? uses AI to translate menu photos you provide. We protect your data and give you control over your information. This policy explains how we handle your photos and personal data with transparency and care.
    </p>

    <h3 className="text-2xl font-black text-coral">Information we collect and why</h3>
    <p>We collect information to provide our AI-powered menu translation service effectively while protecting your privacy:</p>
    
    <h4 className="text-xl font-bold mt-4">Images you upload</h4>
    <p className="mt-2">We do not store your images on our servers. When you scan a menu photo, we securely transmit your image directly to our AI processing partners (including OpenAI, Google Gemini, or Anthropic Claude) for real-time translation. Your images are processed solely for translation purposes and are handled according to our AI partners' data processing policies. We do not retain, save, or store any images you upload to our service.</p>

    <h4 className="text-xl font-bold mt-4">Account information (required for paid features)</h4>
    <p className="mt-2">Account creation is mandatory if you are purchasing any of our paid passes. This is the only way you can utilize the features we provide on our paid accounts. We collect your email address and password to provide enhanced features like translation history, payment processing, and access to premium functionalities. You can use our free tier features without creating an account.</p>

    <h4 className="text-xl font-bold mt-4">Usage and location information</h4>
    <p className="mt-2">We collect technical information to improve our service and for marketing purposes:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li><strong>IP Address:</strong> Automatically collected for security and fraud prevention</li>
      <li><strong>Anonymous Location Data:</strong> We track general geographic regions where our service is being used</li>
      <li><strong>Browser and Device Information:</strong> Technical details to optimize performance</li>
      <li><strong>Usage Patterns:</strong> How you interact with our app to improve user experience</li>
    </ul>
    <p className="mt-2">We use this location and usage data for marketing purposes and to improve the quality of our service, including understanding which regions use our service most and optimizing our AI translation models for different geographic markets.</p>

    <h3 className="text-2xl font-black text-coral">How we use your information</h3>
    <p className="mt-2"><strong>Legal basis (GDPR):</strong> We process your data based on your explicit consent for AI analysis and our legitimate interest in providing and improving our service.</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li><strong>AI Image Processing:</strong> Your uploaded images are transmitted in real-time to AI services (OpenAI, Google Gemini, or Anthropic Claude) to provide menu translations</li>
      <li><strong>Service Improvement:</strong> We analyze usage patterns and location data to enhance translation accuracy and user experience</li>
      <li><strong>Marketing and Analytics:</strong> Location and usage data help us understand our user base and improve our marketing efforts</li>
      <li><strong>Payment Processing:</strong> When you purchase premium features, Stripe processes your payment information securely</li>
      <li><strong>Customer Support:</strong> We use your account information to respond to questions and provide assistance</li>
      <li><strong>Legal Compliance:</strong> We may process data to comply with legal obligations and prevent fraud</li>
    </ul>
    <p className="mt-2"><strong>AI Processing Notice:</strong> We use artificial intelligence from various providers (OpenAI, Google Gemini, Anthropic Claude) to analyze your menu photos. This processing may include object recognition, text extraction, and language translation. While we strive for accuracy, AI translations may contain errors and should be verified independently. We reserve the right to change our AI processing partners at any time without notice.</p>

    <h3 className="text-2xl font-black text-coral">Information sharing and third parties</h3>
    <p className="mt-2">We share your information only as necessary to provide our service:</p>

    <h4 className="text-xl font-bold mt-4">AI Processing Partners</h4>
    <p className="mt-2">We use multiple AI services to process your images for translation, including but not limited to OpenAI, Google Gemini, and Anthropic Claude. Key protections include:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li>Your images are transmitted securely using encryption</li>
      <li>Images are processed in real-time and not stored by us</li>
      <li>Each AI partner has their own data processing and retention policies</li>
      <li>We may change AI processing partners at any time to improve service quality</li>
      <li>Data Processing Agreements ensure compliance with privacy regulations where applicable</li>
    </ul>

    <h4 className="text-xl font-bold mt-4">Stripe (Payment Processing)</h4>
    <p className="mt-2">For premium features, we use Stripe to process payments securely. Stripe is PCI DSS Level 1 certified and maintains strict security standards. We do not store your complete payment information on our servers. We reserve the right to change payment gateways at any time without notice.</p>
    
    <h4 className="text-xl font-bold mt-4">Hosting Infrastructure</h4>
    <p className="mt-2">Our application is hosted on cloud infrastructure that may include services like Netlify, AWS, Google Cloud, or other providers. These services provide data encryption, security monitoring, and compliance certifications. We reserve the right to change our hosting providers at any time without notice to improve service reliability and performance.</p>
    
    <h3 className="text-2xl font-black text-coral">Data retention and security</h3>
    <h4 className="text-xl font-bold mt-4">How long we keep your data</h4>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li><strong>Images:</strong> Not stored by us - transmitted directly to AI partners for processing</li>
      <li><strong>Account Data:</strong> Retained until you delete your account</li>
      <li><strong>Usage and Location Logs:</strong> Retained for 24 months for marketing analysis and service improvement</li>
      <li><strong>Payment Records:</strong> Retained for 7 years for tax and legal compliance</li>
    </ul>
    <h4 className="text-xl font-bold mt-4">Security measures</h4>
    <p className="mt-2">We protect your data using industry-standard security measures:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li>HTTPS encryption for all data transmission to AI partners</li>
      <li>Secure API connections with our AI processing partners</li>
      <li>Regular security monitoring and audits</li>
      <li>Limited access to personal data on a need-to-know basis</li>
      <li>Secure payment processing through certified providers</li>
    </ul>
    <h4 className="text-xl font-bold mt-4">Service provider changes</h4>
    <p className="mt-2"><strong>Important Notice:</strong> We reserve the right to change our hosting providers, AI processing agents (OpenAI, Google Gemini, Anthropic Claude, or others), payment gateways, or any other service providers at any time without prior notice. These changes may be made to improve service quality, reliability, cost-effectiveness, or to add new features. When such changes occur, your data will continue to be protected according to this privacy policy and applicable laws.</p>
    
    <h3 className="text-2xl font-black text-coral">Your privacy rights</h3>
    <p className="mt-2">You have significant control over your personal data:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li><strong>Access and download:</strong> You can request a copy of all personal data we have about you, including account information and usage history.</li>
      <li><strong>Correction and deletion:</strong> You can update account information at any time or request deletion of your data. Since we don't store images, there are no images to delete from our servers.</li>
      <li><strong>Data portability:</strong> You can export your account data in machine-readable format to use with other services.</li>
      <li><strong>Opt-out rights:</strong> You can opt out of non-essential data processing and marketing communications at any time.</li>
    </ul>
    <p className="mt-2"><strong>EU and UK Users:</strong> Under GDPR, you have additional rights including the right to object to automated decision-making, request human review of AI decisions, and file complaints with your local data protection authority.</p>
    
    <h3 className="text-2xl font-black text-coral">International data transfers</h3>
    <p className="mt-2">Your data may be processed in the United States and other countries where our service providers operate. We ensure adequate protection through:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li>Standard Contractual Clauses approved by the European Commission</li>
      <li>EU-US Data Privacy Framework certification where applicable</li>
      <li>Regular compliance monitoring and audits</li>
      <li>Encryption during international data transfers</li>
    </ul>

    <h3 className="text-2xl font-black text-coral">Cookies and tracking</h3>
    <p className="mt-2">We use essential cookies to provide our service and optional cookies to improve your experience:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li><strong>Essential Cookies:</strong> Required for basic functionality (login, preferences)</li>
        <li><strong>Analytics Cookies:</strong> Help us understand usage patterns and location data (with your consent)</li>
        <li><strong>Payment Cookies:</strong> Set by our payment providers for secure payment processing</li>
    </ul>
    <p className="mt-2">You can control cookie preferences in your browser settings or through our cookie consent manager.</p>

    <h3 className="text-2xl font-black text-coral">Marketing and analytics</h3>
    <p className="mt-2">We use the anonymous location data and usage information we collect for:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li>Understanding which geographic regions use our service most frequently</li>
        <li>Optimizing our AI translation models for different markets and languages</li>
        <li>Improving our marketing campaigns and targeting</li>
        <li>Making data-driven decisions about feature development and service improvements</li>
        <li>Analyzing trends in menu translation requests by region</li>
    </ul>

    <h3 className="text-2xl font-black text-coral">Children's privacy</h3>
    <p className="mt-2">Our service is not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.</p>

    <h3 className="text-2xl font-black text-coral">Changes to this policy</h3>
    <p className="mt-2">We may update this privacy policy to reflect changes in our practices, legal requirements, or service providers. We will notify you of significant changes by email (if you have an account) and by posting the updated policy on our website. Your continued use after changes indicates acceptance of the updated policy.</p>

    <h3 className="text-2xl font-black text-coral">Contact us about privacy</h3>
    <p className="mt-2">If you have questions about this privacy policy or how we handle your data:</p>
    <p className="mt-2">Email: <a href="mailto:hello@whatthemenu.com" className="text-coral hover:underline">hello@whatthemenu.com</a></p>
    <p className="mt-2">We will respond to privacy inquiries within 30 days (or 1 month for GDPR requests).</p>
  </LegalPageLayout>
);

const DisclaimerBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-yellow/30 border-4 border-charcoal rounded-2xl p-6 my-6 shadow-[4px_4px_0_#292524]">
        <h3 className="text-2xl font-black text-coral !mt-0">{title}</h3>
        <div className="prose-lg text-charcoal/90 font-medium space-y-4">
            {children}
        </div>
    </div>
);

export const TermsOfUsePage: React.FC = () => (
  <LegalPageLayout 
    title="Terms of Use"
    description="WhatTheMenu terms of use and service agreement. Important disclaimers for AI-powered menu translation and food safety."
    keywords="terms of use, service agreement, WhatTheMenu terms, AI menu scanner terms, food safety disclaimer"
  >
    <h2 className="text-2xl font-black text-coral">1. Introduction</h2>
    <p>Welcome to <strong>whatthemenu.com</strong> ("<strong>WTM</strong>", "<strong>we</strong>", "<strong>our</strong>" or "<strong>us</strong>"). By accessing or using our website, mobile site or any related services (collectively, the "<strong>Services</strong>"), you acknowledge that you have read, understood and agree to be legally bound by these Terms of Use ("<strong>Terms</strong>"). If you do not agree, please do not use the Services.</p>
    <p>Because we rely on a browse‑wrap model (no tick‑box), continued use of WTM after we post or link to these Terms constitutes acceptance.</p>

    <h2 className="text-2xl font-black text-coral">2. Definitions</h2>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li><strong>"AI Output"</strong> – text, data or other material generated by our AI systems in response to a user request.</li>
      <li><strong>"Menu Image"</strong> – any photograph or scan of a menu that a user uploads to WTM.</li>
      <li><strong>"User Content"</strong> – Menu Images plus any comments, feedback or other material a user submits.</li>
      <li><strong>"You"</strong> or <strong>"User"</strong> – the individual accessing the Services, or the company or organisation on whose behalf that individual is acting.</li>
    </ul>

    <h2 className="text-2xl font-black text-coral">3. Eligibility & Accounts</h2>
    <p>WTM is intended for individuals aged <strong>13 years or older</strong> (16 within the EEA/UK). If you create an optional account, you must provide accurate information and keep your login credentials secure. You are responsible for all activity under your account.</p>

    <h2 className="text-2xl font-black text-coral">4. Changes to These Terms</h2>
    <p>We may update these Terms from time to time. Material changes will be highlighted on our homepage for at least 7 days. Your continued use after the effective date constitutes acceptance of the revised Terms.</p>

    <h2 className="text-2xl font-black text-coral">5. Description of the Services</h2>
    <p>WTM lets you upload Menu Images and receive AI‑generated dish explanations in multiple languages. We may add, remove or modify features at any time without liability to you.</p>

    <h2 className="text-2xl font-black text-coral">6. User Obligations & Acceptable Use</h2>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li>You must have all necessary rights to upload each Menu Image.</li>
      <li>You may not upload content that is illegal, defamatory, hateful, infringing, or otherwise prohibited under Australian law.</li>
      <li>No automated scraping, harvesting or bulk‑downloading of AI Output or our database.</li>
      <li>No resale or commercial exploitation of the Services without our written consent.</li>
    </ul>

    <h2 className="text-2xl font-black text-coral">7. Menu Uploads & Licence Grant</h2>
    <p>By submitting a Menu Image or other User Content you:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
      <li>Grant WTM a <strong>world‑wide, non‑exclusive, royalty‑free licence</strong> to host, process, translate, display and analyse that content for the purpose of operating and improving the Services;</li>
      <li>Represent that you own (or have permission to use) all intellectual‑property rights in the content; and</li>
      <li>Agree that this licence survives termination of these Terms solely for archival, security and legal‑compliance purposes.</li>
    </ul>

    <h2 className="text-2xl font-black text-coral">8. AI Output & Important Disclaimers</h2>
    <p>WTM uses large‑language‑model technology to provide dish explanations. While we aim for accuracy, AI Output may contain errors, omissions or outdated information and should be treated as <strong>informational only</strong>. We <em>do not</em> warrant that our explanations are complete, allergen‑safe or culturally authentic. Always verify with the restaurant or a qualified professional before acting on any AI Output.</p>

    <h2 className="text-2xl font-black text-coral">9. Privacy & Data Handling</h2>
    <p>Our <a href="/privacy-policy" className="text-coral hover:underline" rel="noopener">Privacy Policy</a> explains how we collect, use and protect your personal data, including Menu Images, log files, device identifiers and location data. By using WTM, you consent to those practices.</p>

    <h2 className="text-2xl font-black text-coral">10. Intellectual Property</h2>
    <p>The WTM software, code base, databases, logo and trademarks are the exclusive property of LoFi Simplify Pty Ltd (ABN 35340346478) or its licensors. Except for the limited, non‑transferable right to access the Services under these Terms, no licence is granted to you.</p>

    <h2 className="text-2xl font-black text-coral">11. Third‑Party Services & Links</h2>
    <p>The Services rely on hosting (Netlify), backend storage (Supabase), and AI APIs (Google Gemini) operated by third parties. We are not responsible for the content, policies or availability of those providers or of any external links we share.</p>

    <h2 className="text-2xl font-black text-coral">12. Fees & Payments</h2>
    <p>The core WTM service is currently free. We reserve the right to introduce paid plans, credits or usage caps in the future. If we do, we will update these Terms and provide advance notice.</p>

    <h2 className="text-2xl font-black text-coral">13. International Use & Export Compliance</h2>
    <p>You must comply with all local laws when using WTM. The Services may not be used by or for the benefit of individuals or entities subject to Australian, U.S. or other applicable sanctions.</p>

    <h2 className="text-2xl font-black text-coral">14. Consumer Guarantees (Australian Notice)</h2>
    <p>Nothing in these Terms excludes, restricts or modifies any consumer guarantee, right or remedy that cannot be so excluded, restricted or modified under the <em>Competition and Consumer Act 2010 (Cth)</em>.</p>

    <h2 className="text-2xl font-black text-coral">15. Warranty Disclaimers</h2>
    <p>WTM is provided on an <strong>"as‑is" and "as‑available" basis</strong>. To the fullest extent permitted by law we disclaim all warranties, express or implied, including fitness for a particular purpose, non‑infringement, accuracy and uninterrupted availability.</p>

    <h2 className="text-2xl font-black text-coral">16. Limitation of Liability</h2>
    <p>To the maximum extent permitted by law, in no event will WTM, its directors, employees or suppliers be liable for any indirect, incidental, special or consequential damages, or for any loss of profits, data, goodwill or other intangible losses, arising from or relating to the Services. Our aggregate liability under these Terms will not exceed AUD 100, except where consumer law states otherwise.</p>

    <h2 className="text-2xl font-black text-coral">17. Indemnification</h2>
    <p>You agree to indemnify and hold harmless WTM from any claim, loss, liability, demand, damages, costs and expenses (including reasonable legal fees) arising out of or relating to your User Content, breach of these Terms, or violation of any law or third‑party rights.</p>

    <h2 className="text-2xl font-black text-coral">18. Service Modifications & Availability</h2>
    <p>We may modify, suspend or discontinue all or part of the Services at any time. We endeavour to give advance notice of major changes but are not liable for any resulting loss.</p>

    <h2 className="text-2xl font-black text-coral">19. Termination & Suspension</h2>
    <p>We may suspend or terminate your access if we reasonably believe you have breached these Terms. You may stop using the Services at any time. Sections 7, 8, 10, 15–17, 20–23 survive termination.</p>

    <h2 className="text-2xl font-black text-coral">20. Governing Law & Jurisdiction</h2>
    <p>These Terms are governed by the laws of <strong>South Australia</strong>. You agree to submit to the exclusive jurisdiction of the courts of South Australia for any dispute arising out of or relating to the Services.</p>

    <h2 className="text-2xl font-black text-coral">21. Severability & Waiver</h2>
    <p>If any provision of these Terms is found unenforceable, the rest will remain in full effect. Our failure to enforce any right is not a waiver of that right.</p>

    <h2 className="text-2xl font-black text-coral">22. Assignment</h2>
    <p>We may assign or transfer our rights and obligations under these Terms without restriction. You may not assign these Terms without our prior written consent.</p>

    <h2 className="text-2xl font-black text-coral">23. Force Majeure</h2>
    <p>We are not liable for any delay or failure to perform due to causes beyond our reasonable control, including acts of God, natural disasters, war, terrorism, riots, labour disputes, Internet or utility outages.</p>

    <h2 className="text-2xl font-black text-coral">24. Entire Agreement</h2>
    <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and WTM regarding the Services and supersede any prior agreements.</p>

    <h2 className="text-2xl font-black text-coral">25. Contact Information & Notices</h2>
    <p>LoFi Simplify Pty Ltd<br />
    Attn: Legal Department<br />
    2H Queens Road, Camden Park SA 5038, Australia<br />
    Email: <a href="mailto:support@whatthemenu.com" className="text-coral hover:underline">support@whatthemenu.com</a></p>
  </LegalPageLayout>
);