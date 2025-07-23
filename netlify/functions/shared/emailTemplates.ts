// netlify/functions/shared/emailTemplates.ts
// Updated with excellent WhatTheMenu styling

export const emailTemplates = {
  // 1. PURCHASE CONFIRMATION EMAIL
  purchaseConfirmation: (userName: string, planName: string, amount: number, expiryDate: string) => {
    const subject = `Your ${planName} on WhatTheMenu? is now active`;
    
    // Determine plan features and scan limits
    const isDaily = planName.toLowerCase().includes('daily');
    const isWeekly = planName.toLowerCase().includes('weekly');
    const scanLimit = isDaily ? '10 scans in 24 hours' : isWeekly ? '70 scans in 7 days' : 'increased scan limits';
    const planEmoji = isDaily ? '⚡' : isWeekly ? '🌟' : '🚀';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Confirmation - WhatTheMenu</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFFCF5; color: #292524;">
        
        <!-- Main Container -->
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 4px solid #292524; border-radius: 16px; overflow: hidden; box-shadow: 8px 8px 0px #292524;">
          
          <!-- Success Header -->
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">${planEmoji}</div>
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 900;">Payment Successful!</h1>
            <p style="color: white; margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Your ${planName} is now active</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <h2 style="margin: 0 0 20px 0; color: #292524; font-size: 24px; font-weight: 900;">Hey ${userName}! 🎉</h2>
            
            <p style="margin: 0 0 24px 0; color: #292524; font-size: 16px; line-height: 1.6;">
              Thank you for upgrading to <strong>${planName}</strong>! Your payment has been processed and you're all set to start scanning menus like a pro.
            </p>
            
            <!-- Purchase Details Box -->
            <div style="background: #f0fdf4; border: 3px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #059669; margin: 0 0 16px 0; font-size: 18px; font-weight: 900;">📋 Purchase Details</h3>
              <div style="space-y: 8px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7;">
                  <span style="font-weight: 600; color: #374151;">Plan:</span>
                  <span style="font-weight: 900; color: #059669;">${planName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7;">
                  <span style="font-weight: 600; color: #374151;">Amount:</span>
                  <span style="font-weight: 900; color: #059669;">$${(amount / 100).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #374151;">Valid Until:</span>
                  <span style="font-weight: 900; color: #059669;">${expiryDate}</span>
                </div>
              </div>
            </div>
            
            <!-- What's Unlocked -->
            <div style="background: #fef3f3; border: 3px solid #FF6B6B; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #FF6B6B; margin: 0 0 16px 0; font-size: 18px; font-weight: 900;">🔓 What's Unlocked</h3>
              <div style="space-y: 12px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="background: #FF6B6B; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">📸</span>
                  <span style="font-weight: 600; color: #292524;">${scanLimit}</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="background: #FF6B6B; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">🍽️</span>
                  <span style="font-weight: 600; color: #292524;">Unlimited dish explanations per scan</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="background: #FF6B6B; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">⚡</span>
                  <span style="font-weight: 600; color: #292524;">Priority support</span>
                </div>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://whatthemenu.com" 
                 style="display: inline-block; 
                        background-color: #FF6B6B; 
                        color: white; 
                        text-decoration: none; 
                        padding: 16px 32px; 
                        border-radius: 50px; 
                        font-weight: 900; 
                        font-size: 18px;
                        border: 3px solid #292524;
                        box-shadow: 4px 4px 0px #292524;
                        transition: all 0.2s;">
                Start Scanning Menus! 🚀
              </a>
            </div>
            
            <!-- Important Notice -->
            <div style="background: #FFC700; border: 2px solid #d97706; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; color: #292524; font-weight: 900; font-size: 16px;">
                ⚠️ Remember: Always double-check with restaurants about allergens!
              </p>
            </div>
            
            <p style="margin: 24px 0 0 0; color: #292524; font-size: 16px; line-height: 1.6;">
              Ready to explore? Your premium features are active right now! 
            </p>
            
            <p style="margin: 16px 0 0 0; color: #292524; font-size: 16px; font-weight: 600;">
              Happy dining! 🥘<br>
              The WhatTheMenu Team
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f4; padding: 20px 24px; text-align: center; border-top: 2px solid #e7e5e4;">
            <p style="margin: 0 0 8px 0; color: #78716c; font-size: 12px;">
              Questions? Reply to this email or visit 
              <a href="https://whatthemenu.com/contact" style="color: #FF6B6B; text-decoration: none; font-weight: 600;">our support page</a>
            </p>
            <p style="margin: 0; color: #78716c; font-size: 12px;">
              © 2025 WhatTheMenu • Made with ❤️ in Adelaide, Australia
            </p>
          </div>
          
        </div>
        
      </body>
      </html>
    `;

    const text = `
Payment Successful! Your ${planName} is now active

Hey ${userName}!

Thank you for upgrading to ${planName}! Your payment has been processed and you're all set to start scanning menus like a pro.

📋 Purchase Details:
• Plan: ${planName}
• Amount: $${(amount / 100).toFixed(2)}
• Valid Until: 24 hours from time of purchase

🔓 What's Unlocked:
• ${scanLimit}
• Unlimited dish explanations per scan
• Priority support

Ready to explore? Your premium features are active right now!
Start scanning: https://whatthemenu.com

⚠️ Remember: Always double-check with restaurants about allergens!

Happy dining!
The WhatTheMenu Team

Questions? Reply to this email or visit: https://whatthemenu.com/contact
© 2025 WhatTheMenu • Made with ❤️ in Adelaide, Australia
    `;

    return { subject, html, text };
  },

  // 2. WELCOME EMAIL
  welcome: (userName: string) => {
    const subject = "Thanks for joining WhatTheMenu? - Get easy descriptions of food";
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to WhatTheMenu</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFFCF5; color: #292524;">
        
        <!-- Main Container -->
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 4px solid #292524; border-radius: 16px; overflow: hidden; box-shadow: 8px 8px 0px #292524;">
          
          <!-- Welcome Header -->
          <div style="background: linear-gradient(135deg, #FF6B6B, #ff5252); padding: 40px 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 900; letter-spacing: -0.025em;">WhatTheMenu?</h1>
            <p style="color: white; margin: 8px 0 0 0; opacity: 0.9; font-size: 18px; font-weight: 600;">No More Confusing Menus</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <h2 style="margin: 0 0 20px 0; color: #292524; font-size: 28px; font-weight: 900;">Welcome aboard, ${userName}! 🎉</h2>
            
            <p style="margin: 0 0 24px 0; color: #292524; font-size: 18px; line-height: 1.6; font-weight: 500;">
              You are never going to have wonder <em>"What is this dish?"</em> again! 
            </p>
            
            <p style="margin: 0 0 32px 0; color: #292524; font-size: 16px; line-height: 1.6;">
              Whether you're exploring a local gem or traveling the world, WhatTheMenu makes every menu an open book.
            </p>
            
            <!-- What You Can Do -->
            <div style="background: #f0fdf4; border: 3px solid #1DD1A1; border-radius: 12px; padding: 24px; margin: 32px 0;">
              <h3 style="color: #1DD1A1; margin: 0 0 20px 0; font-size: 20px; font-weight: 900;">What You Can Do Right Now</h3>
              
              <div style="space-y: 16px;">
                <div style="display: flex; align-items: start; margin-bottom: 16px;">
                  <div style="background: #1DD1A1; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; margin-right: 16px; flex-shrink: 0;">📸</div>
                  <div>
                    <div style="font-weight: 700; color: #292524; font-size: 16px; margin-bottom: 4px;">Scan 5 menus daily</div>
                    <div style="color: #57534e; font-size: 14px; line-height: 1.4;">Perfect for trying new restaurants and exploring cuisines</div>
                  </div>
                </div>
                
                <div style="display: flex; align-items: start; margin-bottom: 16px;">
                  <div style="background: #1DD1A1; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; margin-right: 16px; flex-shrink: 0;">🤖</div>
                  <div>
                    <div style="font-weight: 700; color: #292524; font-size: 16px; margin-bottom: 4px;">Get dish explanations</div>
                    <div style="color: #57534e; font-size: 14px; line-height: 1.4;">Up to 5 dishes per menu, with ingredients and cooking methods</div>
                  </div>
                </div>
                
                <div style="display: flex; align-items: start; margin-bottom: 16px;">
                  <div style="background: #1DD1A1; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; margin-right: 16px; flex-shrink: 0;">🚨</div>
                  <div>
                    <div style="font-weight: 700; color: #292524; font-size: 16px; margin-bottom: 4px;">Spot probability of allergens instantly</div>
                    <div style="color: #57534e; font-size: 14px; line-height: 1.4;">Always ask your waiter, though!</div>
                  </div>
                </div>
                
                <div style="display: flex; align-items: start;">
                  <div style="background: #1DD1A1; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; margin-right: 16px; flex-shrink: 0;">🌍</div>
                  <div>
                    <div style="font-weight: 700; color: #292524; font-size: 16px; margin-bottom: 4px;">Scans menu of all major languages</div>
                    <div style="color: #57534e; font-size: 14px; line-height: 1.4;">Get explanations in English, Chinese, Spanish, and French</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- How It Works -->
            <div style="background: #fef3f3; border: 3px solid #FF6B6B; border-radius: 12px; padding: 24px; margin: 32px 0;">
              <h3 style="color: #FF6B6B; margin: 0 0 20px 0; font-size: 20px; font-weight: 900;">📱 How It Works</h3>
              
              <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="background: #FF6B6B; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">1</div>
                <span style="font-weight: 600; color: #292524;">Take a photo of any menu</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="background: #FF6B6B; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">2</div>
                <span style="font-weight: 600; color: #292524;">Tap on any dish you're curious about</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <div style="background: #FF6B6B; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">3</div>
                <span style="font-weight: 600; color: #292524;">Get explanations and allergen info in a few seconds!</span>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://whatthemenu.com" 
                 style="display: inline-block; 
                        background-color: #FF6B6B; 
                        color: white; 
                        text-decoration: none; 
                        padding: 18px 36px; 
                        border-radius: 50px; 
                        font-weight: 900; 
                        font-size: 18px;
                        border: 3px solid #292524;
                        box-shadow: 4px 4px 0px #292524;">
                Scan Your First Menu!
              </a>
            </div>
            
            <!-- Important Safety Note -->
            <div style="background: #FFFCF5; border: 2px solid #ED1C24; border-radius: 12px; padding: 20px; margin: 32px 0; text-align: center;">
              <p style="margin: 0; color: #292524; font-weight: 900; font-size: 16px;">
                ⚠️ <strong>Safety First!</strong> ALWAYS DOUBLE CHECK WITH THE RESTAURANT about allergens. Our AI-generated data is great, but it can make mistakes! Your safety is paramount!
              </p>
            </div>
            
            <!-- Closing -->
            <p style="margin: 32px 0 16px 0; color: #292524; font-size: 16px; line-height: 1.6;">
              Ready to turn every menu into an adventure? We're excited to be part of your culinary journey! 
            </p>
            
            <p style="margin: 16px 0 0 0; color: #292524; font-size: 16px; font-weight: 600;">
              Happy dining!<br>
              WhatTheMenu?
            </p>
            
            <p style="margin: 24px 0 0 0; color: #78716c; font-size: 14px; font-style: italic;">
              P.S. Need more than 5 scans a day? Check out our affordable daily and weekly plans for unlimited menu exploration!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f4; padding: 20px 24px; text-align: center; border-top: 2px solid #e7e5e4;">
            <p style="margin: 0 0 8px 0; color: #78716c; font-size: 12px;">
              Questions? We're here to help! 
              <a href="https://whatthemenu.com/contact" style="color: #FF6B6B; text-decoration: none; font-weight: 600;">Contact us</a>
            </p>
            <p style="margin: 0; color: #78716c; font-size: 12px;">
              © 2025 WhatTheMenu • Made with ❤️ in Adelaide, Australia
            </p>
          </div>
          
        </div>
        
      </body>
      </html>
    `;

    const text = `
🍽️ Welcome to WhatTheMenu - Your menu scanning adventure begins!

Welcome aboard, ${userName}! 🎉

You've just joined thousands of food lovers who never have to wonder "What is this dish?" again!

Whether you're exploring a local gem or traveling the world, WhatTheMenu makes every menu an open book.

🚀 What You Can Do Right Now:
• 📸 Scan 5 menus daily - Perfect for trying new restaurants
• 🤖 Get AI dish explanations - Up to 5 dishes per menu  
• 🚨 Spot allergens instantly - Never worry about hidden ingredients
• 🌍 Works in any language - From Japanese ramen bars to French bistros

📱 How It Works:
1. Snap a photo of any menu
2. Click on any dish you're curious about  
3. Get instant explanations and allergen info!

Ready to scan your first menu? https://whatthemenu.com

⚠️ Safety First! Always double-check with the restaurant about allergens. Our AI is smart, but your safety is paramount!

Ready to turn every menu into an adventure? We're excited to be part of your culinary journey!

Happy dining! 🥘
The WhatTheMenu Team

P.S. Need more than 5 scans a day? Check out our affordable daily and weekly plans for unlimited menu exploration!

Questions? Contact us: https://whatthemenu.com/contact
© 2025 WhatTheMenu • Made with ❤️ in Adelaide, Australia
    `;

    return { subject, html, text };
  },

  // 3. CONTACT FORM CONFIRMATION
  contactConfirmation: (name: string, email: string, message: string, submissionId: string) => {
    const subject = "✅ We got your message! - WhatTheMenu Support";
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Received - WhatTheMenu</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFFCF5; color: #292524;">
        
        <!-- Main Container -->
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 4px solid #292524; border-radius: 16px; overflow: hidden; box-shadow: 8px 8px 0px #292524;">
          
          <!-- Confirmation Header -->
          <div style="background: linear-gradient(135deg, #1DD1A1, #059669); padding: 40px 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">📨</div>
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 900;">Message Received!</h1>
            <p style="color: white; margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">We'll get back to you soon</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <h2 style="margin: 0 0 20px 0; color: #292524; font-size: 24px; font-weight: 900;">Thanks for reaching out, ${name}! ✅</h2>
            
            <p style="margin: 0 0 24px 0; color: #292524; font-size: 16px; line-height: 1.6;">
              We've received your message and our support team will get back to you as soon as possible. We typically respond within <strong>24 hours</strong>, but often much sooner!
            </p>
            
            <!-- Message Summary -->
            <div style="background: #f8fafc; border: 3px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #292524; margin: 0 0 16px 0; font-size: 18px; font-weight: 900;">📝 Your Message Summary</h3>
              
              <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                <div style="margin-bottom: 12px;">
                  <span style="font-weight: 600; color: #475569;">From:</span>
                  <span style="color: #292524; margin-left: 8px;">${name} (${email})</span>
                </div>
                <div>
                  <span style="font-weight: 600; color: #475569;">Message:</span>
                  <div style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 6px; color: #292524; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                </div>
              </div>
            </div>
            
            <!-- What Happens Next -->
            <div style="background: #fef3f3; border: 3px solid #FF6B6B; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #FF6B6B; margin: 0 0 16px 0; font-size: 18px; font-weight: 900;">🚀 What Happens Next</h3>
              
              <div style="space-y: 12px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="background: #FF6B6B; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">1</span>
                  <span style="font-weight: 600; color: #292524;">Our team reviews your message</span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="background: #FF6B6B; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">2</span>
                  <span style="font-weight: 600; color: #292524;">We craft a personalized response</span>
                </div>
                
                <div style="display: flex; align-items: center;">
                  <span style="background: #FF6B6B; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px;">3</span>
                  <span style="font-weight: 600; color: #292524;">You'll hear back within 24 hours!</span>
                </div>
              </div>
            </div>
            
            <!-- In the Meantime -->
            <div style="background: #f0fdf4; border: 3px solid #1DD1A1; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <h3 style="color: #1DD1A1; margin: 0 0 16px 0; font-size: 18px; font-weight: 900;">🍽️ In the Meantime</h3>
              <p style="color: #292524; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Keep exploring delicious menus with WhatTheMenu! Your food adventure doesn't have to wait.
              </p>
              
              <a href="https://whatthemenu.com" 
                 style="display: inline-block; 
                        background-color: #1DD1A1; 
                        color: white; 
                        text-decoration: none; 
                        padding: 14px 28px; 
                        border-radius: 50px; 
                        font-weight: 700; 
                        font-size: 16px;
                        border: 3px solid #292524;
                        box-shadow: 4px 4px 0px #292524;">
                Continue Scanning Menus
              </a>
            </div>
            
            <!-- Reference ID -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600;">
                Reference ID: <span style="color: #292524; font-family: monospace;">${submissionId}</span>
              </p>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">
                (Keep this for your records)
              </p>
            </div>
            
            <!-- Closing -->
            <p style="margin: 32px 0 16px 0; color: #292524; font-size: 16px; line-height: 1.6;">
              Thanks for being part of the WhatTheMenu community! We appreciate your feedback and questions.
            </p>
            
            <p style="margin: 16px 0 0 0; color: #292524; font-size: 16px; font-weight: 600;">
              Best regards,<br>
              The WhatTheMenu Support Team 🍽️
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f4; padding: 20px 24px; text-align: center; border-top: 2px solid #e7e5e4;">
            <p style="margin: 0 0 8px 0; color: #78716c; font-size: 12px;">
              Need urgent help? Visit our 
              <a href="https://whatthemenu.com/faq" style="color: #FF6B6B; text-decoration: none; font-weight: 600;">FAQ page</a>
            </p>
            <p style="margin: 0; color: #78716c; font-size: 12px;">
              © 2025 WhatTheMenu • Made with ❤️ in Adelaide, Australia
            </p>
          </div>
          
        </div>
        
      </body>
      </html>
    `;

    const text = `
✅ We got your message! - WhatTheMenu Support

Thanks for reaching out, ${name}! ✅

We've received your message and our support team will get back to you as soon as possible. We typically respond within 24 hours, but often much sooner!

📝 Your Message Summary:
From: ${name} (${email})
Message: ${message}

🚀 What Happens Next:
1. Our team reviews your message
2. We craft a personalized response  
3. You'll hear back within 24 hours!

🍽️ In the Meantime:
Keep exploring delicious menus with WhatTheMenu! Your food adventure doesn't have to wait.
Continue scanning: https://whatthemenu.com

Reference ID: ${submissionId}
(Keep this for your records)

Thanks for being part of the WhatTheMenu community! We appreciate your feedback and questions.

Best regards,
The WhatTheMenu Support Team 🍽️

Need urgent help? Visit our FAQ: https://whatthemenu.com/faq
© 2025 WhatTheMenu • Made with ❤️ in Adelaide, Australia
    `;

    return { subject, html, text };
  },

  // Legacy password reset (keeping for completeness but not used with magic links)
  passwordReset: (userName: string, resetLink: string) => {
    const subject = "🔐 Reset Your WhatTheMenu Password";
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - WhatTheMenu</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFFCF5;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 4px solid #292524; border-radius: 16px; overflow: hidden; box-shadow: 8px 8px 0px #292524;">
          <div style="background-color: #FF6B6B; padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 900;">🔐 Password Reset</h1>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="margin: 0 0 16px 0; color: #292524; font-size: 20px; font-weight: 900;">Hi ${userName},</h2>
            <p style="margin: 0 0 24px 0; color: #292524; font-size: 16px;">You requested to reset your WhatTheMenu password. Click below to set a new one:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #FF6B6B; color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; border: 3px solid #292524; box-shadow: 4px 4px 0px #292524;">Reset Password</a>
            </div>
            <p style="margin: 16px 0 0 0; color: #78716c; font-size: 14px; text-align: center;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
🔐 Reset Your WhatTheMenu Password

Hi ${userName},

You requested to reset your WhatTheMenu password. Click the link below to set a new one:

${resetLink}

If you didn't request this, please ignore this email.

The WhatTheMenu Team
    `;

    return { subject, html, text };
  }
};