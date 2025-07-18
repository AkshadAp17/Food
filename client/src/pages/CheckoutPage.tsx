import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, CreditCard, MapPin, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export function CheckoutPage() {
  const [, navigate] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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
          const data = await response.json();
          if (!data || !Array.isArray(data) || data.length === 0) {
            navigate('/cart');
            return;
          }
          setCartItems(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load cart items",
            variant: "destructive"
          });
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
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
      setDeliveryAddress(user.address ? `${user.address}, ${user.city || ''}, ${user.pincode || ''}`.trim().replace(/,$/, '') : '');
    }
  }, [user]);

  const getTotalPrice = () => {
    if (!cartItems || cartItems.length === 0) return "0.00";
    return cartItems.reduce((total, item) => {
      const price = item.foodItem?.price ? parseFloat(item.foodItem.price) : 0;
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const getTotalItems = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
      const restaurantId = cartItems[0]?.foodItem?.restaurant?.id;
      
      if (!restaurantId) {
        throw new Error("Unable to identify restaurant from cart items");
      }
      
      const orderData = {
        order: {
          userId: user!.id,
          restaurantId,
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
        items: (cartItems || []).map(item => ({
          foodItemId: item.foodItem?.id || '',
          quantity: item.quantity,
          price: item.foodItem?.price ? parseFloat(item.foodItem.price).toString() : '0'
        })).filter(item => item.foodItemId)
      };

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
          title: "Order Placed Successfully! 🎉",
          description: `Order #${order.orderNumber} has been placed. Please check your email for payment confirmation instructions.`,
          variant: "default"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cart')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to cart
            </Button>
            <h1 className="text-xl font-semibold">Checkout</h1>
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
                      placeholder="e.g., Ring the doorbell, Leave at door"
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
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when your order arrives</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Online Payment</div>
                      <div className="text-sm text-gray-600">Pay securely online (Email verification required)</div>
                    </div>
                  </label>
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
                  {(cartItems || []).map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.foodItem?.name || 'Unknown Item'}</div>
                        <div className="text-xs text-gray-500">{item.foodItem?.restaurant?.name || 'Unknown Restaurant'}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-medium text-sm">
                        ${item.foodItem?.price ? (parseFloat(item.foodItem.price) * item.quantity).toFixed(2) : '0.00'}
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