import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
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
  };
}

export function CartPage() {
  const [, navigate] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/cart/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setCartItems(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load cart items",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, navigate, toast]);

  const updateCartQuantity = async (foodItemId: string, newQuantity: number) => {
    if (!user) return;
    
    if (newQuantity <= 0) {
      await removeFromCart(foodItemId);
      return;
    }

    try {
      const response = await fetch(`/api/cart/${user!.id}/${foodItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: newQuantity
        })
      });

      if (response.ok) {
        setCartItems(prev => 
          prev.map(item => 
            item.foodItem.id === foodItemId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        throw new Error('Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async (foodItemId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/cart/${user!.id}/${foodItemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.foodItem.id !== foodItemId));
        toast({
          title: "Item removed",
          description: "Item removed from cart successfully"
        });
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.foodItem.price) * item.quantity);
    }, 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Group items by restaurant
  const groupedItems = cartItems.reduce((groups: {[key: string]: CartItem[]}, item) => {
    const restaurantId = item.foodItem.restaurant.id;
    if (!groups[restaurantId]) {
      groups[restaurantId] = [];
    }
    groups[restaurantId].push(item);
    return groups;
  }, {});

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue shopping
            </Button>
            <h1 className="text-xl font-semibold">Your Cart ({getTotalItems()} items)</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
            <Button onClick={() => navigate('/')}>
              Browse restaurants
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedItems || {}).map(([restaurantId, items]) => (
                <Card key={restaurantId}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {items[0].foodItem.restaurant.name}
                    </h3>
                    <div className="space-y-4">
                      {(items || []).map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <img
                            src={item.foodItem.imageUrl}
                            alt={item.foodItem.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.foodItem.name}</h4>
                            <p className="text-sm text-gray-600">{item.foodItem.description}</p>
                            <p className="text-lg font-bold text-orange-600">
                              ${item.foodItem.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.foodItem.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.foodItem.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.foodItem.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>${getTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>$3.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>${(parseFloat(getTotalPrice()) * 0.1).toFixed(2)}</span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${(parseFloat(getTotalPrice()) + 3.00 + (parseFloat(getTotalPrice()) * 0.1)).toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-6"
                    onClick={() => navigate('/checkout')}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}