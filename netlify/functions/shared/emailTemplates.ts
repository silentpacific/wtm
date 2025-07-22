// netlify/functions/shared/emailTemplates.ts

export const emailTemplates = {
  welcome: (userName: string, verificationLink?: string) => {
    const subject = "🍽️ Welcome to What The Menu? - Your AI Menu Translator!";
    
    // Since we're using magic links, we don't need verification links
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to What The Menu?</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fef3c7;
            color: #292524;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fef3c7;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            background-color: #fbbf24;
            border: 4px solid #292524;
            border-radius: 16px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            color: #292524;
            margin: 0;
          }
          .subtitle {
            font-size: 16px;
            font-weight: bold;
            color: #57534e;
            margin: 5px 0 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border: 4px solid #292524;
            border-radius: 16px;
            margin-bottom: 20px;
            box-shadow: 8px 8px 0px #292524;
          }
          .greeting {
            font-size: 24px;
            font-weight: 900;
            color: #292524;
            margin-bottom: 20px;
          }
          .text {
            font-size: 16px;
            line-height: 1.6;
            color: #292524;
            margin-bottom: 20px;
          }
          .feature-list {
            background-color: #fef3c7;
            padding: 20px;
            border: 2px solid #fbbf24;
            border-radius: 12px;
            margin: 20px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            font-weight: bold;
          }
          .feature-icon {
            font-size: 24px;
            margin-right: 12px;
          }
          .cta-button {
            display: inline-block;
            background-color: #f87171;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            font-weight: 900;
            border-radius: 8px;
            border: 2px solid #292524;
            box-shadow: 4px 4px 0px #292524;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #57534e;
            font-size: 14px;
          }
          .warning {
            background-color: #fbbf24;
            padding: 20px;
            border: 2px solid #d97706;
            border-radius: 12px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍽️</div>
            <h1 class="title">What The Menu?</h1>
            <p class="subtitle">AI-powered menu translator</p>
          </div>
          
          <div class="content">
            <h2 class="greeting">Welcome aboard, ${userName}! 🎉</h2>
            
            <p class="text">
              Thanks for joining What The Menu? You're now part of a community that's making dining out easier and more enjoyable around the world!
            </p>
            
            <p class="text">
              With your free account, you can:
            </p>
            
            <div class="feature-list">
              <div class="feature-item">
                <span class="feature-icon">📸</span>
                <span>Scan up to 5 menu photos per day</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🤖</span>
                <span>Get AI-powered explanations of dishes</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🚨</span>
                <span>Identify allergens and dietary restrictions</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🌍</span>
                <span>Understand cuisines from around the world</span>
              </div>
            </div>
            
            <p class="text">
              Ready to decode your first menu? Head over to whatthemenu.com and start exploring!
            </p>
            
            <div style="text-align: center;">
              <a href="https://whatthemenu.com" class="cta-button">
                Start Scanning Menus 🍽️
              </a>
            </div>
            
            <div class="warning">
              ⚠️ <strong>Important:</strong> Always double-check with the restaurant regarding possible allergens. Our AI is helpful but not infallible!
            </div>
            
            <p class="text">
              Need more scans? Check out our affordable daily and weekly plans for unlimited menu scanning.
            </p>
            
            <p class="text">
              Happy dining! 🥘<br>
              The What The Menu? Team
            </p>
          </div>
          
          <div class="footer">
            <p>
              Built with ❤️ by <a href="https://www.lofisimplify.com.au/" style="color: #f87171;">LoFi Simplify</a> in Adelaide, Australia
            </p>
            <p>
              © ${new Date().getFullYear()} What The Menu? All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to What The Menu? 🍽️

Hi ${userName}!

Thanks for joining What The Menu? You're now part of a community that's making dining out easier and more enjoyable around the world!

With your free account, you can:
• Scan up to 5 menu photos per day
• Get AI-powered explanations of dishes
• Identify allergens and dietary restrictions  
• Understand cuisines from around the world

Ready to decode your first menu? Head over to whatthemenu.com and start exploring!

⚠️ Important: Always double-check with the restaurant regarding possible allergens. Our AI is helpful but not infallible!

Need more scans? Check out our affordable daily and weekly plans for unlimited menu scanning.

Happy dining! 🥘
The What The Menu? Team

Built with ❤️ by LoFi Simplify in Adelaide, Australia
© ${new Date().getFullYear()} What The Menu? All rights reserved.
    `;

    return { subject, html, text };
  },

  // You can add more email templates here for other purposes
  passwordReset: (userName: string, resetLink: string) => {
    // This won't be used in magic link flow, but keeping for completeness
    const subject = "🔐 Reset Your What The Menu? Password";
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #fef3c7; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border: 4px solid #292524; border-radius: 16px;">
          <h2 style="color: #292524; font-weight: 900;">Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>You requested to reset your password for What The Menu? Click the link below to reset it:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #f87171; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 8px; margin: 20px 0;">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>The What The Menu? Team</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${userName},

You requested to reset your password for What The Menu? Click the link below to reset it:

${resetLink}

If you didn't request this, please ignore this email.

The What The Menu? Team
    `;

    return { subject, html, text };
  }
};