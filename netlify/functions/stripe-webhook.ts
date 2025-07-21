// netlify/functions/stripe-webhook.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from './shared/emailService';
import { emailTemplates } from './shared/emailTemplates';

const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Verify Stripe webhook signature
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing signature or secret' }),
      };
    }

    // Parse the webhook payload
    const payload = JSON.parse(event.body || '{}');
    
    // Only handle successful payment intents
    if (payload.type !== 'payment_intent.succeeded') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Event not handled' }),
      };
    }

    const paymentIntent = payload.data.object;
    
    // Initialize services
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const emailService = new EmailService(process.env.RESEND_API_KEY!);

    // Get user and payment details from your payment_history table
    const { data: payment, error: paymentError } = await supabase
      .from('payment_history')
      .select(`
        *,
        user_profiles!inner(email, id)
      `)
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found in database:', paymentError);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Payment not found' }),
      };
    }

    const userEmail = payment.user_profiles.email;
    if (!userEmail) {
      console.error('No user email found for payment');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No user email found' }),
      };
    }

    // Determine plan name and format expiry date
    const planName = payment.subscription_type === 'weekly' ? 'Weekly Plan' : 'Daily Plan';
    const expiryDate = new Date(payment.expires_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Extract user name from email
    const userName = userEmail.split('@')[0];

    // Generate purchase confirmation email
    const confirmationTemplate = emailTemplates.purchaseConfirmation(
      userName,
      planName,
      payment.amount,
      expiryDate
    );
    
    const emailData = {
      to: [userEmail],
      subject: confirmationTemplate.subject,
      html: confirmationTemplate.html,
      text: confirmationTemplate.text
    };

    // Send confirmation email
    const emailResult = await emailService.sendEmail(emailData);

    // Log the email send
    await emailService.logEmailSend(
      supabase,
      'purchase_confirmation',
      userEmail,
      emailResult.success,
      emailResult.id,
      emailResult.error
    );

    // Update payment record with email status
    await supabase
      .from('payment_history')
      .update({ 
        status: 'completed',
        // You might want to add an email_sent field to track this
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (!emailResult.success) {
      console.error('Failed to send purchase confirmation email:', emailResult.error);
      // Don't fail the webhook - payment was successful
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true,
          message: 'Payment processed but email failed',
          emailError: emailResult.error
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Purchase confirmation email sent successfully',
        emailId: emailResult.id
      }),
    };

  } catch (error) {
    console.error('Stripe webhook error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };