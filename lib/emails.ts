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

import type { OrderData } from "./orders/createOrderSafely";

export async function sendOrderConfirmationEmail(orderRef: string, orderData: OrderData) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    logger.warn("SMTP credentials not set. Skipping order confirmation email.");
    return;
  }

  // Format currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  const itemsHtml = orderData.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #eeeeee;">
            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">${item.name}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #666666;">Quantity: ${item.quantity} (bundles of 6 yards)</p>
          </td>
          <td style="padding: 16px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-size: 15px; font-weight: 600; color: #1a1a1a;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `
    )
    .join("");

  try {
    await transporter.sendMail({
      from: `"Brooks Fabrics" <${process.env.SMTP_EMAIL}>`,
      to: orderData.email,
      subject: `Order Confirmation #${orderRef.substring(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Receipt</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 0; margin: 0; line-height: 1.5; color: #1a1a1a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
              <td style="background-color: #1a1a1a; padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Brooks MM <span style="color: #eab308;">International</span></h1>
                <p style="color: #a3a3a3; margin: 8px 0 0; font-size: 14px;">Premium Fabrics & Textiles</p>
              </td>
            </tr>
            
            <!-- Greeting -->
            <tr>
              <td style="padding: 40px 30px 20px;">
                <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600;">Thank you for your order, ${orderData.customerName.split(" ")[0]}!</h2>
                <p style="margin: 0; color: #525252; font-size: 15px;">We've successfully received your payment and your order is now being processed. Below are your order details.</p>
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-top: 24px;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Order Number</p>
                  <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #1a1a1a;">#${orderRef.substring(0, 8).toUpperCase()}</p>
                </div>
              </td>
            </tr>

            <!-- Items -->
            <tr>
              <td style="padding: 10px 30px 20px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px;">Order Summary</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHtml}
                </table>
              </td>
            </tr>

            <!-- Totals -->
            <tr>
              <td style="padding: 0 30px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;">Subtotal</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 500;">${formatCurrency(orderData.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;">Delivery Fee</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 500;">${orderData.deliveryFee === 0 ? "TBD (International)" : formatCurrency(orderData.deliveryFee)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 0 0; border-top: 1px solid #e5e7eb; color: #1a1a1a; font-size: 16px; font-weight: 700;">Grand Total</td>
                    <td style="padding: 16px 0 0; border-top: 1px solid #e5e7eb; text-align: right; font-size: 18px; font-weight: 700; color: #eab308;">${formatCurrency(orderData.total)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Delivery Details -->
            <tr>
              <td style="padding: 0 30px 40px;">
                <h3 style="margin: 0 0 12px; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Delivery Details</h3>
                <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 500;">${orderData.customerName}</p>
                <p style="margin: 4px 0 0; color: #525252; font-size: 15px;">${orderData.phone}</p>
                <p style="margin: 4px 0 0; color: #525252; font-size: 15px; max-width: 80%;">${orderData.address}</p>
              </td>
            </tr>

            <!-- Footer Action -->
            <tr>
              <td style="padding: 0 30px 40px; text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/account/orders" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Track Your Order</a>
              </td>
            </tr>

            <!-- Footer Text -->
            <tr>
              <td style="background-color: #f3f4f6; padding: 30px; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 13px;">If you have any questions about your order, please reply to this email.</p>
                <p style="margin: 12px 0 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} Brooks Fabrics. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (error) {
    logger.error("Failed to send order confirmation email via Nodemailer", { error });
  }
}
