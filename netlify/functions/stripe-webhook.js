// netlify/functions/stripe-webhook.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Use SERVICE_ROLE_KEY for database operations (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Email service functions
const sendEmail = async (emailData) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailData.from || 'WhatTheMenu <hello@whatthemenu.com>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const result = await response.json();
    return { success: true, id: result.id };

  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
};

const logEmailSend = async (emailType, recipient, success, emailId, error) => {
  try {
    await supabase
      .from('email_logs')
      .insert({
        email_type: emailType,
        recipient: recipient,
        success: success,
        resend_id: emailId,
        error_message: error,
        sent_at: new Date().toISOString()
      });
  } catch (logError) {
    console.error('Failed to log email send:', logError);
    // Don't throw - logging failure shouldn't break email sending
  }
};

const generatePurchaseConfirmationEmail = (userName, planName, amount, expiryDate) => {
  const subject = "Thank you for your WhatTheMenu purchase!";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purchase Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Thank You!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your purchase was successful</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; border: 4px solid #292524; box-shadow: 8px 8px 0px #292524;">
        <h2 style="color: #292524; margin-top: 0;">Hi ${userName}!</h2>
        
        <p>Thank you for upgrading to <strong>${planName}</strong>! Your payment has been processed successfully and you now have access to all premium features.</p>
        
        <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <h3 style="color: #059669; margin-top: 0;">Purchase Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Plan:</strong> ${planName}</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</li>
            <li style="padding: 8px 0;"><strong>Valid Until:</strong> ${expiryDate}</li>
          </ul>
        </div>
        
        <h3 style="color: #ff6b6b; margin-top: 30px;">What's Unlocked:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Unlimited menu scans</strong> - No more daily limits!</li>
          <li><strong>Priority support</strong> - Get help faster when you need it</li>
          <li><strong>Advanced features</strong> - Enhanced explanations and more details</li>
          <li><strong>Export capabilities</strong> - Save and share your discoveries</li>
        </ul>
        
        <div style="background: #fef3f3; border: 2px solid #ff6b6b; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
          <h3 style="color: #ff6b6b; margin-top: 0;">Ready to Explore?</h3>
          <p style="margin-bottom: 20px;">Start using your premium features right away:</p>
          <a href="https://whatthemenu.com" style="display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 3px solid #292524; box-shadow: 4px 4px 0px #292524;">Start Scanning Menus</a>
        </div>
        
        <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #666; font-size: 14px;">
            Questions about your purchase? Reply to this email or visit our <a href="https://whatthemenu.com/contact" style="color: #ff6b6b;">support page</a>.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
        <p>© 2025 WhatTheMenu. Made with ❤️ in Adelaide, Australia.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Thank You for Your Purchase!

Hi ${userName}!

Thank you for upgrading to ${planName}! Your payment has been processed successfully and you now have access to all premium features.

Purchase Details:
• Plan: ${planName}
• Amount: $${(amount / 100).toFixed(2)}
• Valid Until: ${expiryDate}

What's Unlocked:
• Unlimited menu scans - No more daily limits!
• Priority support - Get help faster when you need it
• Advanced features - Enhanced explanations and more details
• Export capabilities - Save and share your discoveries

Ready to explore? Start using your premium features: https://whatthemenu.com

Questions about your purchase? Reply to this email or visit our support page: https://whatthemenu.com/contact

© 2025 WhatTheMenu. Made with ❤️ in Adelaide, Australia.
  `;

  return { subject, html, text };
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(stripeEvent.data.object);
        break;
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};

async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  const userId = session.metadata.userId;
  const planType = session.metadata.planType;
  
  if (!userId || !planType) {
    console.error('Missing metadata in checkout session:', session.metadata);
    return;
  }

  // Calculate expiration date
  const now = new Date();
  const expirationDate = new Date(now);
  
  if (planType === 'daily') {
    expirationDate.setDate(now.getDate() + 1); // 24 hours
  } else if (planType === 'weekly') {
    expirationDate.setDate(now.getDate() + 7); // 7 days
  }

  // Update user profile with SERVICE_ROLE_KEY
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      subscription_type: planType,
      subscription_expires_at: expirationDate.toISOString(),
      subscription_status: 'active',
      stripe_payment_intent_id: session.payment_intent,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user profile:', updateError);
    return;
  }

  // Record payment history
  const { error: historyError } = await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent,
      stripe_customer_id: session.customer,
      amount: session.amount_total,
      currency: session.currency || 'usd',
      subscription_type: planType,
      status: 'succeeded',
      expires_at: expirationDate.toISOString()
    });

  if (historyError) {
    console.error('Error recording payment history:', historyError);
  }

  // Get user email for purchase confirmation
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (profileError || !userProfile?.email) {
    console.error('Could not find user email for purchase confirmation:', profileError);
  } else {
    // Send purchase confirmation email
    const userName = userProfile.email.split('@')[0];
    const planName = planType === 'weekly' ? 'Weekly Plan' : 'Daily Plan';
    const expiryDate = expirationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailTemplate = generatePurchaseConfirmationEmail(
      userName,
      planName,
      session.amount_total,
      expiryDate
    );

    const emailData = {
      to: [userProfile.email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    const emailResult = await sendEmail(emailData);

    // Log the email send
    await logEmailSend(
      'purchase_confirmation',
      userProfile.email,
      emailResult.success,
      emailResult.id,
      emailResult.error
    );

    if (emailResult.success) {
      console.log('Purchase confirmation email sent successfully to:', userProfile.email);
    } else {
      console.error('Failed to send purchase confirmation email:', emailResult.error);
    }
  }

  console.log(`Successfully activated ${planType} subscription for user ${userId}`);
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  // Additional logic if needed when payment is confirmed
}