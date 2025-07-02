import { db } from './db';
import { orders } from '@shared/schema';
import { eq, notInArray } from 'drizzle-orm';
import { emailService } from './emailService';

export class SimpleOrderTrackingService {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    console.log('Starting simple order tracking service...');
    // Check orders every 60 seconds
    this.intervalId = setInterval(async () => {
      await this.processOrderUpdates();
    }, 60000);
    
    console.log('Simple order tracking service started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Simple order tracking service stopped');
    }
  }

  private async processOrderUpdates() {
    try {
      // Get all active orders
      const activeOrders = await db
        .select()
        .from(orders)
        .where(notInArray(orders.status, ['delivered', 'cancelled']));
      
      for (const order of activeOrders) {
        const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
        const orderAge = Date.now() - createdAt.getTime();
        const minutesElapsed = Math.floor(orderAge / (1000 * 60));
        
        let newStatus = order.status;
        
        // Simulate realistic order progression
        switch (order.status) {
          case 'confirmed':
            if (minutesElapsed >= 3) {
              newStatus = 'preparing';
            }
            break;
          case 'preparing':
            if (minutesElapsed >= 8) {
              newStatus = 'out_for_delivery';
            }
            break;
          case 'out_for_delivery':
            if (minutesElapsed >= 15) {
              newStatus = 'delivered';
            }
            break;
        }
        
        // Update status if changed
        if (newStatus !== order.status) {
          await db
            .update(orders)
            .set({ status: newStatus, updatedAt: new Date() })
            .where(eq(orders.id, order.id));
          
          console.log(`Order #${order.id} status updated to ${newStatus}`);
          
          // Send email notification (skip for now to avoid email errors)
          try {
            // TODO: Send email when email service is properly configured
            console.log(`Email notification would be sent for order #${order.id}`);
          } catch (error) {
            console.log('Email notification skipped:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error processing order updates:', error);
    }
  }

  async updateOrderStatus(orderId: number, status: string) {
    try {
      await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, orderId));
      
      console.log(`Order #${orderId} status manually updated to ${status}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

export const simpleOrderTrackingService = new SimpleOrderTrackingService();