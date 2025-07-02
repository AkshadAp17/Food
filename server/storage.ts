import {
  users,
  restaurants,
  categories,
  foodItems,
  orders,
  orderItems,
  cartItems,
  type User,
  type InsertUser,
  type Restaurant,
  type InsertRestaurant,
  type Category,
  type InsertCategory,
  type FoodItem,
  type InsertFoodItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type RestaurantWithItems,
  type OrderWithItems,
  type CartItemWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, notInArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Restaurant operations
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<RestaurantWithItems | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Food item operations
  getFoodItems(restaurantId?: number, categoryId?: number): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItemWithDetails[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(userId: number, foodItemId: number, quantity: number): Promise<CartItem>;
  removeFromCart(userId: number, foodItemId: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: number): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  getAllActiveOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Restaurant operations
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.isOpen, true));
  }

  async getRestaurant(id: number): Promise<RestaurantWithItems | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    if (!restaurant) return undefined;

    const items = await db.select().from(foodItems).where(eq(foodItems.restaurantId, id));
    
    return {
      ...restaurant,
      foodItems: items,
    };
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Food item operations
  async getFoodItems(restaurantId?: number, categoryId?: number): Promise<FoodItem[]> {
    let conditions = [eq(foodItems.isAvailable, true)];
    
    if (restaurantId) {
      conditions.push(eq(foodItems.restaurantId, restaurantId));
    }
    
    if (categoryId) {
      conditions.push(eq(foodItems.categoryId, categoryId));
    }
    
    return await db.select().from(foodItems).where(and(...conditions));
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    const [item] = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return item;
  }

  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const [newItem] = await db.insert(foodItems).values(foodItem).returning();
    return newItem;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItemWithDetails[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        foodItemId: cartItems.foodItemId,
        quantity: cartItems.quantity,
        specialInstructions: cartItems.specialInstructions,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        foodItem: {
          id: foodItems.id,
          restaurantId: foodItems.restaurantId,
          categoryId: foodItems.categoryId,
          name: foodItems.name,
          description: foodItems.description,
          price: foodItems.price,
          imageUrl: foodItems.imageUrl,
          isVegetarian: foodItems.isVegetarian,
          isVegan: foodItems.isVegan,
          isGlutenFree: foodItems.isGlutenFree,
          isAvailable: foodItems.isAvailable,
          preparationTime: foodItems.preparationTime,
          calories: foodItems.calories,
          createdAt: foodItems.createdAt,
          updatedAt: foodItems.updatedAt,
          restaurant: {
            id: restaurants.id,
            name: restaurants.name,
            description: restaurants.description,
            cuisineType: restaurants.cuisineType,
            imageUrl: restaurants.imageUrl,
            rating: restaurants.rating,
            deliveryTime: restaurants.deliveryTime,
            minimumOrder: restaurants.minimumOrder,
            deliveryFee: restaurants.deliveryFee,
            isOpen: restaurants.isOpen,
            address: restaurants.address,
            phone: restaurants.phone,
            createdAt: restaurants.createdAt,
            updatedAt: restaurants.updatedAt,
          },
        },
      })
      .from(cartItems)
      .innerJoin(foodItems, eq(cartItems.foodItemId, foodItems.id))
      .innerJoin(restaurants, eq(foodItems.restaurantId, restaurants.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [newItem] = await db
      .insert(cartItems)
      .values(cartItem)
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.foodItemId],
        set: {
          quantity: sql`${cartItems.quantity} + ${cartItem.quantity}`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newItem;
  }

  async updateCartItem(userId: string, foodItemId: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.foodItemId, foodItemId)))
      .returning();
    return updatedItem;
  }

  async removeFromCart(userId: string, foodItemId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.foodItemId, foodItemId)));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return newOrder;
  }

  async getOrders(userId: string): Promise<OrderWithItems[]> {
    return await db
      .select({
        id: orders.id,
        userId: orders.userId,
        restaurantId: orders.restaurantId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        tax: orders.tax,
        deliveryAddress: orders.deliveryAddress,
        phone: orders.phone,
        notes: orders.notes,
        estimatedDeliveryTime: orders.estimatedDeliveryTime,
        deliveredAt: orders.deliveredAt,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        orderItems: sql`
          (SELECT json_agg(
            json_build_object(
              'id', ${orderItems.id},
              'orderId', ${orderItems.orderId},
              'foodItemId', ${orderItems.foodItemId},
              'quantity', ${orderItems.quantity},
              'price', ${orderItems.price},
              'totalPrice', ${orderItems.totalPrice},
              'specialInstructions', ${orderItems.specialInstructions},
              'foodItem', json_build_object(
                'id', ${foodItems.id},
                'name', ${foodItems.name},
                'description', ${foodItems.description},
                'price', ${foodItems.price},
                'imageUrl', ${foodItems.imageUrl}
              )
            )
          ) FROM ${orderItems} 
          INNER JOIN ${foodItems} ON ${orderItems.foodItemId} = ${foodItems.id}
          WHERE ${orderItems.orderId} = ${orders.id})
        `,
        restaurant: {
          id: restaurants.id,
          name: restaurants.name,
          cuisine: restaurants.cuisine,
          imageUrl: restaurants.imageUrl,
          phone: restaurants.phone,
        },
      })
      .from(orders)
      .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        restaurantId: orders.restaurantId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        tax: orders.tax,
        deliveryAddress: orders.deliveryAddress,
        phone: orders.phone,
        notes: orders.notes,
        estimatedDeliveryTime: orders.estimatedDeliveryTime,
        deliveredAt: orders.deliveredAt,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        orderItems: sql`
          (SELECT json_agg(
            json_build_object(
              'id', ${orderItems.id},
              'orderId', ${orderItems.orderId},
              'foodItemId', ${orderItems.foodItemId},
              'quantity', ${orderItems.quantity},
              'price', ${orderItems.price},
              'totalPrice', ${orderItems.totalPrice},
              'specialInstructions', ${orderItems.specialInstructions},
              'foodItem', json_build_object(
                'id', ${foodItems.id},
                'name', ${foodItems.name},
                'description', ${foodItems.description},
                'price', ${foodItems.price},
                'imageUrl', ${foodItems.imageUrl}
              )
            )
          ) FROM ${orderItems} 
          INNER JOIN ${foodItems} ON ${orderItems.foodItemId} = ${foodItems.id}
          WHERE ${orderItems.orderId} = ${orders.id})
        `,
        restaurant: {
          id: restaurants.id,
          name: restaurants.name,
          cuisine: restaurants.cuisine,
          imageUrl: restaurants.imageUrl,
          phone: restaurants.phone,
        },
      })
      .from(orders)
      .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
      .where(eq(orders.id, id));
    
    return order;
  }

  async getAllActiveOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(notInArray(orders.status, ['delivered', 'cancelled']))
      .orderBy(orders.createdAt);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
}

export const storage = new DatabaseStorage();
