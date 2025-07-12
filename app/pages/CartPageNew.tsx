import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/toaster';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';

interface SafeCartItem {
  id: string;
  quantity: number;
  foodItem: {
    id: string;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    restaurant: {
      id: string;
      name: string;
    };
  } | null;
}

export function CartPageNew() {
  const [, navigate] = useLocation();
  const [cartItems, setCartItems] = useState<SafeCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cart/${user.id}`);
      
      if (response.ok) {
        const rawData = await response.json();
        console.log('Raw cart data:', rawData);
        
        // Safely transform the data
        const safeData: SafeCartItem[] = (rawData || []).map((item: any) => ({
          id: item.id || Math.random().toString(),
          quantity: item.quantity || 1,
          foodItem: item.foodItem ? {
            id: item.foodItem.id || '',
            name: item.foodItem.name || 'Unknown Item',
            description: item.foodItem.description || '',
            price: item.foodItem.price || '0.00',
            imageUrl: item.foodItem.imageUrl || '',
            restaurant: {
              id: item.foodItem.restaurant?.id || '',
              name: item.foodItem.restaurant?.name || 'Unknown Restaurant'
            }
          } : null
        })).filter((item: SafeCartItem) => item.foodItem !== null);

        console.log('Safe cart data:', safeData);
        setCartItems(safeData);
      } else {
        console.error('Failed to fetch cart:', response.status);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const updateQuantity = async (foodItemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;

    setUpdating(foodItemId);
    try {
      const response = await fetch(`/api/cart/${user.id}/${foodItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        // Update local state
        setCartItems(prev => prev.map(item => 
          item.foodItem?.id === foodItemId 
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        toast({
          title: "Error",
          description: "Failed to update cart item",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (foodItemId: string) => {
    if (!user) return;

    setUpdating(foodItemId);
    try {
      const response = await fetch(`/api/cart/${user.id}/${foodItemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setCartItems(prev => prev.filter(item => item.foodItem?.id !== foodItemId));
        toast({
          title: "Item Removed",
          description: "Item removed from cart",
          variant: "success"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const getTotalPrice = () => {
    if (!cartItems || cartItems.length === 0) return "0.00";
    
    const total = cartItems.reduce((sum, item) => {
      if (!item.foodItem) return sum;
      const price = parseFloat(item.foodItem.price) || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    return total.toFixed(2);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
              <Button variant="outline" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
            <Button onClick={() => navigate('/')}>
              Browse Restaurants
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Your Cart ({getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''})
            </h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Food Image */}
                      <img
                        src={item.foodItem?.imageUrl || ''}
                        alt={item.foodItem?.name || 'Food item'}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                        }}
                      />

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.foodItem?.name || 'Unknown Item'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.foodItem?.restaurant?.name || 'Unknown Restaurant'}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {item.foodItem?.description || 'No description available'}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-lg font-bold text-orange-600">
                            ${item.foodItem ? (parseFloat(item.foodItem.price) * item.quantity).toFixed(2) : '0.00'}
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.foodItem!.id, item.quantity - 1)}
                                disabled={updating === item.foodItem?.id || item.quantity <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-3 py-1 min-w-[2rem] text-center">
                                {updating === item.foodItem?.id ? '...' : item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.foodItem!.id, item.quantity + 1)}
                                disabled={updating === item.foodItem?.id}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.foodItem!.id)}
                              disabled={updating === item.foodItem?.id}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>$3.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>${(parseFloat(getTotalPrice()) * 0.1).toFixed(2)}</span>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(parseFloat(getTotalPrice()) + 3.00 + (parseFloat(getTotalPrice()) * 0.1)).toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => navigate('/checkout')}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}