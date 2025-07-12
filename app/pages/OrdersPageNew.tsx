import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Clock, MapPin, Package, Eye } from 'lucide-react';
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
    imageUrl: string;
  } | null;
}

interface SafeOrder {
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
  } | null;
  orderItems: SafeOrderItem[];
}

export function OrdersPageNew() {
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<SafeOrder[]>([]);
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
        const response = await fetch(`/api/orders/${user.id}`);
        
        if (response.ok) {
          const rawData = await response.json();
          console.log('Raw orders data:', rawData);
          
          // Safely transform the data
          const safeData: SafeOrder[] = (rawData || []).map((order: any) => ({
            id: order.id || Math.random().toString(),
            orderNumber: order.orderNumber || 'Unknown',
            status: order.status || 'unknown',
            totalAmount: order.total || order.totalAmount || '0.00',
            deliveryAddress: order.deliveryAddress || 'Unknown address',
            createdAt: order.createdAt || new Date().toISOString(),
            restaurant: order.restaurant ? {
              id: order.restaurant.id || '',
              name: order.restaurant.name || 'Unknown Restaurant',
              imageUrl: order.restaurant.imageUrl || ''
            } : null,
            orderItems: (order.orderItems || []).map((item: any) => ({
              id: item.id || Math.random().toString(),
              quantity: item.quantity || 1,
              price: item.price || '0.00',
              foodItem: item.foodItem ? {
                id: item.foodItem.id || '',
                name: item.foodItem.name || 'Unknown Item',
                imageUrl: item.foodItem.imageUrl || ''
              } : null
            }))
          }));

          console.log('Safe orders data:', safeData);
          setOrders(safeData);
        } else {
          console.error('Failed to fetch orders:', response.status);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive"
        });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate, toast]);

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
      return new Date(dateString).toLocaleDateString('en-US', {
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
          <p className="text-gray-600">Loading orders...</p>
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
                onClick={() => navigate('/')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start ordering now!</p>
            <Button onClick={() => navigate('/')}>
              Browse restaurants
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        <Badge className={getStatusColor(order.status)}>
                          {formatStatus(order.status)}
                        </Badge>
                        <span className="text-lg font-bold text-orange-600">
                          ${order.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* Restaurant Info */}
                    {order.restaurant && (
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={order.restaurant.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                          alt={order.restaurant.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100';
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {order.restaurant.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{order.deliveryAddress}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.foodItem?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                              alt={item.foodItem?.name || 'Food item'}
                              className="w-10 h-10 object-cover rounded-lg"
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

                    {/* Order Actions */}
                    <div className="flex flex-col items-end gap-3">
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