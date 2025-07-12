import bcrypt from 'bcrypt';
import { connectToDatabase } from './mongodb.js';
import {
  User, Restaurant, Category, FoodItem, CartItem, Order, OrderItem, OrderTracking,
  IUser, IRestaurant, ICategory, IFoodItem, ICartItem, IOrder, IOrderItem, IOrderTracking,
  InsertUser, InsertRestaurant, InsertCategory, InsertFoodItem, InsertCartItem, InsertOrder, InsertOrderItem,
  RestaurantWithItems, FoodItemWithDetails, CartItemWithDetails, OrderWithDetails
} from '../shared/mongoSchemas.js';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUserByEmail(email: string): Promise<IUser | undefined>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUser(id: string, data: Partial<IUser>): Promise<IUser>;
  verifyUser(email: string, otpCode: string): Promise<boolean>;
  
  // Restaurant operations
  getRestaurants(): Promise<IRestaurant[]>;
  getRestaurant(id: string): Promise<RestaurantWithItems | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<IRestaurant>;
  searchRestaurants(query: string, cuisineType?: string): Promise<IRestaurant[]>;
  
  // Category operations
  getCategories(): Promise<ICategory[]>;
  createCategory(category: InsertCategory): Promise<ICategory>;
  
  // Food item operations
  getFoodItems(restaurantId?: string, categoryId?: string): Promise<IFoodItem[]>;
  getFoodItem(id: string): Promise<FoodItemWithDetails | undefined>;
  createFoodItem(foodItem: InsertFoodItem): Promise<IFoodItem>;
  searchFoodItems(query: string): Promise<FoodItemWithDetails[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<CartItemWithDetails[]>;
  addToCart(cartItem: InsertCartItem): Promise<ICartItem>;
  updateCartItem(userId: string, foodItemId: string, quantity: number): Promise<ICartItem>;
  removeFromCart(userId: string, foodItemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<IOrder>;
  getOrders(userId: string): Promise<OrderWithDetails[]>;
  getOrder(id: string): Promise<OrderWithDetails | undefined>;
  getAllActiveOrders(): Promise<IOrder[]>;
  getAllOrders(): Promise<IOrder[]>;
  updateOrderStatus(id: string, status: string): Promise<IOrder>;
  addOrderTracking(orderId: string, status: string, message: string): Promise<IOrderTracking>;
  
  // Admin operations
  getAllUsers(): Promise<IUser[]>;
  
  // Authentication helpers
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  generateOTP(): string;
}

export class MongoStorage implements IStorage {
  constructor() {
    connectToDatabase();
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async getUser(id: string): Promise<IUser | undefined> {
    const user = await User.findById(id);
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    const user = await User.findOne({ email });
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<IUser> {
    const hashedPassword = await this.hashPassword(userData.password);
    const user = new User({
      ...userData,
      password: hashedPassword,
      otpCode: this.generateOTP(),
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    return await user.save();
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async verifyUser(email: string, otpCode: string): Promise<boolean> {
    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpiry) {
      return false;
    }

    if (user.otpCode === otpCode && user.otpExpiry > new Date()) {
      await User.findByIdAndUpdate(user._id, {
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
      });
      return true;
    }
    return false;
  }

  async getRestaurants(): Promise<IRestaurant[]> {
    return await Restaurant.find({});
  }

  async getRestaurant(id: string): Promise<RestaurantWithItems | undefined> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return undefined;

    const foodItems = await FoodItem.find({ restaurantId: id });
    return {
      ...restaurant.toObject(),
      foodItems,
    } as RestaurantWithItems;
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<IRestaurant> {
    const newRestaurant = new Restaurant(restaurant);
    return await newRestaurant.save();
  }

  async searchRestaurants(query: string, cuisineType?: string): Promise<IRestaurant[]> {
    const searchQuery: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { cuisineType: { $regex: query, $options: 'i' } },
      ],
    };

    if (cuisineType) {
      searchQuery.cuisineType = cuisineType;
    }

    return await Restaurant.find(searchQuery);
  }

  async getCategories(): Promise<ICategory[]> {
    return await Category.find({});
  }

  async createCategory(category: InsertCategory): Promise<ICategory> {
    const newCategory = new Category(category);
    return await newCategory.save();
  }

  async getFoodItems(restaurantId?: string, categoryId?: string): Promise<IFoodItem[]> {
    const query: any = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (categoryId) query.categoryId = categoryId;

    return await FoodItem.find(query);
  }

  async getFoodItem(id: string): Promise<FoodItemWithDetails | undefined> {
    const foodItem = await FoodItem.findById(id);
    if (!foodItem) return undefined;

    const restaurant = await Restaurant.findById(foodItem.restaurantId);
    const category = await Category.findById(foodItem.categoryId);

    if (!restaurant || !category) return undefined;

    return {
      ...foodItem.toObject(),
      restaurant,
      category,
    } as FoodItemWithDetails;
  }

  async createFoodItem(foodItem: InsertFoodItem): Promise<IFoodItem> {
    const newFoodItem = new FoodItem(foodItem);
    return await newFoodItem.save();
  }

  async searchFoodItems(query: string): Promise<FoodItemWithDetails[]> {
    const foodItems = await FoodItem.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    });

    const results: FoodItemWithDetails[] = [];
    for (const item of foodItems) {
      const restaurant = await Restaurant.findById(item.restaurantId);
      const category = await Category.findById(item.categoryId);
      
      if (restaurant && category) {
        results.push({
          ...item.toObject(),
          restaurant,
          category,
        } as FoodItemWithDetails);
      }
    }

    return results;
  }

  async getCartItems(userId: string): Promise<CartItemWithDetails[]> {
    const cartItems = await CartItem.find({ userId });
    const results: CartItemWithDetails[] = [];

    for (const item of cartItems) {
      const foodItemWithDetails = await this.getFoodItem(item.foodItemId);
      if (foodItemWithDetails) {
        results.push({
          ...item.toObject(),
          foodItem: foodItemWithDetails,
        } as CartItemWithDetails);
      }
    }

    return results;
  }

  async addToCart(cartItem: InsertCartItem): Promise<ICartItem> {
    const existingItem = await CartItem.findOne({
      userId: cartItem.userId,
      foodItemId: cartItem.foodItemId,
    });

    if (existingItem) {
      existingItem.quantity += cartItem.quantity;
      return await existingItem.save();
    }

    const newCartItem = new CartItem(cartItem);
    return await newCartItem.save();
  }

  async updateCartItem(userId: string, foodItemId: string, quantity: number): Promise<ICartItem> {
    const cartItem = await CartItem.findOneAndUpdate(
      { userId, foodItemId },
      { quantity },
      { new: true }
    );

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    return cartItem;
  }

  async removeFromCart(userId: string, foodItemId: string): Promise<void> {
    await CartItem.findOneAndDelete({ userId, foodItemId });
  }

  async clearCart(userId: string): Promise<void> {
    await CartItem.deleteMany({ userId });
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<IOrder> {
    const newOrder = new Order(order);
    const savedOrder = await newOrder.save();

    // Create order items
    for (const item of items) {
      const orderItem = new OrderItem({
        ...item,
        orderId: savedOrder._id.toString(),
      });
      await orderItem.save();
    }

    return savedOrder;
  }

  async getOrders(userId: string): Promise<OrderWithDetails[]> {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    const results: OrderWithDetails[] = [];

    for (const order of orders) {
      const orderItems = await OrderItem.find({ orderId: order._id.toString() });
      const restaurant = await Restaurant.findById(order.restaurantId);
      const tracking = await OrderTracking.find({ orderId: order._id.toString() }).sort({ timestamp: 1 });

      if (restaurant) {
        const orderItemsWithFoodItems = [];
        for (const item of orderItems) {
          const foodItem = await FoodItem.findById(item.foodItemId);
          if (foodItem) {
            orderItemsWithFoodItems.push({
              ...item.toObject(),
              foodItem,
            });
          }
        }

        results.push({
          ...order.toObject(),
          orderItems: orderItemsWithFoodItems,
          restaurant,
          tracking,
        } as OrderWithDetails);
      }
    }

    return results;
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const order = await Order.findById(id);
    if (!order) return undefined;

    const orderItems = await OrderItem.find({ orderId: id });
    const restaurant = await Restaurant.findById(order.restaurantId);
    const tracking = await OrderTracking.find({ orderId: id }).sort({ timestamp: 1 });

    if (!restaurant) return undefined;

    const orderItemsWithFoodItems = [];
    for (const item of orderItems) {
      const foodItem = await FoodItem.findById(item.foodItemId);
      if (foodItem) {
        orderItemsWithFoodItems.push({
          ...item.toObject(),
          foodItem,
        });
      }
    }

    return {
      ...order.toObject(),
      orderItems: orderItemsWithFoodItems,
      restaurant,
      tracking,
    } as OrderWithDetails;
  }

  async getAllActiveOrders(): Promise<IOrder[]> {
    return await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] },
    });
  }

  async getAllOrders(): Promise<IOrder[]> {
    return await Order.find({}).sort({ createdAt: -1 });
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find({}).sort({ createdAt: -1 });
  }

  async updateOrderStatus(id: string, status: string): Promise<IOrder> {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async addOrderTracking(orderId: string, status: string, message: string): Promise<IOrderTracking> {
    const tracking = new OrderTracking({
      orderId,
      status,
      message,
      timestamp: new Date(),
    });
    return await tracking.save();
  }
}

export const storage = new MongoStorage();