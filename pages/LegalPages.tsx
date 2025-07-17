
import React from 'react';

const LegalPageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-12 sm:py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="font-black text-5xl text-charcoal sm:text-6xl tracking-tighter mb-10">{title}</h1>
      <div className="text-charcoal/90 text-lg space-y-4">
        {children}
      </div>
    </div>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => (
  <LegalPageLayout title="Privacy Policy">
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
  <LegalPageLayout title="Terms of Use">
    <p>Welcome to What The Menu? These terms govern your use of our AI-powered menu translation service. By using our app, you agree to these terms. We've written them in plain language to be clear about your rights and responsibilities.</p>
    
    <h3 className="text-2xl font-black text-coral">Our service and what we provide</h3>
    <p className="mt-2">What The Menu? is an AI-powered application that translates menu photos into your preferred language. We use advanced artificial intelligence to analyze your uploaded images and provide translation services.</p>
    
    <h4 className="text-xl font-bold mt-4">Service features</h4>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li><strong>Free Tier:</strong> 5 menu scans per month at no cost</li>
        <li><strong>Daily Pass:</strong> $1 for unlimited scans for 24 hours</li>
        <li><strong>Weekly Pass:</strong> $5 for unlimited scans for 7 days</li>
        <li><strong>Optional Accounts:</strong> Create an account for enhanced features or use without registration</li>
    </ul>

    <DisclaimerBlock title="IMPORTANT AI AND FOOD SAFETY DISCLAIMER:">
        <p>This application uses artificial intelligence to translate food and menu information. AI translations may contain errors, omissions, or inaccuracies. Users with food allergies, dietary restrictions, or medical conditions must always verify ingredient and allergen information directly with restaurant staff before consuming any food. We strongly recommend never relying solely on AI translations for health-critical dietary decisions.</p>
    </DisclaimerBlock>

    <h3 className="text-2xl font-black text-coral">AI accuracy and food information limits</h3>
    <p className="mt-2">Our AI translation service aims for accuracy but has important limitations you must understand:</p>
    <h4 className="text-xl font-bold mt-4">AI processing limitations</h4>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li>AI may misinterpret complex menu descriptions or regional food terms</li>
        <li>Allergen identification and translation may be incomplete or incorrect</li>
        <li>Cross-contamination risks cannot be assessed through menu photos</li>
        <li>Preparation methods and hidden ingredients are not visible in images</li>
        <li>Cultural context and cooking techniques may be lost in translation</li>
    </ul>

    <DisclaimerBlock title="ALLERGEN AND DIETARY RESTRICTION WARNING:">
        <>
            <p>NEVER rely solely on this app for life-threatening dietary decisions. If you have food allergies, celiac disease, or other dietary restrictions:</p>
            <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
                <li>Always inform restaurant staff of your specific allergies or dietary needs</li>
                <li>Request to speak directly with kitchen staff when necessary</li>
                <li>Carry emergency medication if you have severe allergies</li>
                <li>Understand that cross-contamination may occur in restaurant kitchens</li>
                <li>Exercise extreme caution and always verify information independently</li>
            </ul>
        </>
    </DisclaimerBlock>

    <h3 className="text-2xl font-black text-coral">Your responsibilities and acceptable use</h3>
    <p className="mt-2">When using What The Menu?, you agree to:</p>
    <h4 className="text-xl font-bold mt-4">Image upload responsibilities</h4>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li>Only upload images you own or have permission to use</li>
        <li>Not upload inappropriate, offensive, or illegal content</li>
        <li>Respect intellectual property rights of menu creators and restaurants</li>
        <li>Not attempt to reverse-engineer or disrupt our AI systems</li>
    </ul>
    <h4 className="text-xl font-bold mt-4">Account responsibilities (if applicable)</h4>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li>Provide accurate registration information</li>
        <li>Maintain the security of your account credentials</li>
        <li>Notify us immediately of any unauthorized account access</li>
        <li>Use the service only for personal, non-commercial purposes</li>
    </ul>

    <h3 className="text-2xl font-black text-coral">Payment terms and billing</h3>
    <h4 className="text-xl font-bold mt-4">Pricing and payments</h4>
    <p className="mt-2">We use Stripe as our payment processor to handle all transactions securely. By providing payment information, you authorize us to charge your payment method for the services you select.</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li><strong>Daily Pass:</strong> $1 charged immediately, expires after 24 hours</li>
        <li><strong>Weekly Pass:</strong> $5 charged immediately, expires after 7 days</li>
        <li><strong>Free Tier:</strong> No payment required, limited to 5 scans per month</li>
    </ul>
    <h4 className="text-xl font-bold mt-4">International users and currency</h4>
    <p className="mt-2">Prices are listed in USD. International users may be subject to currency conversion fees from their bank or payment provider. Additional taxes may apply based on your location.</p>
    <h4 className="text-xl font-bold mt-4">Auto-Renewal Notice</h4>
    <p className="mt-2">Our daily and weekly passes do not auto-renew. Each pass expires at the stated time and requires a new purchase for continued premium access. You will not be charged recurring fees unless you manually purchase additional passes.</p>
    
    <h3 className="text-2xl font-black text-coral">Refund policy</h3>
    <p className="mt-2">We want you to be satisfied with our service. Here's our refund policy:</p>
    <h4 className="text-xl font-bold mt-4">Refund eligibility</h4>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li>Refunds may be requested within 24 hours of purchase</li>
        <li>Technical issues preventing service use are eligible for full refunds</li>
        <li>Dissatisfaction with AI translation accuracy is not grounds for refund</li>
        <li>Partial usage does not disqualify refund requests</li>
    </ul>
    <h4 className="text-xl font-bold mt-4">Refund process</h4>
    <p className="mt-2">To request a refund, contact us at <a href="mailto:support@whatthemenu.com" className="text-coral hover:underline">support@whatthemenu.com</a> with your purchase details. Approved refunds will be processed within 5 business days to your original payment method. Stripe processing fees are non-refundable. Refunds typically appear on your statement within 5-10 business days depending on your bank.</p>

    <DisclaimerBlock title="MEDICAL DISCLAIMER:">
        <>
            <p>This application is for informational purposes only and does not provide medical advice, diagnosis, or treatment. The information provided should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified healthcare provider with any questions regarding a medical condition or dietary needs.</p>
            <p>If you have a medical emergency or experience an allergic reaction, call emergency services immediately (911 in the US, or your local emergency number). Never disregard professional medical advice or delay seeking medical attention because of information provided by this application.</p>
        </>
    </DisclaimerBlock>

    <h3 className="text-2xl font-black text-coral">Intellectual property rights</h3>
    <h4 className="text-xl font-bold mt-4">Your content</h4>
    <p className="mt-2">You retain ownership of images you upload. By using our service, you grant us a limited license to process your images for translation purposes only. We do not claim ownership of your content and will not use your images for any purpose other than providing translation services.</p>
    <h4 className="text-xl font-bold mt-4">Our content</h4>
    <p className="mt-2">What The Menu?, our logo, and translation outputs are protected by intellectual property laws. You may use translation outputs for personal purposes but may not redistribute, sell, or use them commercially without permission.</p>

    <h3 className="text-2xl font-black text-coral">Limitation of liability and disclaimers</h3>
    <p className="mt-2"><strong>SERVICE PROVIDED "AS IS":</strong> What The Menu? is provided without warranties of any kind, express or implied. We do not guarantee the accuracy, completeness, or reliability of AI translations or any other aspect of our service.</p>
    <p className="mt-2"><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WHAT THE MENU? SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR PERSONAL INJURY, ALLERGIC REACTIONS, FOOD POISONING, OR MEDICAL EXPENSES RESULTING FROM USE OF THIS APPLICATION OR RELIANCE ON INFORMATION PROVIDED HEREIN.</strong></p>
    <h4 className="text-xl font-bold mt-4">Maximum liability</h4>
    <p className="mt-2">In jurisdictions that do not allow the exclusion of liability, our total liability to you for all claims arising from use of our service shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

    <h3 className="text-2xl font-black text-coral">Data processing and privacy</h3>
    <p className="mt-2">Your privacy is important to us. Our data processing practices are governed by our Privacy Policy, which is incorporated into these terms by reference. Key points:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li>Images are processed using OpenAI's AI services for translation</li>
        <li>Images are automatically deleted within 30 days</li>
        <li>Account creation is optional for basic functionality</li>
        <li>We comply with GDPR, CCPA, and other applicable privacy laws</li>
    </ul>

    <h3 className="text-2xl font-black text-coral">Third-party services and integrations</h3>
    <h4 className="text-xl font-bold mt-4">OpenAI integration</h4>
    <p className="mt-2">We use OpenAI's services for AI processing. Your images are transmitted to OpenAI's servers for analysis. OpenAI's terms and privacy policy also apply to this processing. Key protections include data encryption, limited retention periods, and no use of your data for model training.</p>
    <h4 className="text-xl font-bold mt-4">Stripe payment processing</h4>
    <p className="mt-2">Payment processing is handled by Stripe, Inc. Stripe's terms of service and privacy policy govern payment processing. We do not store your complete payment information on our servers.</p>

    <h3 className="text-2xl font-black text-coral">International users and governing law</h3>
    <p className="mt-2">What The Menu? is available to users worldwide. However, you are responsible for compliance with your local laws when using our service.</p>
    <h4 className="text-xl font-bold mt-4">Governing law</h4>
    <p className="mt-2">These terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration in [Your Jurisdiction], except where prohibited by local law.</p>
    <h4 className="text-xl font-bold mt-4">EU and UK users</h4>
    <p className="mt-2">EU and UK users have additional consumer protection rights that cannot be waived by these terms. Nothing in these terms limits your statutory rights under applicable consumer protection laws.</p>

    <h3 className="text-2xl font-black text-coral">Account termination and service changes</h3>
    <h4 className="text-xl font-bold mt-4">Termination</h4>
    <p className="mt-2">You may stop using our service at any time. We may suspend or terminate your access for violations of these terms, illegal activity, or at our discretion with reasonable notice.</p>
    <h4 className="text-xl font-bold mt-4">Service modifications</h4>
    <p className="mt-2">We may modify, suspend, or discontinue any aspect of our service at any time. We will provide reasonable notice of significant changes that affect your use of the service.</p>

    <h3 className="text-2xl font-black text-coral">Dispute resolution and consumer rights</h3>
    <h4 className="text-xl font-bold mt-4">Customer support</h4>
    <p className="mt-2">Before pursuing formal dispute resolution, please contact our customer support team at <a href="mailto:support@whatthemenu.com" className="text-coral hover:underline">support@whatthemenu.com</a>. We're committed to resolving issues quickly and fairly.</p>
    <h4 className="text-xl font-bold mt-4">Your rights</h4>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li>Right to cancel purchases within our refund policy terms</li>
        <li>Right to access, modify, or delete your personal data</li>
        <li>Right to file complaints with relevant consumer protection authorities</li>
        <li>Right to seek resolution through appropriate legal channels</li>
    </ul>

    <h3 className="text-2xl font-black text-coral">Updates to these terms</h3>
    <p className="mt-2">We may update these terms periodically to reflect changes in our service, legal requirements, or business practices. We will notify you of significant changes by email (if you have an account) or through prominent notice in our app. Your continued use after changes indicates acceptance of the updated terms.</p>

    <h3 className="text-2xl font-black text-coral">Contact information</h3>
    <p className="mt-2">Questions about these terms? Contact us:</p>
    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
        <li>General Support: <a href="mailto:support@whatthemenu.com" className="text-coral hover:underline">support@whatthemenu.com</a></li>
        <li>Legal Questions: <a href="mailto:legal@whatthemenu.com" className="text-coral hover:underline">legal@whatthemenu.com</a></li>
        <li>Billing Issues: <a href="mailto:billing@whatthemenu.com" className="text-coral hover:underline">billing@whatthemenu.com</a></li>
    </ul>
    <p className="mt-2">We will respond to inquiries within 2 business days.</p>
  </LegalPageLayout>
);


export const FaqPage: React.FC = () => (
    <LegalPageLayout title="Frequently Asked Questions">
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-black text-coral">How does it work?</h3>
                <p className="mt-2">Simply upload an image of a menu or use your camera to take a picture. Our AI, powered by Google's Gemini, will analyze the menu and provide detailed explanations for each dish it identifies.</p>
            </div>
            <div>
                <h3 className="text-2xl font-black text-coral">Is the information always accurate?</h3>
                <p className="mt-2">The explanations are AI-generated and are usually very accurate, but they are for informational purposes only. For critical information like allergens or specific dietary needs (e.g., celiac disease), you should ALWAYS confirm with the restaurant staff.</p>
            </div>
             <div>
                <h3 className="text-2xl font-black text-coral">Do you store my images?</h3>
                <p className="mt-2">No. Your menu images are sent for processing and are not stored on our servers. We value your privacy.</p>
            </div>
            <div>
                <h3 className="text-2xl font-black text-coral">What languages does it support?</h3>
                <p className="mt-2">The app works with menus in all major languages. The AI is trained on a vast dataset and can understand most written languages.</p>
            </div>
        </div>
    </LegalPageLayout>
);
