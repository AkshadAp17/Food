import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/toaster';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Clock, Check, CreditCard, Banknote } from 'lucide-react';

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

export function CheckoutPageNew() {
  const [, navigate] = useLocation();
  const [cartItems, setCartItems] = useState<SafeCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form data
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [instructions, setInstructions] = useState('');

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

          if (safeData.length === 0) {
            toast({
              title: "Empty Cart",
              description: "Your cart is empty. Please add items before checkout.",
              variant: "destructive"
            });
            navigate('/cart');
            return;
          }
          
          setCartItems(safeData);
        } else {
          console.error('Failed to fetch cart:', response.status);
          toast({
            title: "Error",
            description: "Failed to load cart items",
            variant: "destructive"
          });
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive"
        });
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, navigate, toast]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      const userAddress = user.address ? `${user.address}, ${user.city || ''}, ${user.pincode || ''}`.trim().replace(/,$/, '') : '';
      setDeliveryAddress(userAddress);
    }
  }, [user]);

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

  const getFinalTotal = () => {
    const subtotal = parseFloat(getTotalPrice());
    const deliveryFee = 3.00;
    const tax = subtotal * 0.1;
    return (subtotal + deliveryFee + tax).toFixed(2);
  };

  const placeOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before placing an order.",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a delivery address",
        variant: "destructive"
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: "Missing Information", 
        description: "Please provide a phone number",
        variant: "destructive"
      });
      return;
    }

    setPlacing(true);

    try {
      // Calculate totals
      const subtotal = parseFloat(getTotalPrice());
      const deliveryFee = 3.00;
      const tax = subtotal * 0.1;
      const total = subtotal + deliveryFee + tax;

      // Get restaurant info from cart items
      const firstValidItem = cartItems.find(item => item.foodItem?.restaurant?.id);
      if (!firstValidItem?.foodItem?.restaurant?.id) {
        throw new Error("Unable to identify restaurant from cart items");
      }

      const orderData = {
        order: {
          userId: user!.id,
          restaurantId: firstValidItem.foodItem.restaurant.id,
          subtotal: subtotal.toString(),
          deliveryFee: deliveryFee.toString(),
          taxes: tax.toString(),
          total: total.toString(),
          paymentMethod,
          deliveryAddress,
          customerPhone: phone,
          customerName: `${user!.firstName} ${user!.lastName}`,
          specialInstructions: instructions || null
        },
        items: cartItems
          .filter(item => item.foodItem)
          .map(item => ({
            foodItemId: item.foodItem!.id,
            quantity: item.quantity,
            price: item.foodItem!.price
          }))
      };

      console.log('Placing order with data:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        
        // Clear cart after successful order
        await fetch(`/api/cart/${user!.id}`, { method: 'DELETE' });
        
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.orderNumber} has been placed. Please check your email for payment confirmation instructions.`,
          variant: "success"
        });

        // Navigate to order tracking
        navigate(`/track/${order.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/')}>Browse Restaurants</Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <Button variant="outline" onClick={() => navigate('/cart')}>
              Back to Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                    <Input
                      placeholder="Enter your full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Instructions (Optional)</label>
                    <Input
                      placeholder="e.g., Ring the doorbell, Leave at door, etc."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cash"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-600"
                    />
                    <label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                      <Banknote className="h-4 w-4" />
                      Cash on Delivery
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-600"
                    />
                    <label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Email Payment Verification
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Delivery Time */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Estimated Delivery Time
                </h3>
                <div className="text-gray-600">
                  <p>Your order will be delivered in approximately <strong>35-45 minutes</strong></p>
                  <p className="text-sm mt-2">Delivery time may vary based on restaurant preparation time and traffic conditions.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {item.foodItem?.name || 'Unknown Item'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.foodItem?.restaurant?.name || 'Unknown Restaurant'}
                        </div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-medium text-sm">
                        ${item.foodItem ? (parseFloat(item.foodItem.price) * item.quantity).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                {/* Price Breakdown */}
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
                    <span>Taxes & Fees</span>
                    <span>${(parseFloat(getTotalPrice()) * 0.1).toFixed(2)}</span>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${getFinalTotal()}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6"
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Place Order (${getFinalTotal()})
                    </>
                  )}
                </Button>

                {paymentMethod === 'card' && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    You will receive an email with payment instructions after placing your order.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}