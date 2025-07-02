import { storage } from './storage';
import { emailService } from './emailService';

export class OrderTrackingService {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    // Check orders every 30 seconds and update status automatically
    this.intervalId = setInterval(async () => {
      await this.processOrderUpdates();
    }, 30000);
    
    console.log('Order tracking service started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Order tracking service stopped');
    }
  }

  private async processOrderUpdates() {
    try {
      // Get all active orders (not delivered or cancelled)
      const orders = await storage.getAllActiveOrders();
      
      for (const order of orders) {
        const orderAge = Date.now() - new Date(order.createdAt).getTime();
        const minutesElapsed = Math.floor(orderAge / (1000 * 60));
        
        let newStatus = order.status;
        
        // Simulate realistic order progression based on time
        switch (order.status) {
          case 'confirmed':
            if (minutesElapsed >= 2) {
              newStatus = 'preparing';
            }
            break;
          case 'preparing':
            if (minutesElapsed >= 15) {
              newStatus = 'out_for_delivery';
            }
            break;
          case 'out_for_delivery':
            if (minutesElapsed >= 25) {
              newStatus = 'delivered';
            }
            break;
        }
        
        // Update status if changed
        if (newStatus !== order.status) {
          const updatedOrder = await storage.updateOrderStatus(order.id, newStatus);
          const orderWithDetails = await storage.getOrder(order.id);
          
          if (orderWithDetails) {
            // Get user email for notification
            const user = await storage.getUser(order.userId);
            if (user?.email) {
              await emailService.sendOrderStatusUpdate(orderWithDetails, user.email);
              console.log(`Order #${order.id} status updated to ${newStatus}, email sent to ${user.email}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing order updates:', error);
    }
  }

  // Manual method to update a specific order
  async updateOrderStatus(orderId: number, status: string) {
    try {
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      const orderWithDetails = await storage.getOrder(orderId);
      
      if (orderWithDetails) {
        const user = await storage.getUser(orderWithDetails.userId);
        if (user?.email) {
          await emailService.sendOrderStatusUpdate(orderWithDetails, user.email);
        }
      }
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

export const orderTrackingService = new OrderTrackingService();