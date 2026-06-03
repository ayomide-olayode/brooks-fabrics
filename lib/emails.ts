// import { Resend } from "resend";
import { logger } from "./logger";
import nodemailer from "nodemailer";

/* 
// --- RESEND IMPLEMENTATION (COMMENTED OUT) ---
// Use a placeholder if not set, so the app doesn't crash, but it won't actually send
const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

export async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.RESEND_API_KEY) return;
  
  try {
    await resend.emails.send({
      from: "Brooks Fabrics <hello@brooksfabrics.com>",
      to: email,
      subject: "Welcome to Brooks Fabrics!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Brooks Fabrics, ${name}!</h2>
          <p>We're thrilled to have you here. Your account is now active.</p>
          <p>You can now save addresses, track your orders, and enjoy faster checkout.</p>
          <br/>
          <a href="${process.env.NEXTAUTH_URL}/shop" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Shop Now</a>
          <br/><br/>
          <p>Best,<br/>The Brooks Fabrics Team</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error("Failed to send welcome email", { error });
  }
}

export async function sendOrderConfirmationEmail(email: string, name: string, orderRef: string, total: number) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: "Brooks Fabrics <orders@brooksfabrics.com>",
      to: email,
      subject: \`Order Confirmation #\${orderRef.substring(0, 8)}\`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your order, ${name}!</h2>
          <p>We've received your order and are currently processing it.</p>
          <p><strong>Order Number:</strong> #\${orderRef.substring(0, 8).toUpperCase()}</p>
          <p><strong>Total Paid:</strong> ₦\${total.toLocaleString()}</p>
          <br/>
          <a href="${process.env.NEXTAUTH_URL}/account/orders" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Order Status</a>
          <br/><br/>
          <p>Best,<br/>The Brooks Fabrics Team</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error("Failed to send order confirmation email", { error });
  }
}
*/

// --- NODEMAILER (GOOGLE SMTP) IMPLEMENTATION ---

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD, // Use an App Password if using Gmail with 2FA
  },
});

export async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    logger.warn("SMTP credentials not set. Skipping welcome email.");
    return;
  }
  
  try {
    await transporter.sendMail({
      from: `"Brooks Fabrics" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Welcome to Brooks Fabrics!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Brooks Fabrics, ${name}!</h2>
          <p>We're thrilled to have you here. Your account is now active.</p>
          <p>You can now save addresses, track your orders, and enjoy faster checkout.</p>
          <br/>
          <a href="${process.env.NEXTAUTH_URL}/shop" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Shop Now</a>
          <br/><br/>
          <p>Best,<br/>The Brooks Fabrics Team</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error("Failed to send welcome email via Nodemailer", { error });
  }
}

export async function sendOrderConfirmationEmail(email: string, name: string, orderRef: string, total: number) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    logger.warn("SMTP credentials not set. Skipping order confirmation email.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Brooks Fabrics" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Order Confirmation #${orderRef.substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your order, ${name}!</h2>
          <p>We've received your order and are currently processing it.</p>
          <p><strong>Order Number:</strong> #${orderRef.substring(0, 8).toUpperCase()}</p>
          <p><strong>Total Paid:</strong> ₦${total.toLocaleString()}</p>
          <br/>
          <a href="${process.env.NEXTAUTH_URL}/account/orders" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Order Status</a>
          <br/><br/>
          <p>Best,<br/>The Brooks Fabrics Team</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error("Failed to send order confirmation email via Nodemailer", { error });
  }
}
