import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface RestaurantWelcomeEmailRequest {
  email: string;
  businessName: string;
  slug: string;
  trialExpiresAt: string;
}

export const handler: Handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, businessName, slug, trialExpiresAt }: RestaurantWelcomeEmailRequest = JSON.parse(event.body || '{}');

    if (!email || !businessName || !slug) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const trialExpiryDate = new Date(trialExpiresAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const restaurantUrl = `https://whatthemenu.com/restaurants/${slug}`;
    const dashboardUrl = `https://whatthemenu.com/restaurant/dashboard`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to WhatTheMenu for Restaurants</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to WhatTheMenu!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your restaurant is now live and accessible to international customers</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none;">
            <h2 style="color: #333; margin-top: 0;">Hello ${businessName}! 🎉</h2>
            
            <p>Congratulations! Your restaurant account has been successfully created. You now have access to WhatTheMenu's platform that helps international customers understand your menu in their preferred language.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #28a745;">Your 30-Day Free Trial is Now Active</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Trial expires: <strong>${trialExpiryDate}</strong></li>
                    <li>Full access to all features during trial</li>
                    <li>No payment required until trial ends</li>
                    <li>Cancel anytime with 30-day notice</li>
                </ul>
            </div>

            <h3 style="color: #333;">Your Restaurant Details:</h3>
            <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Restaurant:</strong> ${businessName}</p>
                <p style="margin: 5px 0;"><strong>Public Page:</strong> <a href="${restaurantUrl}" style="color: #007bff;">${restaurantUrl}</a></p>
                <p style="margin: 5px 0;"><strong>Management Dashboard:</strong> <a href="${dashboardUrl}" style="color: #007bff;">${dashboardUrl}</a></p>
            </div>

            <h3 style="color: #333;">Quick Start Guide:</h3>
            <ol style="padding-left: 20px;">
                <li><strong>Complete Your Profile:</strong> Add your address, opening hours, and restaurant description</li>
                <li><strong>Upload Your Menu:</strong> Add your dishes with prices and descriptions</li>
                <li><strong>Generate QR Codes:</strong> Download QR codes for your tables</li>
                <li><strong>Test Customer Experience:</strong> Scan your QR codes to see how customers will interact with your menu</li>
                <li><strong>Train Your Staff:</strong> Show your team how customers will use the "Show this to waiter" feature</li>
            </ol>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Access Your Dashboard</a>
            </div>

            <h3 style="color: #333;">What Makes WhatTheMenu Special:</h3>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>🌍 Multi-Language Support:</strong> Automatic explanations in English, Spanish, Chinese, and French</p>
                <p style="margin: 5px 0;"><strong>♿ Accessibility First:</strong> Designed specifically for deaf and hard-of-hearing customers</p>
                <p style="margin: 5px 0;"><strong>📱 Communication Tool:</strong> Helps customers communicate their orders to your staff</p>
                <p style="margin: 5px 0;"><strong>🚫 Allergen Safety:</strong> Clear allergen warnings and dietary information</p>
            </div>

            <h3 style="color: #333;">Need Help?</h3>
            <p>Our team is here to support you:</p>
            <ul style="padding-left: 20px;">
                <li>📧 Email: <a href="mailto:restaurants@whatthemenu.com" style="color: #007bff;">restaurants@whatthemenu.com</a></li>
                <li>📞 Phone Support: Available during business hours</li>
                <li>💬 In-dashboard help: Click the help button in your dashboard</li>
                <li>📖 Documentation: Comprehensive guides available in your account</li>
            </ul>

            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;"><strong>💡 Pro Tip:</strong> International customers love knowing they can understand your menu before visiting. Share your public menu link on social media and your website to attract more international diners!</p>
            </div>

            <p style="margin-top: 30px;">Welcome to the WhatTheMenu family! We're excited to help you serve customers from around the world.</p>
            
            <p style="margin-bottom: 0;">Best regards,<br>
            <strong>The WhatTheMenu Team</strong></p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
            <p style="margin: 0;">© 2025 WhatTheMenu. Built with ❤️ for restaurants and international diners.</p>
            <p style="margin: 5px 0 0 0;">
                <a href="${dashboardUrl}" style="color: #007bff; text-decoration: none;">Dashboard</a> | 
                <a href="https://whatthemenu.com/terms" style="color: #007bff; text-decoration: none;">Terms</a> | 
                <a href="https://whatthemenu.com/privacy-policy" style="color: #007bff; text-decoration: none;">Privacy</a>
            </p>
        </div>
    </body>
    </html>
    `;

    const result = await resend.emails.send({
      from: 'WhatTheMenu Restaurants <restaurants@whatthemenu.com>',
      to: [email],
      subject: `Welcome to WhatTheMenu, ${businessName}! Your trial is now active 🎉`,
      html: htmlContent,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true, 
        messageId: result.data?.id 
      }),
    };

  } catch (error) {
    console.error('Error sending restaurant welcome email:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to send welcome email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};