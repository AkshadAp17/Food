import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// User Schema
export interface IUser extends Document {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpiry?: Date;
  address?: string;
  city?: string;
  pincode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiry: { type: Date },
  address: { type: String },
  city: { type: String },
  pincode: { type: String },
}, { timestamps: true });

// Restaurant Schema
export interface IRestaurant extends Document {
  _id: string;
  name: string;
  description?: string;
  cuisineType: string;
  imageUrl?: string;
  rating: number;
  deliveryTime?: string;
  minimumOrder: number;
  deliveryFee: number;
  isOpen: boolean;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  description: { type: String },
  cuisineType: { type: String, required: true },
  imageUrl: { type: String },
  rating: { type: Number, default: 0 },
  deliveryTime: { type: String },
  minimumOrder: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  address: { type: String, required: true },
  phone: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
}, { timestamps: true });

// Category Schema
export interface ICategory extends Document {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  imageUrl: { type: String },
  description: { type: String },
}, { timestamps: true });

// Food Item Schema
export interface IFoodItem extends Document {
  _id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime?: number;
  spiceLevel?: string;
  calories?: number;
  ingredients?: string;
  allergens?: string;
  createdAt: Date;
  updatedAt: Date;
}

const foodItemSchema = new Schema<IFoodItem>({
  restaurantId: { type: String, required: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  imageUrl: { type: String },
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number },
  spiceLevel: { type: String },
  calories: { type: Number },
  ingredients: { type: String },
  allergens: { type: String },
}, { timestamps: true });

// Cart Item Schema
export interface ICartItem extends Document {
  _id: string;
  userId: string;
  foodItemId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  userId: { type: String, required: true },
  foodItemId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { timestamps: true });

// Order Schema
export interface IOrder extends Document {
  _id: string;
  userId: string;
  restaurantId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  phone: string;
  paymentMethod: string;
  paymentStatus: string;
  instructions?: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  orderNumber: { type: String, required: true, unique: true },
  status: { type: String, required: true, default: 'pending' },
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true, default: 'pending' },
  instructions: { type: String },
  estimatedDeliveryTime: { type: Date },
}, { timestamps: true });

// Order Item Schema
export interface IOrderItem extends Document {
  _id: string;
  orderId: string;
  foodItemId: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  orderId: { type: String, required: true },
  foodItemId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
}, { timestamps: true });

// Order Tracking Schema
export interface IOrderTracking extends Document {
  _id: string;
  orderId: string;
  status: string;
  message: string;
  timestamp: Date;
}

const orderTrackingSchema = new Schema<IOrderTracking>({
  orderId: { type: String, required: true },
  status: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Models
export const User = mongoose.model<IUser>('User', userSchema);
export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
export const Category = mongoose.model<ICategory>('Category', categorySchema);
export const FoodItem = mongoose.model<IFoodItem>('FoodItem', foodItemSchema);
export const CartItem = mongoose.model<ICartItem>('CartItem', cartItemSchema);
export const Order = mongoose.model<IOrder>('Order', orderSchema);
export const OrderItem = mongoose.model<IOrderItem>('OrderItem', orderItemSchema);
export const OrderTracking = mongoose.model<IOrderTracking>('OrderTracking', orderTrackingSchema);

// Zod validation schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  password: z.string().min(6),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
});

export const insertRestaurantSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  cuisineType: z.string().min(1),
  imageUrl: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  deliveryTime: z.string().optional(),
  minimumOrder: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  isOpen: z.boolean().optional(),
  address: z.string().min(1),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
});

export const insertFoodItemSchema = z.object({
  restaurantId: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  imageUrl: z.string().optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().min(0).optional(),
  spiceLevel: z.string().optional(),
  calories: z.number().min(0).optional(),
  ingredients: z.string().optional(),
  allergens: z.string().optional(),
});

export const insertCartItemSchema = z.object({
  userId: z.string().min(1),
  foodItemId: z.string().min(1),
  quantity: z.number().min(1),
});

export const insertOrderSchema = z.object({
  userId: z.string().min(1),
  restaurantId: z.string().min(1),
  orderNumber: z.string().min(1),
  status: z.string().min(1),
  totalAmount: z.number().min(0),
  deliveryAddress: z.string().min(1),
  phone: z.string().min(1),
  paymentMethod: z.string().min(1),
  paymentStatus: z.string().min(1),
  instructions: z.string().optional(),
  estimatedDeliveryTime: z.date().optional(),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string().min(1),
  foodItemId: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Extended types for populated documents
export interface RestaurantWithItems extends IRestaurant {
  foodItems: IFoodItem[];
}

export interface FoodItemWithDetails extends IFoodItem {
  restaurant: IRestaurant;
  category: ICategory;
}

export interface CartItemWithDetails extends ICartItem {
  foodItem: FoodItemWithDetails;
}

export interface OrderWithDetails extends IOrder {
  orderItems: (IOrderItem & { foodItem: IFoodItem })[];
  restaurant: IRestaurant;
  tracking: IOrderTracking[];
}