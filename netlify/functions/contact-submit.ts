// netlify/functions/contact-submit.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from './shared/emailService';
import { emailTemplates } from './shared/emailTemplates';

const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  try {
    // Parse the request body
    const { name, email, message } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: name, email, and message are required' 
        }),
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Invalid email format' }),
      };
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize email service
    const emailService = new EmailService(process.env.RESEND_API_KEY!);

    // Insert contact submission into database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save contact submission');
    }

    // Send notification email to admin
    const adminTemplate = emailTemplates.contactConfirmation(name, email, message, submission.id);
    const adminEmailData = {
      to: ['support@whatthemenu.com'],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
        <hr>
        <p><small>Submission ID: ${submission.id}</small></p>
        <p><small>Submitted at: ${new Date(submission.created_at).toLocaleString()}</small></p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}

---
Submission ID: ${submission.id}
Submitted at: ${new Date(submission.created_at).toLocaleString()}
      `
    };

    // Send confirmation email to user
    const userTemplate = emailTemplates.contactConfirmation(name, email, message, submission.id);
    const userEmailData = {
      to: [email],
      subject: userTemplate.subject,
      html: userTemplate.html,
      text: userTemplate.text
    };

    // Send both emails
    const [adminEmailResult, userEmailResult] = await Promise.allSettled([
      emailService.sendEmail(adminEmailData),
      emailService.sendEmail(userEmailData)
    ]);

    // Log email results
    if (adminEmailResult.status === 'fulfilled') {
      await emailService.logEmailSend(
        supabase, 
        'contact_admin_notification', 
        'support@whatthemenu.com', 
        adminEmailResult.value.success,
        adminEmailResult.value.id,
        adminEmailResult.value.error
      );
    }

    if (userEmailResult.status === 'fulfilled') {
      await emailService.logEmailSend(
        supabase, 
        'contact_user_confirmation', 
        email, 
        userEmailResult.value.success,
        userEmailResult.value.id,
        userEmailResult.value.error
      );
    }

    // Check if any emails failed
    const emailErrors = [];
    if (adminEmailResult.status === 'rejected' || 
        (adminEmailResult.status === 'fulfilled' && !adminEmailResult.value.success)) {
      emailErrors.push('Admin notification email failed');
    }
    if (userEmailResult.status === 'rejected' || 
        (userEmailResult.status === 'fulfilled' && !userEmailResult.value.success)) {
      emailErrors.push('User confirmation email failed');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Contact form submitted successfully!',
        submissionId: submission.id,
        emailStatus: emailErrors.length > 0 ? 
          `Form submitted but some emails failed: ${emailErrors.join(', ')}` : 
          'All emails sent successfully'
      }),
    };

  } catch (error) {
    console.error('Contact form error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        error: 'Internal server error. Please try again later.' 
      }),
    };
  }
};

export { handler };