import type { Handler } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, message } = JSON.parse(event.body || "{}");

    // Validate inputs
    if (!name || !email || !message) {
      return { statusCode: 400, body: "Missing required fields" };
    }

    // Send email via Resend
    await resend.emails.send({
      from: "WhatTheMenu Contact <onboarding@resend.dev>", // must be verified in Resend
      to: "hello@whatthemenu.com",
      subject: `New Contact Form Submission from ${name}`,
      reply_to: email,
      text: `From: ${name} (${email})\n\n${message}`,
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { statusCode: 500, body: "Failed to send email" };
  }
};

export { handler };
