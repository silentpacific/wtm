import type { Handler, HandlerEvent } from "@netlify/functions";
import { sendEmail } from "./shared/emailService";

interface RestaurantWelcomeEmailRequest {
  restaurantId: string;
  email: string;
  restaurantName: string;
  contactPerson?: string;
}

// Restaurant welcome email template
const getRestaurantWelcomeEmailHtml = (restaurantName: string, contactPerson?: string) => {
  const greeting = contactPerson ? `Hi ${contactPerson}` : 'Hello';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to WhatTheMenu - Restaurant Platform</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
            .button:hover { background: #2563EB; }
            .highlight { background: #f0f9ff; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; border-radius: 4px; }
            .feature-list { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature-item { margin: 10px 0; padding-left: 20px; position: relative; }
            .feature-item:before { content: "✓"; color: #059669; font-weight: bold; position: absolute; left: 0; }
            .small-text { font-size: 14px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Welcome to WhatTheMenu!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your restaurant platform is ready</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">🎉 ${greeting}!</h2>
                
                <p>Welcome to WhatTheMenu's restaurant platform! We're excited to help <strong>${restaurantName}</strong> attract more international customers.</p>
                
                <div class="highlight">
                    <strong>🚀 Your 7-day free trial has started!</strong><br>
                    You now have full access to all features with no credit card required.
                </div>
                
                <h3 style="color: #1f2937;">What's Next?</h3>
                
                <div class="feature-list">
                    <div class="feature-item"><strong>Access your dashboard</strong> - Manage your restaurant profile and view analytics</div>
                    <div class="feature-item"><strong>Upload your menu</strong> - Send us photos of your current menu for processing</div>
                    <div class="feature-item"><strong>Get your QR code</strong> - Download and print your permanent QR code</div>
                    <div class="feature-item"><strong>Start attracting customers</strong> - Place QR codes on tables and watch engagement grow</div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://whatthemenu.com/restaurants/dashboard" class="button">Access Your Dashboard</a>
                </div>
                
                <h3 style="color: #1f2937;">What You'll Get</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 8px 0;">🌍 <strong>Multi-language menu page</strong> - English, Chinese, Spanish, French</li>
                    <li style="margin: 8px 0;">⚠️ <strong>Allergen information</strong> - AI-powered allergen detection</li>
                    <li style="margin: 8px 0;">📱 <strong>Mobile-optimized design</strong> - Perfect for tourists on phones</li>
                    <li style="margin: 8px 0;">🔗 <strong>Permanent QR code</strong> - Never changes, works forever</li>
                    <li style="margin: 8px 0;">📊 <strong>Basic analytics</strong> - See how many people view your menu</li>
                    <li style="margin: 8px 0;">🔄 <strong>Easy menu updates</strong> - Just email us new menu photos</li>
                </ul>
                
                <div class="highlight">
                    <strong>💡 Pro Tip:</strong> Target tourist areas and international customers. Many Adelaide restaurants see a 20-30% increase in international orders after implementing QR menu translations!
                </div>
                
                <h3 style="color: #1f2937;">Need Help?</h3>
                <p>Our team is here to help you succeed:</p>
                <ul>
                    <li><strong>Email support:</strong> hello@whatthemenu.com</li>
                    <li><strong>Setup assistance:</strong> We'll help you upload your first menu</li>
                    <li><strong>Best practices:</strong> Tips for maximizing international customer engagement</li>
                </ul>
                
                <p>Thanks for joining WhatTheMenu! We're excited to help ${restaurantName} reach more customers.</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>The WhatTheMenu Team</strong><br>
                    <span class="small-text">Adelaide, Australia</span>
                </p>
            </div>
            
            <div class="footer">
                <p class="small-text" style="margin: 0;">
                    You're receiving this email because you signed up for WhatTheMenu's restaurant platform.<br>
                    Questions? Reply to this email or contact hello@whatthemenu.com
                </p>
                <p class="small-text" style="margin: 10px 0 0 0;">
                    <a href="https://whatthemenu.com/restaurants" style="color: #6b7280;">Restaurant Platform</a> • 
                    <a href="https://whatthemenu.com/terms" style="color: #6b7280;">Terms</a> • 
                    <a href="https://whatthemenu.com/privacy-policy" style="color: #6b7280;">Privacy</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Plain text version
const getRestaurantWelcomeEmailText = (restaurantName: string, contactPerson?: string) => {
  const greeting = contactPerson ? `Hi ${contactPerson}` : 'Hello';
  
  return `
${greeting}!

Welcome to WhatTheMenu's restaurant platform! We're excited to help ${restaurantName} attract more international customers.

🚀 YOUR 7-DAY FREE TRIAL HAS STARTED!
You now have full access to all features with no credit card required.

WHAT'S NEXT?
✓ Access your dashboard - Manage your restaurant profile and view analytics
✓ Upload your menu - Send us photos of your current menu for processing
✓ Get your QR code - Download and print your permanent QR code
✓ Start attracting customers - Place QR codes on tables and watch engagement grow

ACCESS YOUR DASHBOARD:
https://whatthemenu.com/restaurants/dashboard

WHAT YOU'LL GET:
🌍 Multi-language menu page (English, Chinese, Spanish, French)
⚠️ Allergen information (AI-powered allergen detection)
📱 Mobile-optimized design (Perfect for tourists on phones)
🔗 Permanent QR code (Never changes, works forever)
📊 Basic analytics (See how many people view your menu)
🔄 Easy menu updates (Just email us new menu photos)

💡 PRO TIP: Target tourist areas and international customers. Many Adelaide restaurants see a 20-30% increase in international orders after implementing QR menu translations!

NEED HELP?
• Email support: hello@whatthemenu.com
• Setup assistance: We'll help you upload your first menu
• Best practices: Tips for maximizing international customer engagement

Thanks for joining WhatTheMenu! We're excited to help ${restaurantName} reach more customers.

Best regards,
The WhatTheMenu Team
Adelaide, Australia

---
You're receiving this email because you signed up for WhatTheMenu's restaurant platform.
Questions? Reply to this email or contact hello@whatthemenu.com

Restaurant Platform: https://whatthemenu.com/restaurants
Terms: https://whatthemenu.com/terms
Privacy: https://whatthemenu.com/privacy-policy
  `;
};

export const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // Parse request body
    const body: RestaurantWelcomeEmailRequest = JSON.parse(event.body || '{}');
    
    const { restaurantId, email, restaurantName, contactPerson } = body;

    // Validate required fields
    if (!restaurantId || !email || !restaurantName) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Missing required fields: restaurantId, email, and restaurantName are required' 
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    console.log(`🏪 Sending restaurant welcome email to: ${email} for ${restaurantName}`);

    // Prepare email content
    const htmlContent = getRestaurantWelcomeEmailHtml(restaurantName, contactPerson);
    const textContent = getRestaurantWelcomeEmailText(restaurantName, contactPerson);

    // Send welcome email
    const emailResult = await sendEmail({
      to: email,
      subject: `Welcome to WhatTheMenu - ${restaurantName}!`,
      html: htmlContent,
      text: textContent,
      from: 'WhatTheMenu Restaurant Team <hello@whatthemenu.com>',
      emailType: 'restaurant_welcome',
      recipientId: restaurantId
    });

    if (!emailResult.success) {
      console.error('❌ Failed to send restaurant welcome email:', emailResult.error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Failed to send welcome email',
          details: emailResult.error 
        })
      };
    }

    console.log(`✅ Restaurant welcome email sent successfully to ${email} (${emailResult.messageId})`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Restaurant welcome email sent successfully',
        messageId: emailResult.messageId
      })
    };

  } catch (error) {
    console.error('❌ Error in restaurant-welcome-email function:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    };
  }
};