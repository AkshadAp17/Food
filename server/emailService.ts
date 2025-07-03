import nodemailer from 'nodemailer';
import { User, OrderWithDetails } from '@shared/schema';

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
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendOTPEmail(email: string, otpCode: string, firstName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"FoodieExpress" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Account - OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">FoodieExpress</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Hello ${firstName}!</h2>
              <p style="color: #666; font-size: 16px;">Welcome to FoodieExpress! Please verify your account using the OTP code below:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 8px;">${otpCode}</h1>
                <p style="color: #888; margin-top: 10px;">This code expires in 10 minutes</p>
              </div>
              
              <p style="color: #666;">If you didn't request this verification, please ignore this email.</p>
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #888; font-size: 14px;">
                  Happy ordering!<br>
                  The FoodieExpress Team
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return false;
    }
  }

  async sendPaymentVerificationEmail(
    order: OrderWithDetails, 
    userEmail: string,
    paymentAmount: number
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"FoodieExpress Payments" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Payment Verification Required - Order #${order.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">FoodieExpress</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Payment Verification Required</h2>
              <p style="color: #666; font-size: 16px;">Dear ${order.customerName},</p>
              <p style="color: #666;">Your order has been placed successfully! Please verify your payment by replying to this email.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #667eea; margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> #${order.orderNumber}</p>
                <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
                <p><strong>Total Amount:</strong> ₹${paymentAmount}</p>
                <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
                
                <div style="margin-top: 20px;">
                  <h4 style="color: #333;">Items Ordered:</h4>
                  ${order.orderItems.map(item => `
                    <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                      <p style="margin: 0;"><strong>${item.foodItem.name}</strong> x ${item.quantity}</p>
                      <p style="margin: 0; color: #666;">₹${item.price} each</p>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                <h3 style="color: #333; margin-top: 0;">Payment Instructions:</h3>
                <p style="color: #666; margin: 0;">
                  <strong>Payment Method:</strong> Cash on Delivery (COD)<br>
                  <strong>Amount to Pay:</strong> ₹${paymentAmount}<br><br>
                  Please reply to this email with "PAYMENT CONFIRMED" to confirm that you agree to pay the above amount upon delivery. 
                  Once confirmed, your order will be processed and preparation will begin.
                </p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #888; font-size: 14px;">
                  Thank you for choosing FoodieExpress!<br>
                  The FoodieExpress Team
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending payment verification email:', error);
      return false;
    }
  }

  async sendOrderConfirmationEmail(order: OrderWithDetails, userEmail: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"FoodieExpress" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Order Confirmed - #${order.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Thank you, ${order.customerName}!</h2>
              <p style="color: #666; font-size: 16px;">Your order has been confirmed and is being prepared.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #28a745; margin-top: 0;">Order #${order.orderNumber}</h3>
                <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
                <p><strong>Status:</strong> <span style="color: #28a745;">✅ Confirmed & Being Prepared</span></p>
                <p><strong>Estimated Delivery:</strong> 30-45 minutes</p>
                <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
                <p><strong>Phone:</strong> ${order.customerPhone}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</p>
                
                <div style="margin-top: 20px;">
                  <h4 style="color: #333; margin-bottom: 10px;">Your Order Items:</h4>
                  ${order.orderItems.map(item => `
                    <div style="border-bottom: 1px solid #eee; padding: 8px 0; display: flex; justify-content: space-between;">
                      <div>
                        <span style="font-weight: 500;">${item.foodItem.name}</span>
                        <span style="color: #666;"> x${item.quantity}</span>
                      </div>
                      <span style="font-weight: 500;">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  `).join('')}
                  
                  <div style="border-top: 2px solid #28a745; padding-top: 10px; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #28a745;">
                      <span>Total Amount:</span>
                      <span>$${order.total}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <h4 style="color: #333; margin-top: 0;">What happens next?</h4>
                <ul style="color: #666; margin: 0; padding-left: 20px;">
                  <li>Your order is now being prepared by the restaurant</li>
                  <li>You'll receive updates via email as your order progresses</li>
                  <li>Our delivery partner will contact you when they're on the way</li>
                  <li>${order.paymentMethod === 'cash' ? 'Please keep the exact amount ready for cash payment' : 'Payment has been processed successfully'}</li>
                </ul>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #888; font-size: 14px;">
                  You can track your order in the app.<br>
                  The FoodieExpress Team
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }

  async sendOrderStatusUpdateEmail(
    order: OrderWithDetails, 
    userEmail: string, 
    newStatus: string
  ): Promise<boolean> {
    try {
      const statusMessages = {
        'confirmed': 'Your order has been confirmed and is being prepared.',
        'preparing': 'Your order is being prepared with love!',
        'out_for_delivery': 'Your order is on its way!',
        'delivered': 'Your order has been delivered. Enjoy your meal!',
        'cancelled': 'Your order has been cancelled.'
      };

      const statusColors = {
        'confirmed': '#28a745',
        'preparing': '#ffc107',
        'out_for_delivery': '#17a2b8',
        'delivered': '#28a745',
        'cancelled': '#dc3545'
      };

      const mailOptions = {
        from: `"FoodieExpress" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Order Update - #${order.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, ${statusColors[newStatus as keyof typeof statusColors]} 0%, #667eea 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Order Update</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Hello ${order.customerName}!</h2>
              <p style="color: #666; font-size: 16px;">${statusMessages[newStatus as keyof typeof statusMessages]}</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: ${statusColors[newStatus as keyof typeof statusColors]}; margin-top: 0;">Order #${order.orderNumber}</h3>
                <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColors[newStatus as keyof typeof statusColors]}; text-transform: capitalize;">${newStatus.replace('_', ' ')}</span></p>
                <p><strong>Total Amount:</strong> ₹${order.total}</p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #888; font-size: 14px;">
                  Track your order in real-time in the app.<br>
                  The FoodieExpress Team
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending order status update email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();