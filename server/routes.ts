import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./emailService";
import { orderTrackingService } from "./orderTrackingService";
import { seedDatabase } from "./seedData";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Seed endpoint for development
  app.post("/api/seed", async (req, res) => {
    try {
      const result = await seedDatabase();
      res.json({ 
        message: "Database seeded successfully", 
        data: result 
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });
  
  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const { email, firstName, lastName, phone, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create user
      const user = await storage.createUser({
        email,
        firstName,
        lastName,
        phone: phone || null,
        password,
      });

      // Send OTP email
      const emailSent = await emailService.sendOTPEmail(user.email, user.otpCode!, user.firstName);
      if (!emailSent) {
        console.error("Failed to send OTP email");
      }

      res.status(201).json({
        message: "User registered successfully. Please verify your email with the OTP sent.",
        userId: user.id,
        email: user.email
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      const verified = await storage.verifyUser(email, otp);
      if (verified) {
        const user = await storage.getUserByEmail(email);
        res.json({ 
          message: "Email verified successfully", 
          user: {
            id: user!.id,
            email: user!.email,
            firstName: user!.firstName,
            lastName: user!.lastName,
            isVerified: user!.isVerified
          }
        });
      } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isVerified) {
        return res.status(401).json({ message: "Please verify your email first" });
      }

      const validPassword = await storage.verifyPassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          city: user.city,
          pincode: user.pincode,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
      }

      // Generate new OTP
      const otpCode = storage.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.updateUser(user.id, { otpCode, otpExpiry });

      // Send OTP email
      const emailSent = await emailService.sendOTPEmail(user.email, otpCode, user.firstName);
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send OTP email" });
      }

      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Failed to resend OTP" });
    }
  });

  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.get("/api/restaurants/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const { cuisineType } = req.query;
      const restaurants = await storage.searchRestaurants(query, cuisineType as string);
      res.json(restaurants);
    } catch (error) {
      console.error("Error searching restaurants:", error);
      res.status(500).json({ message: "Failed to search restaurants" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Food item routes
  app.get("/api/food-items", async (req, res) => {
    try {
      const { restaurantId, categoryId } = req.query;
      const foodItems = await storage.getFoodItems(
        restaurantId as string, 
        categoryId as string
      );
      res.json(foodItems);
    } catch (error) {
      console.error("Error fetching food items:", error);
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  app.get("/api/food-items/:id", async (req, res) => {
    try {
      const foodItem = await storage.getFoodItem(req.params.id);
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json(foodItem);
    } catch (error) {
      console.error("Error fetching food item:", error);
      res.status(500).json({ message: "Failed to fetch food item" });
    }
  });

  app.get("/api/food-items/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const foodItems = await storage.searchFoodItems(query);
      res.json(foodItems);
    } catch (error) {
      console.error("Error searching food items:", error);
      res.status(500).json({ message: "Failed to search food items" });
    }
  });

  // Cart routes
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      console.log("Received cart item data:", req.body);
      const cartItem = await storage.addToCart(req.body);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:userId/:foodItemId", async (req, res) => {
    try {
      const { userId, foodItemId } = req.params;
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(userId, foodItemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:userId/:foodItemId", async (req, res) => {
    try {
      const { userId, foodItemId } = req.params;
      await storage.removeFromCart(userId, foodItemId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart/:userId", async (req, res) => {
    try {
      await storage.clearCart(req.params.userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      // Create order
      const newOrder = await storage.createOrder(order, items);
      
      // Get complete order details
      const orderWithDetails = await storage.getOrder(newOrder.id);
      if (!orderWithDetails) {
        throw new Error("Failed to fetch created order");
      }

      // Send payment verification email
      const user = await storage.getUser(order.userId);
      if (user) {
        await emailService.sendPaymentVerificationEmail(
          orderWithDetails,
          user.email,
          parseFloat(order.total)
        );
      }

      // Clear user's cart
      await storage.clearCart(order.userId);

      res.status(201).json(orderWithDetails);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrders(req.params.userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/details/:orderId", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:orderId/status", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      // Send status update email
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

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Payment verification route (simulated email response)
  app.post("/api/orders/:orderId/verify-payment", async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Update payment status and order status
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Simulate payment verification
      await storage.updateOrderStatus(orderId, "confirmed");
      
      // Send confirmation email
      const user = await storage.getUser(order.userId);
      if (user) {
        await emailService.sendOrderConfirmationEmail(order, user.email);
      }

      res.json({ message: "Payment verified and order confirmed" });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Get all pending orders (for admin verification)
  app.get("/api/admin/pending-orders", async (req, res) => {
    try {
      const orders = await storage.getAllActiveOrders();
      const pendingOrders = orders.filter(order => order.status === 'pending_payment');
      
      // Get order details for each pending order
      const ordersWithDetails = await Promise.all(
        pendingOrders.map(async (order) => {
          const orderDetails = await storage.getOrder(order.id);
          const user = await storage.getUser(order.userId);
          return { ...orderDetails, userEmail: user?.email };
        })
      );
      
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      res.status(500).json({ message: "Failed to fetch pending orders" });
    }
  });

  // Admin confirm payment route
  app.post("/api/admin/orders/:orderId/confirm-payment", async (req, res) => {
    try {
      const { orderId } = req.params;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Update order status to confirmed
      await storage.updateOrderStatus(orderId, "confirmed");
      await storage.addOrderTracking(orderId, "confirmed", "Payment confirmed by admin, order is being prepared");
      
      // Send confirmation email to customer
      const user = await storage.getUser(order.userId);
      if (user) {
        await emailService.sendOrderConfirmationEmail(order, user.email);
      }

      res.json({ message: "Payment confirmed and order processed" });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Initialize sample data
  app.post("/api/init-data", async (req, res) => {
    try {
      // Create sample categories
      const categories = [
        {
          name: "Fast Food",
          description: "Quick and delicious meals",
          imageUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&h=150&fit=crop"
        },
        {
          name: "Italian",
          description: "Authentic Italian cuisine",
          imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=150&fit=crop"
        },
        {
          name: "Chinese",
          description: "Traditional Chinese dishes",
          imageUrl: "https://images.unsplash.com/photo-1563379091849-1728abc2b4e3?w=200&h=150&fit=crop"
        },
        {
          name: "Indian",
          description: "Spicy and flavorful Indian food",
          imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&h=150&fit=crop"
        }
      ];

      const createdCategories = [];
      for (const category of categories) {
        try {
          const created = await storage.createCategory(category);
          createdCategories.push(created);
        } catch (error) {
          console.log(`Category ${category.name} already exists`);
        }
      }

      // Create sample restaurants
      const restaurants = [
        {
          name: "Pizza Palace",
          description: "Authentic wood-fired pizzas and Italian classics",
          cuisineType: "Italian",
          imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=250&fit=crop",
          rating: "4.5",
          deliveryTime: "25-35 mins",
          minimumOrder: "15.00",
          deliveryFee: "2.99",
          address: "123 Main Street, Downtown",
          phone: "+1234567890"
        },
        {
          name: "Burger Junction",
          description: "Gourmet burgers and crispy fries",
          cuisineType: "Fast Food",
          imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=250&fit=crop",
          rating: "4.3",
          deliveryTime: "15-25 mins",
          minimumOrder: "10.00",
          deliveryFee: "1.99",
          address: "456 Food Street, City Center",
          phone: "+1234567891"
        },
        {
          name: "Dragon Wok",
          description: "Fresh Chinese cuisine with modern twist",
          cuisineType: "Chinese",
          imageUrl: "https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=400&h=250&fit=crop",
          rating: "4.6",
          deliveryTime: "30-40 mins",
          minimumOrder: "20.00",
          deliveryFee: "3.99",
          address: "789 Asian Avenue, Chinatown",
          phone: "+1234567892"
        }
      ];

      const createdRestaurants = [];
      for (const restaurant of restaurants) {
        try {
          const created = await storage.createRestaurant(restaurant);
          createdRestaurants.push(created);
        } catch (error) {
          console.log(`Restaurant ${restaurant.name} already exists`);
        }
      }

      res.json({ message: "Sample data initialized successfully" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  // Start order tracking service
  orderTrackingService.start();

  const httpServer = createServer(app);
  return httpServer;
}