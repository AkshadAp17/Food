import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import OrderTracking from "@/components/order-tracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Phone, Receipt } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

export default function Orders() {
  const { toast } = useToast();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['/api/orders'],
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-1/3 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
        
        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order: OrderWithItems) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #FE{order.id}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.restaurant.name} • {order.restaurant.cuisine}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                      <p className="text-lg font-semibold mt-2">
                        ${order.totalAmount}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Receipt className="w-4 h-4 mr-2" />
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {order.orderItems?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.foodItem.name}
                            </span>
                            <span>${item.totalPrice}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${order.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee</span>
                          <span>${order.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>${order.tax}</span>
                        </div>
                        <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                          <span>Total</span>
                          <span>${order.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Delivery Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <strong>Address:</strong> {order.deliveryAddress}
                        </p>
                        <p className="text-gray-600">
                          <strong>Phone:</strong> {order.phone}
                        </p>
                        {order.estimatedDeliveryTime && (
                          <p className="text-gray-600 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <strong>Estimated Delivery:</strong> {' '}
                            {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                        {order.notes && (
                          <p className="text-gray-600">
                            <strong>Notes:</strong> {order.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        {order.status === 'out_for_delivery' || order.status === 'preparing' ? (
                          <OrderTracking orderId={order.id} />
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/restaurant/${order.restaurantId}`}
                          >
                            Order Again
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                When you place your first order, it will appear here.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Start Ordering
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
