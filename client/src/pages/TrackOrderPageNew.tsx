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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('TrackOrderPageNew rendered with orderId:', orderId);

  useEffect(() => {
    const fetchOrder = async () => {
      console.log('fetchOrder called with orderId:', orderId);
      
      if (!orderId) {
        console.log('No orderId provided, navigating to orders');
        navigate('/orders');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching order details for:', orderId);
        
        const response = await fetch(`/api/orders/details/${orderId}`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const rawData = await response.json();
          console.log('Raw order data received:', rawData);
          
          // Check for null or undefined rawData
          if (!rawData) {
            throw new Error('No data received from server');
          }
          
          try {
            // Safely transform the data with extensive null checks
            const safeData: SafeOrder = {
              id: String(rawData.id || ''),
              orderNumber: String(rawData.orderNumber || 'Unknown'),
              status: String(rawData.status || 'unknown'),
              totalAmount: String(rawData.total || rawData.totalAmount || '0.00'),
              deliveryAddress: String(rawData.deliveryAddress || 'Unknown address'),
              phone: String(rawData.customerPhone || rawData.phone || 'Unknown'),
              paymentMethod: String(rawData.paymentMethod || 'unknown'),
              instructions: String(rawData.specialInstructions || rawData.instructions || ''),
              createdAt: String(rawData.createdAt || new Date().toISOString()),
              estimatedDeliveryTime: String(rawData.estimatedDeliveryTime || ''),
              restaurant: rawData.restaurant && typeof rawData.restaurant === 'object' ? {
                id: String(rawData.restaurant.id || ''),
                name: String(rawData.restaurant.name || 'Unknown Restaurant'),
                address: String(rawData.restaurant.address || 'Unknown address'),
                phone: String(rawData.restaurant.phone || 'Unknown')
              } : {
                id: '',
                name: 'Unknown Restaurant',
                address: 'Unknown address',
                phone: 'Unknown'
              },
              orderItems: Array.isArray(rawData.orderItems) ? rawData.orderItems.map((item: any, index: number) => {
                console.log(`Processing order item ${index}:`, item);
                return {
                  id: String(item?.id || `item-${index}`),
                  quantity: Number(item?.quantity || 1),
                  price: String(item?.price || '0.00'),
                  foodItem: item?.foodItem && typeof item.foodItem === 'object' ? {
                    id: String(item.foodItem.id || ''),
                    name: String(item.foodItem.name || 'Unknown Item'),
                    price: String(item.foodItem.price || item.price || '0.00'),
                    imageUrl: String(item.foodItem.imageUrl || '')
                  } : {
                    id: '',
                    name: 'Unknown Item',
                    price: '0.00',
                    imageUrl: ''
                  }
                };
              }) : [],
              tracking: Array.isArray(rawData.tracking) ? rawData.tracking.map((track: any, index: number) => {
                console.log(`Processing tracking item ${index}:`, track);
                return {
                  id: String(track?.id || `track-${index}`),
                  status: String(track?.status || ''),
                  message: String(track?.message || ''),
                  timestamp: String(track?.timestamp || new Date().toISOString())
                };
              }) : []
            };

            console.log('Transformed safe order data:', safeData);
            setOrder(safeData);
          } catch (transformError) {
            console.error('Error transforming order data:', transformError);
            setError('Failed to process order data');
            return;
          }
        } else if (response.status === 404) {
          setError('Order not found');
          toast({
            title: "Order not found",
            description: "The order you're looking for doesn't exist",
            variant: "destructive"
          });
        } else {
          throw new Error(`HTTP ${response.status}: Failed to fetch order`);
        }
      } catch (error) {
        console.error('Error in fetchOrder:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        toast({
          title: "Error",
          description: `Failed to load order details: ${errorMessage}`,
          variant: "destructive"
        });
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Order</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
            <Button onClick={() => navigate('/orders')}>
              View All Orders
            </Button>
          </div>
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