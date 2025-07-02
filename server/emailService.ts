import nodemailer from 'nodemailer';
import type { OrderWithItems, User } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface PaymentDetails {
  paymentMethod: string;
  cardLastFour?: string;
  amount: number;
  transactionId: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendOrderConfirmation(order: OrderWithItems, userEmail: string): Promise<void> {
    const orderItemsHtml = order.orderItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          ${item.foodItem.name}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
          $${item.totalPrice}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; padding: 10px; text-align: left; }
          .total { font-weight: bold; font-size: 18px; color: #FF6B35; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FoodieExpress</h1>
            <h2>Order Confirmation</h2>
          </div>
          
          <div class="content">
            <p>Hi there!</p>
            <p>Thank you for your order! We've received your order and it's being prepared.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> #FE${order.id}</p>
              <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
              <p><strong>Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
              
              <h4>Items Ordered:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              
              <div style="margin-top: 20px; text-align: right;">
                <p>Subtotal: $${order.subtotal}</p>
                <p>Delivery Fee: $${order.deliveryFee}</p>
                <p>Tax: $${order.tax}</p>
                <p class="total">Total: $${order.totalAmount}</p>
              </div>
            </div>
            
            <p>We'll send you another email when your order is out for delivery.</p>
            <p>If you have any questions, please contact us or the restaurant directly.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing FoodieExpress!</p>
            <p>Delivering happiness, one meal at a time.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'FoodieExpress <noreply@foodieexpress.com>',
      to: userEmail,
      subject: `Order Confirmation - #FE${order.id}`,
      html,
    });
  }

  async sendOrderStatusUpdate(order: OrderWithItems, userEmail: string): Promise<void> {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      preparing: 'The restaurant is now preparing your order.',
      out_for_delivery: 'Your order is on its way! It should arrive soon.',
      delivered: 'Your order has been delivered. Enjoy your meal!',
      cancelled: 'Your order has been cancelled. If you have any questions, please contact us.',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-update { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .status { font-size: 24px; font-weight: bold; color: #FF6B35; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FoodieExpress</h1>
            <h2>Order Status Update</h2>
          </div>
          
          <div class="content">
            <div class="status-update">
              <h3>Order #FE${order.id}</h3>
              <div class="status">${order.status.replace('_', ' ').toUpperCase()}</div>
              <p>${statusMessages[order.status as keyof typeof statusMessages] || 'Your order status has been updated.'}</p>
              <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing FoodieExpress!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'FoodieExpress <noreply@foodieexpress.com>',
      to: userEmail,
      subject: `Order Update - #FE${order.id} - ${order.status.replace('_', ' ').toUpperCase()}`,
      html,
    });
  }

  async sendLoginVerification(user: User, verificationCode: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .verification-code { background: white; padding: 30px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .code { font-size: 36px; font-weight: bold; color: #FF6B35; letter-spacing: 5px; margin: 20px 0; font-family: monospace; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FoodieExpress</h1>
            <h2>Login Verification</h2>
          </div>
          
          <div class="content">
            <p>Hi ${user.firstName || user.email}!</p>
            <p>We received a login attempt for your FoodieExpress account. Please use the verification code below to complete your login:</p>
            
            <div class="verification-code">
              <h3>Your Verification Code</h3>
              <div class="code">${verificationCode}</div>
              <p>This code will expire in 10 minutes.</p>
            </div>
            
            <div class="warning">
              <p><strong>Security Notice:</strong> If you didn't attempt to log in, please ignore this email and consider changing your password.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for keeping your account secure!</p>
            <p>FoodieExpress Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'FoodieExpress <noreply@foodieexpress.com>',
      to: user.email,
      subject: 'FoodieExpress - Login Verification Code',
      html,
    });
  }

  async sendPaymentVerification(order: OrderWithItems, userEmail: string, paymentDetails: PaymentDetails): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .payment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .success-icon { font-size: 48px; color: #28a745; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FoodieExpress</h1>
            <h2>Payment Confirmed</h2>
          </div>
          
          <div class="content">
            <div class="success-icon">✅</div>
            <p>Great news! Your payment has been successfully processed.</p>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <p><strong>Order ID:</strong> #FE${order.id}</p>
              <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
              <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
              ${paymentDetails.cardLastFour ? `<p><strong>Card:</strong> ****${paymentDetails.cardLastFour}</p>` : ''}
              <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <p class="amount">Amount Paid: $${paymentDetails.amount}</p>
              </div>
            </div>
            
            <p>Your order is now confirmed and being prepared. You'll receive another email when your order status updates.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>FoodieExpress Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'FoodieExpress <noreply@foodieexpress.com>',
      to: userEmail,
      subject: `Payment Confirmed - Order #FE${order.id}`,
      html,
    });
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .welcome-section { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .features { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .feature-item { margin: 10px 0; padding: 10px; border-left: 4px solid #FF6B35; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to FoodieExpress!</h1>
          </div>
          
          <div class="content">
            <div class="welcome-section">
              <h2>Hello ${user.firstName || user.email}!</h2>
              <p>Welcome to FoodieExpress - your gateway to delicious food delivered right to your doorstep!</p>
              <p>We're excited to have you join our community of food lovers.</p>
            </div>

            <div class="features">
              <h3>What you can do with FoodieExpress:</h3>
              <div class="feature-item">🍕 Browse hundreds of restaurants and cuisines</div>
              <div class="feature-item">🛒 Easy ordering with our smart cart system</div>
              <div class="feature-item">📱 Track your orders in real-time</div>
              <div class="feature-item">💳 Secure and simple payment process</div>
              <div class="feature-item">📧 Email notifications for all order updates</div>
            </div>
            
            <p>Ready to order? Start exploring restaurants near you and place your first order!</p>
          </div>
          
          <div class="footer">
            <p>Happy eating!</p>
            <p>The FoodieExpress Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'FoodieExpress <noreply@foodieexpress.com>',
      to: user.email,
      subject: 'Welcome to FoodieExpress! 🍕',
      html,
    });
  }
}

export const emailService = new EmailService();
