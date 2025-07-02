import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, X, ShoppingBag } from "lucide-react";
import type { CartItemWithDetails } from "@shared/schema";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['/api/cart'],
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ foodItemId, quantity }: { foodItemId: number; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/${foodItemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
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
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (foodItemId: number) => {
      await apiRequest('DELETE', `/api/cart/${foodItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
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
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (foodItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCartMutation.mutate(foodItemId);
    } else {
      updateCartMutation.mutate({ foodItemId, quantity: newQuantity });
    }
  };

  const handleCheckout = () => {
    // Check if all items are from the same restaurant
    if (cartItems && cartItems.length > 0) {
      const restaurantIds = [...new Set(cartItems.map((item: CartItemWithDetails) => item.foodItem.restaurant.id))];
      if (restaurantIds.length > 1) {
        toast({
          title: "Multiple restaurants",
          description: "Please order from one restaurant at a time",
          variant: "destructive",
        });
        return;
      }
    }
    
    onClose();
    setLocation('/checkout');
  };

  // Calculate totals
  const subtotal = cartItems?.reduce((sum: number, item: CartItemWithDetails) => 
    sum + (parseFloat(item.foodItem.price) * item.quantity), 0
  ) || 0;
  
  const deliveryFee = cartItems?.[0]?.foodItem.restaurant.deliveryFee 
    ? parseFloat(cartItems[0].foodItem.restaurant.deliveryFee) 
    : 3.99;
  
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Your Cart
          </SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex-1 py-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="bg-gray-200 w-16 h-16 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : cartItems && cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1 py-6">
              <div className="space-y-4">
                {cartItems.map((item: CartItemWithDetails) => (
                  <div key={item.id} className="flex items-center space-x-4 group">
                    <img
                      src={item.foodItem.imageUrl || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                      alt={item.foodItem.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.foodItem.name}</h4>
                      <p className="text-xs text-gray-600">{item.foodItem.restaurant.name}</p>
                      <p className="text-primary font-semibold text-sm">${item.foodItem.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handleQuantityChange(item.foodItem.id, item.quantity - 1)}
                        disabled={updateCartMutation.isPending || removeFromCartMutation.isPending}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handleQuantityChange(item.foodItem.id, item.quantity + 1)}
                        disabled={updateCartMutation.isPending}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromCartMutation.mutate(item.foodItem.id)}
                      disabled={removeFromCartMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add items from a restaurant to get started</p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
