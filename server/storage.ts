import { db } from './db';
import { 
  users, restaurants, categories, foodItems, cartItems, orders, orderItems, orderTracking,
  User, InsertUser, Restaurant, InsertRestaurant, Category, InsertCategory,
  FoodItem, InsertFoodItem, CartItem, InsertCartItem, Order, InsertOrder,
  OrderItem, InsertOrderItem, OrderTracking, RestaurantWithItems,
  FoodItemWithDetails, CartItemWithDetails, OrderWithDetails
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  verifyUser(email: string, otpCode: string): Promise<boolean>;
  
  // Restaurant operations
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<RestaurantWithItems | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  searchRestaurants(query: string, cuisineType?: string): Promise<Restaurant[]>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Food item operations
  getFoodItems(restaurantId?: string, categoryId?: string): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItemWithDetails | undefined>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  searchFoodItems(query: string): Promise<FoodItemWithDetails[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<CartItemWithDetails[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(userId: string, foodItemId: string, quantity: number): Promise<CartItem>;
  removeFromCart(userId: string, foodItemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: string): Promise<OrderWithDetails[]>;
  getOrder(id: string): Promise<OrderWithDetails | undefined>;
  getAllActiveOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  addOrderTracking(orderId: string, status: string, message: string): Promise<OrderTracking>;
  
  // Authentication helpers
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  generateOTP(): string;
}

export class DatabaseStorage implements IStorage {
  
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [hashed, salt] = hash.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    const otpCode = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        otpCode,
        otpExpiry,
        isVerified: false,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyUser(email: string, otpCode: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.otpCode || !user.otpExpiry) return false;
    
    const now = new Date();
    if (now > user.otpExpiry) return false;
    
    if (user.otpCode === otpCode) {
      await this.updateUser(user.id, {
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
      });
      return true;
    }
    return false;
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.isOpen, true));
  }

  async getRestaurant(id: string): Promise<RestaurantWithItems | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    if (!restaurant) return undefined;

    const restaurantFoodItems = await db
      .select()
      .from(foodItems)
      .where(and(eq(foodItems.restaurantId, id), eq(foodItems.isAvailable, true)));

    return {
      ...restaurant,
      foodItems: restaurantFoodItems,
    };
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db
      .insert(restaurants)
      .values(restaurant)
      .returning();
    return newRestaurant;
  }

  async searchRestaurants(query: string, cuisineType?: string): Promise<Restaurant[]> {
    let whereCondition = and(
      eq(restaurants.isOpen, true),
      sql`${restaurants.name} ILIKE ${`%${query}%`} OR ${restaurants.description} ILIKE ${`%${query}%`}`
    );

    if (cuisineType) {
      whereCondition = and(
        whereCondition,
        sql`${restaurants.cuisineType} ILIKE ${`%${cuisineType}%`}`
      );
    }

    return await db.select().from(restaurants).where(whereCondition);
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getFoodItems(restaurantId?: string, categoryId?: string): Promise<FoodItem[]> {
    let whereCondition = eq(foodItems.isAvailable, true);

    if (restaurantId) {
      whereCondition = and(whereCondition, eq(foodItems.restaurantId, restaurantId));
    }

    if (categoryId) {
      whereCondition = and(whereCondition, eq(foodItems.categoryId, categoryId));
    }

    return await db.select().from(foodItems).where(whereCondition);
  }

  async getFoodItem(id: string): Promise<FoodItemWithDetails | undefined> {
    const [foodItem] = await db
      .select()
      .from(foodItems)
      .leftJoin(restaurants, eq(foodItems.restaurantId, restaurants.id))
      .leftJoin(categories, eq(foodItems.categoryId, categories.id))
      .where(eq(foodItems.id, id));

    if (!foodItem || !foodItem.restaurants || !foodItem.categories) return undefined;

    return {
      ...foodItem.food_items,
      restaurant: foodItem.restaurants,
      category: foodItem.categories,
    };
  }

  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const [newFoodItem] = await db
      .insert(foodItems)
      .values(foodItem)
      .returning();
    return newFoodItem;
  }

  async searchFoodItems(query: string): Promise<FoodItemWithDetails[]> {
    const results = await db
      .select()
      .from(foodItems)
      .leftJoin(restaurants, eq(foodItems.restaurantId, restaurants.id))
      .leftJoin(categories, eq(foodItems.categoryId, categories.id))
      .where(
        and(
          eq(foodItems.isAvailable, true),
          sql`${foodItems.name} ILIKE ${`%${query}%`} OR ${foodItems.description} ILIKE ${`%${query}%`}`
        )
      );

    return results
      .filter(item => item.restaurants && item.categories)
      .map(item => ({
        ...item.food_items,
        restaurant: item.restaurants!,
        category: item.categories!,
      }));
  }

  async getCartItems(userId: string): Promise<CartItemWithDetails[]> {
    const results = await db
      .select()
      .from(cartItems)
      .leftJoin(foodItems, eq(cartItems.foodItemId, foodItems.id))
      .leftJoin(restaurants, eq(foodItems.restaurantId, restaurants.id))
      .leftJoin(categories, eq(foodItems.categoryId, categories.id))
      .where(eq(cartItems.userId, userId));

    return results
      .filter(item => item.food_items && item.restaurants && item.categories)
      .map(item => ({
        ...item.cart_items,
        foodItem: {
          ...item.food_items!,
          restaurant: item.restaurants!,
          category: item.categories!,
        },
      }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.foodItemId, cartItem.foodItemId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + cartItem.quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cartItems)
        .values(cartItem)
        .returning();
      return newItem;
    }
  }

  async updateCartItem(userId: string, foodItemId: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.foodItemId, foodItemId)
        )
      )
      .returning();
    return updatedItem;
  }

  async removeFromCart(userId: string, foodItemId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.foodItemId, foodItemId)
        )
      );
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        orderNumber,
      })
      .returning();

    // Add order items
    await db.insert(orderItems).values(
      items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }))
    );

    // Add initial tracking
    await this.addOrderTracking(newOrder.id, 'pending', 'Order placed successfully');

    return newOrder;
  }

  async getOrders(userId: string): Promise<OrderWithDetails[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithDetails: OrderWithDetails[] = [];

    for (const orderData of userOrders) {
      if (!orderData.restaurants) continue;

      const orderItemsData = await db
        .select()
        .from(orderItems)
        .leftJoin(foodItems, eq(orderItems.foodItemId, foodItems.id))
        .where(eq(orderItems.orderId, orderData.orders.id));

      const trackingData = await db
        .select()
        .from(orderTracking)
        .where(eq(orderTracking.orderId, orderData.orders.id))
        .orderBy(desc(orderTracking.timestamp));

      ordersWithDetails.push({
        ...orderData.orders,
        restaurant: orderData.restaurants,
        orderItems: orderItemsData
          .filter(item => item.food_items)
          .map(item => ({
            ...item.order_items,
            foodItem: item.food_items!,
          })),
        tracking: trackingData,
      });
    }

    return ordersWithDetails;
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const [orderData] = await db
      .select()
      .from(orders)
      .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id))
      .where(eq(orders.id, id));

    if (!orderData || !orderData.restaurants) return undefined;

    const orderItemsData = await db
      .select()
      .from(orderItems)
      .leftJoin(foodItems, eq(orderItems.foodItemId, foodItems.id))
      .where(eq(orderItems.orderId, id));

    const trackingData = await db
      .select()
      .from(orderTracking)
      .where(eq(orderTracking.orderId, id))
      .orderBy(desc(orderTracking.timestamp));

    return {
      ...orderData.orders,
      restaurant: orderData.restaurants,
      orderItems: orderItemsData
        .filter(item => item.food_items)
        .map(item => ({
          ...item.order_items,
          foodItem: item.food_items!,
        })),
      tracking: trackingData,
    };
  }

  async getAllActiveOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(
        and(
          sql`${orders.status} != 'delivered'`,
          sql`${orders.status} != 'cancelled'`
        )
      );
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    // Add tracking entry
    const statusMessages = {
      'confirmed': 'Order confirmed and being prepared',
      'preparing': 'Kitchen has started preparing your order',
      'out_for_delivery': 'Order is out for delivery',
      'delivered': 'Order delivered successfully',
      'cancelled': 'Order has been cancelled'
    };

    await this.addOrderTracking(
      id, 
      status, 
      statusMessages[status as keyof typeof statusMessages] || `Order status updated to ${status}`
    );

    return updatedOrder;
  }

  async addOrderTracking(orderId: string, status: string, message: string): Promise<OrderTracking> {
    const [tracking] = await db
      .insert(orderTracking)
      .values({
        orderId,
        status,
        message,
      })
      .returning();
    return tracking;
  }
}

export const storage = new DatabaseStorage();