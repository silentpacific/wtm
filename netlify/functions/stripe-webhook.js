// netlify/functions/stripe-webhook.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

  // Update user profile
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

  console.log(`Successfully activated ${planType} subscription for user ${userId}`);
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  // Additional logic if needed when payment is confirmed
}