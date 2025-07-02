import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CreditCard, MapPin, Clock, ShoppingBag } from "lucide-react";
import type { CartItemWithDetails } from "@shared/schema";

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, "Please enter a complete delivery address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["card", "cash", "digital_wallet"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ['/api/cart'],
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: "",
      phone: "",
      notes: "",
      paymentMethod: "card",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      if (!cartItems || cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Group items by restaurant
      const restaurantItems = cartItems.reduce((acc: any, item: CartItemWithDetails) => {
        const restaurantId = item.foodItem.restaurant.id;
        if (!acc[restaurantId]) {
          acc[restaurantId] = {
            restaurant: item.foodItem.restaurant,
            items: [],
          };
        }
        acc[restaurantId].items.push(item);
        return acc;
      }, {});

      // For now, we'll create one order per restaurant
      const restaurantIds = Object.keys(restaurantItems);
      if (restaurantIds.length > 1) {
        throw new Error("Please order from one restaurant at a time");
      }

      const restaurantId = parseInt(restaurantIds[0]);
      const items = restaurantItems[restaurantId].items;

      // Calculate totals
      const subtotal = items.reduce((sum: number, item: CartItemWithDetails) => 
        sum + (parseFloat(item.foodItem.price) * item.quantity), 0
      );
      const deliveryFee = parseFloat(restaurantItems[restaurantId].restaurant.deliveryFee) || 3.99;
      const tax = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + deliveryFee + tax;

      const orderData = {
        restaurantId,
        totalAmount: totalAmount.toFixed(2),
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        tax: tax.toFixed(2),
        deliveryAddress: data.deliveryAddress,
        phone: data.phone,
        notes: data.notes,
        paymentMethod: data.paymentMethod,
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      };

      const orderItems = items.map((item: CartItemWithDetails) => ({
        foodItemId: item.foodItem.id,
        quantity: item.quantity,
        price: item.foodItem.price,
        totalPrice: (parseFloat(item.foodItem.price) * item.quantity).toFixed(2),
        specialInstructions: item.specialInstructions,
      }));

      const response = await apiRequest('POST', '/api/orders', {
        orderData,
        orderItems,
      });

      return response.json();
    },
    onSuccess: async (order) => {
      // Mock payment verification
      await apiRequest('POST', '/api/payment/verify', {
        orderId: order.id,
        paymentMethod: form.getValues('paymentMethod'),
      });

      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "Order placed successfully!",
        description: "You will receive an email confirmation shortly.",
      });
      
      setLocation('/orders');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      setLocation('/');
    }
  }, [cartItems, cartLoading, setLocation]);

  // Calculate totals
  const subtotal = cartItems?.reduce((sum: number, item: CartItemWithDetails) => 
    sum + (parseFloat(item.foodItem.price) * item.quantity), 0
  ) || 0;
  
  const deliveryFee = cartItems?.[0]?.foodItem.restaurant.deliveryFee 
    ? parseFloat(cartItems[0].foodItem.restaurant.deliveryFee) 
    : 3.99;
  
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
              <div className="bg-gray-200 h-96 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your complete delivery address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special delivery instructions?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex-1">
                                  <div className="font-semibold">Credit/Debit Card</div>
                                  <div className="text-sm text-gray-500">Pay with your card</div>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                <RadioGroupItem value="digital_wallet" id="digital_wallet" />
                                <Label htmlFor="digital_wallet" className="flex-1">
                                  <div className="font-semibold">Digital Wallet</div>
                                  <div className="text-sm text-gray-500">PayPal, Apple Pay, Google Pay</div>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash" className="flex-1">
                                  <div className="font-semibold">Cash on Delivery</div>
                                  <div className="text-sm text-gray-500">Pay when you receive your order</div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Placing Order..." : `Place Order - $${total.toFixed(2)}`}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems?.map((item: CartItemWithDetails) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.foodItem.imageUrl || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                        alt={item.foodItem.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.foodItem.name}</h4>
                        <p className="text-sm text-gray-600">
                          {item.foodItem.restaurant.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.foodItem.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(parseFloat(item.foodItem.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Estimated delivery: 25-30 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
