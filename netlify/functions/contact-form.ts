// netlify/functions/contact-form.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Environment variables (set these in Netlify dashboard)
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role key for server-side
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contact@whatthemenu.com'; // Your email address

// Initialize Supabase client with service role key (server-side)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize Resend
const resend = new Resend(RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const formData: ContactFormData = JSON.parse(event.body);
    
    // Validate required fields
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'All fields are required' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    console.log('📝 Processing contact form submission:', { 
      name: formData.name, 
      email: formData.email,
      messageLength: formData.message.length 
    });

    // Save to Supabase database
    const { data: dbData, error: dbError } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          status: 'new'
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('✅ Contact submission saved to database:', dbData);

    // Send email notification using Resend
    try {
      const emailResult = await resend.emails.send({
        from: 'WhatTheMenu Contact <noreply@whatthemenu.com>', // Use your verified domain
        to: [CONTACT_EMAIL],
        replyTo: formData.email,
        subject: `New Contact Form Submission from ${formData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B47; border-bottom: 2px solid #FF6B47; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Contact Details:</h3>
              <p><strong>Name:</strong> ${formData.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #333;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-radius: 8px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Database ID:</strong> ${dbData.id}<br>
                <strong>Reply to this email</strong> to respond directly to ${formData.name}.
              </p>
            </div>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
Submitted: ${new Date().toLocaleString()}

Message:
${formData.message}

Database ID: ${dbData.id}
        `
      });

      console.log('✅ Email notification sent:', emailResult);

      // Log email success to database (optional)
      await supabase
        .from('email_logs')
        .insert([
          {
            email_type: 'contact_form_notification',
            recipient: CONTACT_EMAIL,
            success: true,
            resend_id: emailResult.data?.id
          }
        ]);

    } catch (emailError) {
      console.error('⚠️ Email sending failed, but form was saved to database:', emailError);
      
      // Log email failure to database
      await supabase
        .from('email_logs')
        .insert([
          {
            email_type: 'contact_form_notification',
            recipient: CONTACT_EMAIL,
            success: false,
            error_message: emailError instanceof Error ? emailError.message : 'Unknown email error'
          }
        ]);

      // Don't fail the whole request if email fails - the form submission is still saved
    }

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        id: dbData.id
      })
    };

  } catch (error) {
    console.error('❌ Contact form handler error:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    };
  }
};

export { handler };