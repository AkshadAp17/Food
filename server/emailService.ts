import nodemailer from 'nodemailer';
import type { OrderWithItems } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
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
}

export const emailService = new EmailService();
