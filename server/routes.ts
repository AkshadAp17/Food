import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { emailService } from "./emailService";
import { 
  insertRestaurantSchema, 
  insertCategorySchema, 
  insertFoodItemSchema, 
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import { z } from "zod";

// Simple auth middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Restaurant routes
  app.get('/api/restaurants', async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get('/api/restaurants/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.post('/api/restaurants', isAuthenticated, async (req, res) => {
    try {
      const restaurantData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(restaurantData);
      res.status(201).json(restaurant);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Food item routes
  app.get('/api/food-items', async (req, res) => {
    try {
      const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const foodItems = await storage.getFoodItems(restaurantId, categoryId);
      res.json(foodItems);
    } catch (error) {
      console.error("Error fetching food items:", error);
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  app.post('/api/food-items', isAuthenticated, async (req, res) => {
    try {
      const foodItemData = insertFoodItemSchema.parse(req.body);
      const foodItem = await storage.createFoodItem(foodItemData);
      res.status(201).json(foodItem);
    } catch (error) {
      console.error("Error creating food item:", error);
      res.status(500).json({ message: "Failed to create food item" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:foodItemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const foodItemId = parseInt(req.params.foodItemId);
      const { quantity } = z.object({ quantity: z.number().min(1) }).parse(req.body);
      
      const cartItem = await storage.updateCartItem(userId, foodItemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:foodItemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const foodItemId = parseInt(req.params.foodItemId);
      await storage.removeFromCart(userId, foodItemId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email is required for order confirmation" });
      }

      const { orderData, orderItems } = z.object({
        orderData: insertOrderSchema,
        orderItems: z.array(insertOrderItemSchema),
      }).parse(req.body);

      const orderWithUserId = {
        ...orderData,
        userId,
      };

      const order = await storage.createOrder(orderWithUserId, orderItems);
      
      // Clear the cart after successful order
      await storage.clearCart(userId);
      
      // Get the full order details for email
      const fullOrder = await storage.getOrder(order.id);
      if (fullOrder) {
        await emailService.sendOrderConfirmation(fullOrder, user.email);
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Ensure user can only access their own orders
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = z.object({ status: z.string() }).parse(req.body);
      
      const order = await storage.updateOrderStatus(orderId, status);
      
      // Get full order details and user info for email notification
      const fullOrder = await storage.getOrder(orderId);
      const user = await storage.getUser(order.userId);
      
      if (fullOrder && user && user.email) {
        await emailService.sendOrderStatusUpdate(fullOrder, user.email);
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Payment verification route (mock implementation)
  app.post('/api/payment/verify', isAuthenticated, async (req, res) => {
    try {
      const { orderId, paymentMethod } = z.object({
        orderId: z.number(),
        paymentMethod: z.string(),
      }).parse(req.body);

      // Mock payment verification - in real app, integrate with payment gateway
      const paymentVerified = true; // Always return true for demo
      
      if (paymentVerified) {
        // Update order status
        const updatedOrder = await storage.updateOrderStatus(orderId, 'confirmed');
        
        // Get full order details and user info for payment verification email
        const fullOrder = await storage.getOrder(orderId);
        const user = await storage.getUser(updatedOrder.userId);
        
        if (fullOrder && user && user.email) {
          // Generate mock payment details
          const paymentDetails = {
            paymentMethod: paymentMethod,
            cardLastFour: paymentMethod.includes('card') ? '4242' : undefined,
            amount: parseFloat(fullOrder.totalAmount),
            transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          };
          
          // Send payment verification email
          try {
            const { emailService } = await import('./emailService');
            await emailService.sendPaymentVerification(fullOrder, user.email, paymentDetails);
            console.log("Payment verification email sent to:", user.email);
          } catch (emailError) {
            console.error("Failed to send payment verification email:", emailError);
          }
        }
        
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Initialize some sample data if needed
  app.post('/api/init-data', async (req, res) => {
    try {
      // Create sample categories
      const categories = [
        { name: "Fast Food", imageUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" },
        { name: "Pizza", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" },
        { name: "Asian", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" },
        { name: "Indian", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" },
        { name: "Healthy", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" },
        { name: "Desserts", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" },
      ];

      for (const category of categories) {
        await storage.createCategory(category);
      }

      // Create sample restaurants
      const restaurants = [
        {
          name: "The Gourmet Corner",
          description: "Fine dining with a modern twist",
          cuisine: "Italian, Continental",
          imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
          rating: "4.5",
          deliveryTime: "25-30 mins",
          minimumOrder: "15.00",
          deliveryFee: "3.99",
          address: "123 Main St, City",
          phone: "+1234567890",
        },
        {
          name: "Mario's Pizzeria",
          description: "Authentic Italian pizza with wood-fired oven",
          cuisine: "Pizza, Italian",
          imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", 
          rating: "4.7",
          deliveryTime: "20-25 mins",
          minimumOrder: "12.00",
          deliveryFee: "2.99",
          address: "456 Pizza Ave, City",
          phone: "+1234567891",
        },
        {
          name: "Dragon Wok",
          description: "Traditional Asian cuisine with modern presentation",
          cuisine: "Chinese, Thai",
          imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
          rating: "4.3",
          deliveryTime: "30-35 mins",
          minimumOrder: "18.00",
          deliveryFee: "4.99",
          address: "789 Asian Way, City",
          phone: "+1234567892",
        },
      ];

      for (const restaurant of restaurants) {
        await storage.createRestaurant(restaurant);
      }

      // Create sample food items
      const foodItems = [
        {
          restaurantId: 1,
          categoryId: 1,
          name: "Grilled Chicken Sandwich",
          description: "Juicy grilled chicken with fresh vegetables",
          price: "12.99",
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
          preparationTime: 15,
          calories: 450,
        },
        {
          restaurantId: 1,
          categoryId: 5,
          name: "Caesar Salad",
          description: "Fresh romaine lettuce with Caesar dressing",
          price: "10.99",
          imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
          isVegetarian: true,
          preparationTime: 10,
          calories: 280,
        },
        {
          restaurantId: 2,
          categoryId: 2,
          name: "Margherita Pizza",
          description: "Classic pizza with tomato, mozzarella, and basil",
          price: "18.99",
          imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
          isVegetarian: true,
          preparationTime: 20,
          calories: 650,
        },
        {
          restaurantId: 2,
          categoryId: 2,
          name: "Pepperoni Pizza",
          description: "Classic pepperoni pizza with mozzarella cheese",
          price: "21.99",
          imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
          preparationTime: 20,
          calories: 720,
        },
        {
          restaurantId: 3,
          categoryId: 3,
          name: "Pad Thai",
          description: "Traditional Thai stir-fried noodles",
          price: "15.99",
          imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
          preparationTime: 18,
          calories: 540,
        },
        {
          restaurantId: 3,
          categoryId: 3,
          name: "Sweet and Sour Chicken",
          description: "Crispy chicken with sweet and sour sauce",
          price: "17.99",
          imageUrl: "https://images.unsplash.com/photo-1583474491329-9b0b4ead7d9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
          preparationTime: 22,
          calories: 620,
        },
      ];

      for (const foodItem of foodItems) {
        await storage.createFoodItem(foodItem);
      }

      res.json({ message: "Sample data initialized successfully" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
