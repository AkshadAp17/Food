import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Clock, MapPin, Package, Eye } from 'lucide-react';
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
    imageUrl: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  deliveryAddress: string;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    imageUrl: string;
  };
  orderItems: OrderItem[];
}

export function OrdersPage() {
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load orders",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate, toast]);

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
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalItems = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
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
              Back to home
            </Button>
            <h1 className="text-xl font-semibold">Your Orders ({orders.length})</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">When you place your first order, it will appear here.</p>
            <Button onClick={() => navigate('/')}>
              Start ordering
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {(orders || []).map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <img
                          src={order.restaurant.imageUrl}
                          alt={order.restaurant.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{order.restaurant.name}</h3>
                          <p className="text-gray-600">Order #{order.orderNumber}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {getTotalItems(order.orderItems)} items
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="text-sm text-gray-600 mb-3">
                        {(order.orderItems || []).slice(0, 2).map((item, index) => (
                          <span key={item.id}>
                            {item.foodItem.name} ({item.quantity}x)
                            {index < Math.min(order.orderItems.length, 2) - 1 && ', '}
                          </span>
                        ))}
                        {order.orderItems.length > 2 && (
                          <span> and {order.orderItems.length - 2} more items</span>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-xs">{order.deliveryAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">${order.totalAmount}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/track/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                        
                        {order.status === 'delivered' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              // Add items to cart and navigate to checkout
                              toast({
                                title: "Reorder functionality",
                                description: "This feature will be available soon!"
                              });
                            }}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
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