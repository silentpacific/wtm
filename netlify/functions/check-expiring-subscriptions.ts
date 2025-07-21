// netlify/functions/check-expiring-subscriptions.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from './shared/emailService';
import { emailTemplates } from './shared/emailTemplates';

const handler: Handler = async (event, context) => {
  // This function should only be called via scheduled trigger or manually
  // You can add authentication here if needed
  
  try {
    console.log('Checking for expiring subscriptions...');
    
    // Initialize services
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const emailService = new EmailService(process.env.RESEND_API_KEY!);

    // Calculate time range: 1 hour from now
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    // Get slightly wider range to account for timing
    const rangeStart = new Date();
    rangeStart.setMinutes(rangeStart.getMinutes() + 55); // 55 minutes from now
    
    const rangeEnd = new Date();
    rangeEnd.setMinutes(rangeEnd.getMinutes() + 65); // 65 minutes from now

    // Find users whose subscriptions expire within the next hour
    const { data: expiringUsers, error: queryError } = await supabase
      .from('user_profiles')
      .select('id, email, subscription_type, subscription_expires_at')
      .eq('subscription_status', 'active')
      .gte('subscription_expires_at', rangeStart.toISOString())
      .lte('subscription_expires_at', rangeEnd.toISOString());

    if (queryError) {
      console.error('Database query error:', queryError);
      throw new Error('Failed to query expiring subscriptions');
    }

    if (!expiringUsers || expiringUsers.length === 0) {
      console.log('No subscriptions expiring in the next hour');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'No expiring subscriptions found',
          checked: new Date().toISOString()
        }),
      };
    }

    console.log(`Found ${expiringUsers.length} expiring subscriptions`);

    // Check if we've already sent reminders (to prevent duplicate emails)
    const userIds = expiringUsers.map(user => user.id);
    const { data: alreadySent } = await supabase
      .from('email_logs')
      .select('recipient')
      .eq('email_type', 'subscription_expiry_reminder')
      .in('recipient', expiringUsers.map(u => u.email))
      .gte('sent_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()); // Last 2 hours

    const alreadySentEmails = new Set(alreadySent?.map(log => log.recipient) || []);

    // Process each expiring user
    const emailPromises = expiringUsers
      .filter(user => !alreadySentEmails.has(user.email)) // Skip already notified users
      .map(async (user) => {
        try {
          const userName = user.email.split('@')[0];
          const planName = user.subscription_type === 'weekly' ? 'Weekly Plan' : 'Daily Plan';
          const expiryDate = new Date(user.subscription_expires_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          // Create renewal link (you'll need to implement this based on your payment flow)
          const renewalLink = `https://whatthemenu.com/pricing?renewal=true&user=${user.id}`;

          // Generate expiry reminder email
          const reminderTemplate = emailTemplates.subscriptionExpiring(
            userName,
            planName,
            expiryDate,
            renewalLink
          );
          
          const emailData = {
            to: [user.email],
            subject: reminderTemplate.subject,
            html: reminderTemplate.html,
            text: reminderTemplate.text
          };

          // Send reminder email
          const emailResult = await emailService.sendEmail(emailData);

          // Log the email send
          await emailService.logEmailSend(
            supabase,
            'subscription_expiry_reminder',
            user.email,
            emailResult.success,
            emailResult.id,
            emailResult.error
          );

          return {
            userId: user.id,
            email: user.email,
            success: emailResult.success,
            error: emailResult.error
          };

        } catch (userError) {
          console.error(`Failed to process user ${user.id}:`, userError);
          return {
            userId: user.id,
            email: user.email,
            success: false,
            error: userError instanceof Error ? userError.message : 'Unknown error'
          };
        }
      });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);

    console.log(`Sent ${successful} expiry reminder emails, ${failed.length} failed`);

    if (failed.length > 0) {
      console.error('Failed emails:', failed);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Expiry reminder check completed',
        totalFound: expiringUsers.length,
        alreadyNotified: alreadySentEmails.size,
        emailsSent: successful,
        emailsFailed: failed.length,
        failures: failed,
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('Expiry check error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
    };
  }
};

export { handler };