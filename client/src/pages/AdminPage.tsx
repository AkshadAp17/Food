import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';
import { CheckCircle, Clock, DollarSign, MapPin, Phone, User } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  foodItem: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

interface PendingOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  deliveryAddress: string;
  phone: string;
  paymentMethod: string;
  instructions: string;
  createdAt: string;
  userEmail: string;
  restaurant: {
    id: string;
    name: string;
  };
  orderItems: OrderItem[];
}

export function AdminPage() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/api/admin/pending-orders');
      if (response.ok) {
        const orders = await response.json();
        setPendingOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const confirmPayment = async (orderId: string) => {
    setConfirming(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/confirm-payment`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Payment Confirmed",
          description: "Order has been confirmed and customer has been notified",
          variant: "default"
        });
        
        // Remove the order from pending list
        setPendingOrders(orders => orders.filter(order => order.id !== orderId));
      } else {
        throw new Error('Failed to confirm payment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConfirming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">Manage payment confirmations and order processing</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {pendingOrders.length} Pending Orders
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending payment confirmations at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-orange-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600">{order.restaurant.name}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Payment
                      </Badge>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Email:</span>
                          {order.userEmail}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {order.phone}
                        </p>
                        <p className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </p>
                        {order.instructions && (
                          <p className="text-gray-600">
                            <span className="font-medium">Instructions:</span> {order.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Order Items</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{item.foodItem.name}</span>
                              <span className="text-gray-600"> x{item.quantity}</span>
                            </div>
                            <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-2 mt-4">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Amount
                          </span>
                          <span className="text-lg">${order.totalAmount}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Payment Method: {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      onClick={() => confirmPayment(order.id)}
                      disabled={confirming === order.id}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    >
                      {confirming === order.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Confirming...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Confirm Payment & Process Order
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}