import { storage } from './storage';
import { emailService } from './emailService';

export class OrderTrackingService {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    console.log('Starting order tracking service...');
    // Process order updates every 30 seconds
    this.intervalId = setInterval(() => {
      this.processOrderUpdates();
    }, 30000);
    
    // Also process immediately
    this.processOrderUpdates();
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
      const activeOrders = await storage.getAllActiveOrders();
      
      for (const order of activeOrders) {
        const orderAge = Date.now() - new Date(order.createdAt).getTime();
        const ageInMinutes = Math.floor(orderAge / (1000 * 60));

        // Simulate order status progression based on time
        let newStatus = order.status;
        
        if (order.status === 'pending' && ageInMinutes >= 2) {
          newStatus = 'confirmed';
        } else if (order.status === 'confirmed' && ageInMinutes >= 5) {
          newStatus = 'preparing';
        } else if (order.status === 'preparing' && ageInMinutes >= 15) {
          newStatus = 'out_for_delivery';
        } else if (order.status === 'out_for_delivery' && ageInMinutes >= 25) {
          newStatus = 'delivered';
        }

        // Update status if changed
        if (newStatus !== order.status) {
          await this.updateOrderStatus(order.id, newStatus);
        }
      }
    } catch (error) {
      console.error('Error processing order updates:', error);
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      await storage.updateOrderStatus(orderId, status);
      
      // Send email notification
      const orderWithDetails = await storage.getOrder(orderId);
      if (orderWithDetails) {
        const user = await storage.getUser(orderWithDetails.userId);
        if (user) {
          await emailService.sendOrderStatusUpdateEmail(
            orderWithDetails,
            user.email,
            status
          );
        }
      }
      
      console.log(`Order ${orderId} status updated to: ${status}`);
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
    }
  }
}

export const orderTrackingService = new OrderTrackingService();