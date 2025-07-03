import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, MapPin, Clock, Phone, CheckCircle, Package, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  foodItem: {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
  };
}

interface OrderTracking {
  id: string;
  status: string;
  message: string;
  timestamp: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  deliveryAddress: string;
  phone: string;
  paymentMethod: string;
  instructions: string;
  createdAt: string;
  estimatedDeliveryTime: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  orderItems: OrderItem[];
  tracking: OrderTracking[];
}

export function TrackOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) {
        navigate('/orders');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          toast({
            title: "Error",
            description: "Order not found",
            variant: "destructive"
          });
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Set up polling for real-time updates
    const interval = setInterval(fetchOrder, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [orderId, user, navigate, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'preparing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'out_for_delivery':
        return <Truck className="h-6 w-6 text-orange-500" />;
      case 'delivered':
        return <Home className="h-6 w-6 text-green-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Being Prepared';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 25;
      case 'preparing':
        return 50;
      case 'out_for_delivery':
        return 75;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <Button onClick={() => navigate('/orders')}>View all orders</Button>
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
              onClick={() => navigate('/orders')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to orders
            </Button>
            <h1 className="text-xl font-semibold">Order #{order.orderNumber}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h2 className="text-xl font-bold">{getStatusText(order.status)}</h2>
                      <p className="text-gray-600">
                        {order.status === 'delivered' 
                          ? 'Your order has been delivered successfully!' 
                          : order.status === 'out_for_delivery'
                          ? 'Your order is on its way!'
                          : order.status === 'preparing'
                          ? 'Your order is being prepared with care'
                          : 'Your order has been confirmed'}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(order.status)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Confirmed</span>
                    <span>Preparing</span>
                    <span>Out for Delivery</span>
                    <span>Delivered</span>
                  </div>
                </div>

                {/* Estimated Delivery Time */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">
                        Estimated delivery: {formatTime(order.estimatedDeliveryTime)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Tracking Timeline */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {order.tracking.map((track, index) => (
                    <div key={track.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-orange-500' : 'bg-gray-300'
                        }`}></div>
                        {index !== order.tracking.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{getStatusText(track.status)}</h4>
                            <p className="text-gray-600 text-sm">{track.message}</p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatTime(track.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Restaurant Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Restaurant Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{order.restaurant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{order.restaurant.address}</span>
                  </div>
                  {order.restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{order.restaurant.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <img
                          src={item.foodItem.imageUrl}
                          alt={item.foodItem.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-medium text-sm">{item.foodItem.name}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-medium text-sm">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                {/* Delivery Info */}
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-sm font-medium">Delivery Address:</span>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Phone:</span>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Payment:</span>
                    <p className="text-sm text-gray-600">
                      {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                  </div>
                  {order.instructions && (
                    <div>
                      <span className="text-sm font-medium">Instructions:</span>
                      <p className="text-sm text-gray-600">{order.instructions}</p>
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Paid</span>
                  <span>${order.totalAmount}</span>
                </div>

                {/* Help Options */}
                <div className="mt-6 space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    Contact Restaurant
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Need Help?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}