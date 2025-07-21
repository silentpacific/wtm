// netlify/functions/shared/emailTemplates.ts

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  welcome: (userName: string, verificationLink?: string): EmailTemplate => ({
    subject: "Welcome to WhatTheMenu!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to WhatTheMenu</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b, #ffa500); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to WhatTheMenu!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered menu scanning companion</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; border: 4px solid #292524; box-shadow: 8px 8px 0px #292524;">
          <h2 style="color: #292524; margin-top: 0;">Hi ${userName}!</h2>
          
          <p>Welcome to WhatTheMenu! We're thrilled to have you try us out. Food is about culture and appreciation that starts with understanding what you're about to eat!</p>
          
          <h3 style="color: #ff6b6b; margin-top: 30px;">Here's what you can do:</h3>
          <ul style="padding-left: 20px;">
            <li><strong>Upload an image or take a picture of a menu</strong></li>
            <li><strong>Select the language you're comfortable with</strong></li>
            <li><strong>Tap on a dish to get an explanation</strong></li>
            <li><strong>Find allergen info</strong></li>
            <li><strong>Eat Confidently, no matter where you are in the world!</strong></li>
          </ul>
          
          ${verificationLink ? `
          <div style="background: #fef3f3; border: 2px solid #ff6b6b; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <h3 style="color: #ff6b6b; margin-top: 0;">Verify Your Email</h3>
            <p style="margin-bottom: 20px;">Click the button below to verify your email and unlock all features:</p>
            <a href="${verificationLink}" style="display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 3px solid #292524; box-shadow: 4px 4px 0px #292524;">Verify Email Address</a>
          </div>
          ` : ''}
          
          <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p>Ready to start? <a href="https://whatthemenu.com" style="display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 3px solid #292524; box-shadow: 4px 4px 0px #292524; margin: 10px 0;">Try it Now</a></p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Want to know more? Check out our <a href="https://whatthemenu.com/#/faq" style="color: #ff6b6b;">FAQs</a>.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>© 2025 WhatTheMenu. Made with ❤️ in Adelaide, Australia.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to WhatTheMenu!

Hi ${userName}!

Welcome to WhatTheMenu! We're thrilled to have you try us out. Food is about culture and appreciation that starts with understanding what you're about to eat!

Here's what you can do:
• Upload an image or take a picture of a menu
• Select the language you're comfortable with
• Tap on a dish to get an explanation
• Order confidently

${verificationLink ? `Verify Your Email
Click this link to verify your email and unlock all features: ${verificationLink}` : ''}

Ready to start? Visit: https://whatthemenu.com

Want to know more? Check out our FAQs: https://whatthemenu.com/faq

© 2025 WhatTheMenu. Made with ❤️ in Adelaide, Australia.
    `
  }),

  purchaseConfirmation: (userName: string, planName: string, amount: number, expiryDate: string): EmailTemplate => ({
    subject: "Thank you for your WhatTheMenu purchase! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Thank You! 🎉</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your purchase was successful</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; border: 4px solid #292524; box-shadow: 8px 8px 0px #292524;">
          <h2 style="color: #292524; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p>Thank you for upgrading to <strong>${planName}</strong>! Your payment has been processed successfully and you now have access to all premium features.</p>
          
          <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #059669; margin-top: 0;">📋 Purchase Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Plan:</strong> ${planName}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</li>
              <li style="padding: 8px 0;"><strong>Valid Until:</strong> ${expiryDate}</li>
            </ul>
          </div>
          
          <h3 style="color: #ff6b6b; margin-top: 30px;">🚀 What's Unlocked:</h3>
          <ul style="padding-left: 20px;">
            <li><strong>Unlimited menu scans</strong> - No more limits!</li>
            <li><strong>Priority support</strong> - Get help faster when you need it</li>
            <li><strong>Export capabilities</strong> - Save and share your discoveries</li>
          </ul>
          
          <div style="background: #fef3f3; border: 2px solid #ff6b6b; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <h3 style="color: #ff6b6b; margin-top: 0;">🍽️ Ready to Explore?</h3>
            <p style="margin-bottom: 20px;">Start using your premium features right away:</p>
            <a href="https://whatthemenu.com" style="display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 3px solid #292524; box-shadow: 4px 4px 0px #292524;">Start Scanning Menus</a>
          </div>
          
          <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px;">
              Questions about your purchase? Reply to this email or visit our <a href="https://whatthemenu.com/#/contact" style="color: #ff6b6b;">support page</a>.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>© 2025 WhatTheMenu. Made with ❤️ in Adelaide, Australia.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Thank You for Your Purchase! 🎉

Hi ${userName}!

Thank you for upgrading to ${planName}! Your payment has been processed successfully and you now have access to all premium features.

📋 Purchase Details:
• Plan: ${planName}
• Amount: $${(amount / 100).toFixed(2)}
• Valid Until: ${expiryDate}

🚀 What's Unlocked:
• Unlimited menu scans - No more daily limits!
• Priority support - Get help faster when you need it

Ready to explore? Start using your premium features: https://whatthemenu.com

Questions about your purchase? Reply to this email or visit our support page: https://whatthemenu.com/contact

© 2025 WhatTheMenu. Made with ❤️  in Adelaide, Australia.
    `
  }),

  subscriptionExpiring: (userName: string, planName: string, expiryDate: string, renewalLink: string): EmailTemplate => ({
    subject: "⏰ Your WhatTheMenu subscription expires in 1 hour",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Expiring Soon</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">⏰ Renewal Reminder</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your subscription expires soon</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; border: 4px solid #292524; box-shadow: 8px 8px 0px #292524;">
          <h2 style="color: #292524; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p>This is a friendly reminder that your <strong>${planName}</strong> subscription expires in just <strong>1 hour</strong> (${expiryDate}).</p>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #d97706; margin-top: 0;">⚠️ What happens when it expires:</h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li>You won't be able to scan any more menus if you've exhausted your free limits</strong></li>
              <li>Priority support will no longer be available</li>
            </ul>
          </div>
          
          <h3 style="color: #10b981; margin-top: 30px;">✨ Keep enjoying unlimited access:</h3>
          <ul style="padding-left: 20px;">
            <li><strong>Unlimited menu scans</strong> - Never hit limits again</li>
            <li><strong>Advanced explanations</strong> - Get detailed dish information</li>
            <li><strong>Priority support</strong> - Fast help when you need it</li>
            <li><strong>Restaurant history</strong> - Track all your discoveries</li>
          </ul>
          
          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <h3 style="color: #059669; margin-top: 0;">🔄 Renew Now</h3>
            <p style="margin-bottom: 20px;">Continue your premium experience with one click:</p>
            <a href="${renewalLink}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 3px solid #292524; box-shadow: 4px 4px 0px #292524;">Renew Subscription</a>
          </div>
          
          <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px;">
              Questions about renewal? Reply to this email or visit our <a href="https://whatthemenu.com/#/contact" style="color: #ff6b6b;">support page</a>.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>© 2025 WhatTheMenu. Made with ❤️ in Adelaide, Australia.</p>
        </div>
      </body>
      </html>
    `,
    text: `
⏰ Subscription Renewal Reminder

Hi ${userName}!

This is a friendly reminder that your ${planName} subscription expires in just 1 hour (${expiryDate}).

⚠️ What happens when it expires:
• You'll be limited to 5 menu scans per day
• Priority support will no longer be available

✨ Keep enjoying unlimited access:
• Unlimited menu scans - Never hit limits again
• Priority support - Fast help when you need it

🔄 Renew now to continue your premium experience: ${renewalLink}

Questions about renewal? Reply to this email or visit our support page: https://whatthemenu.com/contact

© 2025 WhatTheMenu. Made with ❤️  in Adelaide, Australia.
    `
  }),

  contactConfirmation: (userName: string, userEmail: string, message: string, submissionId: number): EmailTemplate => ({
    subject: "We received your message! 📬",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Received</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Message Received! 📬</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">We'll get back to you soon</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; border: 4px solid #292524; box-shadow: 8px 8px 0px #292524;">
          <h2 style="color: #292524; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p>Thank you for reaching out to WhatTheMenu! We've received your message and our team will get back to you within <strong>24 hours</strong>.</p>
          
          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #475569; margin-top: 0;">📝 Your Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #6366f1;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #64748b; font-size: 14px; margin: 15px 0 0 0;">
              <strong>Reference ID:</strong> #${submissionId} | <strong>From:</strong> ${userEmail}
            </p>
          </div>
          
          <h3 style="color: #ff6b6b; margin-top: 30px;">🚀 While you wait:</h3>
          <ul style="padding-left: 20px;">
            <li>Check out our <a href="https://whatthemenu.com/#/faq" style="color: #ff6b6b;">FAQ page</a> for common questions</li>
            <li>Try scanning a new menu to explore more dishes</li>
            <li>Know someone who will find this app useful? Send them the link</li>
          </ul>
          
          <div style="background: #fef3f3; border: 2px solid #ff6b6b; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <h3 style="color: #ff6b6b; margin-top: 0;">🍽️ Keep Exploring</h3>
            <p style="margin-bottom: 20px;">Continue discovering amazing dishes:</p>
            <a href="https://whatthemenu.com" style="display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 3px solid #292524; box-shadow: 4px 4px 0px #292524;">Scan More Menus</a>
          </div>
          
          <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px;">
              This is an automated confirmation. Please don't reply to this email - we'll respond to your original message soon!
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>© 2025 WhatTheMenu. Made with ❤️ in Adelaide, Australia</p>
        </div>
      </body>
      </html>
    `,
    text: `
Message Received! 📬

Hi ${userName}!

Thank you for reaching out to WhatTheMenu! We've received your message and our team will get back to you within 24 hours.

📝 Your Message:
"${message}"

Reference ID: #${submissionId} | From: ${userEmail}

🚀 While you wait:
• Check out our FAQ page for common questions: https://whatthemenu.com/faq
• Try scanning a new menu to explore more dishes
• Know someone who will find this app useful? Send them the link

Keep exploring: https://whatthemenu.com

This is an automated confirmation. Please don't reply to this email - we'll respond to your original message soon!

© 2025 WhatTheMenu. Made with ❤️ in Adelaide, Australia.
    `
  })
};