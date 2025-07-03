import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Clock, MapPin, Phone, CheckCircle, Package, Truck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

interface SafeOrderItem {
  id: string;
  quantity: number;
  price: string;
  foodItem: {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
  } | null;
}

interface SafeOrderTracking {
  id: string;
  status: string;
  message: string;
  timestamp: string;
}

interface SafeOrder {
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
  } | null;
  orderItems: SafeOrderItem[];
  tracking: SafeOrderTracking[];
}

export function TrackOrderPageNew() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();
  const [order, setOrder] = useState<SafeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate('/orders');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/orders/details/${orderId}`);
        
        if (response.ok) {
          const rawData = await response.json();
          console.log('Raw order data:', rawData);
          
          // Safely transform the data
          const safeData: SafeOrder = {
            id: rawData.id || '',
            orderNumber: rawData.orderNumber || 'Unknown',
            status: rawData.status || 'unknown',
            totalAmount: rawData.totalAmount || rawData.total || '0.00',
            deliveryAddress: rawData.deliveryAddress || 'Unknown address',
            phone: rawData.phone || rawData.customerPhone || 'Unknown',
            paymentMethod: rawData.paymentMethod || 'unknown',
            instructions: rawData.instructions || rawData.specialInstructions || '',
            createdAt: rawData.createdAt || new Date().toISOString(),
            estimatedDeliveryTime: rawData.estimatedDeliveryTime || '',
            restaurant: rawData.restaurant ? {
              id: rawData.restaurant.id || '',
              name: rawData.restaurant.name || 'Unknown Restaurant',
              address: rawData.restaurant.address || 'Unknown address',
              phone: rawData.restaurant.phone || 'Unknown'
            } : null,
            orderItems: (rawData.orderItems || []).map((item: any) => ({
              id: item.id || Math.random().toString(),
              quantity: item.quantity || 1,
              price: item.price || '0.00',
              foodItem: item.foodItem ? {
                id: item.foodItem.id || '',
                name: item.foodItem.name || 'Unknown Item',
                price: item.foodItem.price || item.price || '0.00',
                imageUrl: item.foodItem.imageUrl || ''
              } : null
            })),
            tracking: (rawData.tracking || []).map((track: any) => ({
              id: track.id || Math.random().toString(),
              status: track.status || '',
              message: track.message || '',
              timestamp: track.timestamp || new Date().toISOString()
            }))
          };

          console.log('Safe order data:', safeData);
          setOrder(safeData);
        } else if (response.status === 404) {
          toast({
            title: "Order not found",
            description: "The order you're looking for doesn't exist",
            variant: "destructive"
          });
          navigate('/orders');
        } else {
          throw new Error('Failed to fetch order');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate, toast]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'confirmed':
        return <Clock className="h-5 w-5" />;
      case 'preparing':
        return <Package className="h-5 w-5" />;
      case 'ready':
      case 'out_for_delivery':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/orders')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to orders
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {formatStatus(order.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Timeline */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </h3>
                
                {order.tracking && order.tracking.length > 0 ? (
                  <div className="space-y-4">
                    {order.tracking.map((track, index) => (
                      <div key={track.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`p-2 rounded-full ${getStatusColor(track.status)}`}>
                            {getStatusIcon(track.status)}
                          </div>
                          {index < order.tracking.length - 1 && (
                            <div className="w-px h-8 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-medium">{formatStatus(track.status)}</div>
                          <div className="text-sm text-gray-600">{track.message}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(track.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tracking information available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Delivery Address</div>
                    <div className="text-gray-600">{order.deliveryAddress}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Phone Number</div>
                    <div className="text-gray-600">{order.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Payment Method</div>
                    <div className="text-gray-600 capitalize">
                      {order.paymentMethod.replace(/_/g, ' ')}
                    </div>
                  </div>
                  {order.instructions && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Special Instructions</div>
                      <div className="text-gray-600">{order.instructions}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-700">Order Time</div>
                    <div className="text-gray-600">{formatDate(order.createdAt)}</div>
                  </div>
                  {order.estimatedDeliveryTime && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Estimated Delivery</div>
                      <div className="text-gray-600">{formatDate(order.estimatedDeliveryTime)}</div>
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
                
                {/* Restaurant Info */}
                {order.restaurant && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {order.restaurant.name}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{order.restaurant.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{order.restaurant.phone}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <img
                          src={item.foodItem?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                          alt={item.foodItem?.name || 'Food item'}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100';
                          }}
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {item.foodItem?.name || 'Unknown Item'}
                          </div>
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

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">${order.totalAmount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}