import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, MapPin, Clock, Phone, CheckCircle, Package, Truck, Home, ChefHat, Receipt } from 'lucide-react';
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

export function TrackOrderPageVisual() {
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

    // Poll for real-time updates every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId, user, navigate, toast]);

  const orderSteps = [
    { 
      id: 'pending_payment', 
      label: 'Order Placed', 
      icon: Receipt, 
      description: 'Order received',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    { 
      id: 'confirmed', 
      label: 'Payment Confirmed', 
      icon: CheckCircle, 
      description: 'Payment verified',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      id: 'preparing', 
      label: 'Being Prepared', 
      icon: ChefHat, 
      description: 'Chef is cooking your food',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    { 
      id: 'out_for_delivery', 
      label: 'Out for Delivery', 
      icon: Truck, 
      description: 'On the way to you',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    { 
      id: 'delivered', 
      label: 'Delivered', 
      icon: Home, 
      description: 'Ready for pickup',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    { 
      id: 'completed', 
      label: 'Order Complete', 
      icon: CheckCircle, 
      description: 'Order received by customer',
      color: 'bg-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    }
  ];

  const getCurrentStepIndex = (status: string) => {
    // Handle pending status as pending_payment
    const currentStatus = status === 'pending' ? 'pending_payment' : status;
    const index = orderSteps.findIndex(step => step.id === currentStatus);
    return index === -1 ? 0 : index;
  };

  const getStepStatus = (stepIndex: number, currentIndex: number) => {
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_payment':
        return 'Waiting for payment confirmation';
      case 'confirmed':
        return '5-10 mins to start preparation';
      case 'preparing':
        return '15-25 mins cooking time';
      case 'out_for_delivery':
        return '10-20 mins for delivery';
      case 'delivered':
        return 'Ready for pickup - Check your email!';
      case 'completed':
        return 'Order completed - Thank you!';
      default:
        return 'Processing...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Order not found</h2>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);
  const currentStep = orderSteps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Track Order</h1>
            <p className="text-sm text-gray-600">#{order.orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Current Status Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className={`${currentStep.bgColor} p-6 text-center`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentStep.color} mb-4`}>
                <currentStep.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className={`text-xl font-bold ${currentStep.textColor} mb-2`}>
                {currentStep.label}
              </h2>
              <p className="text-gray-600 mb-3">{currentStep.description}</p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{getEstimatedTime(order.status)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Order Progress</h3>
            <div className="space-y-4">
              {orderSteps.map((step, index) => {
                const status = getStepStatus(index, currentStepIndex);
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2
                        ${status === 'completed' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : status === 'active'
                          ? `${step.color} border-current text-white`
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                        }
                      `}>
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      
                      {/* Connector line */}
                      {index < orderSteps.length - 1 && (
                        <div className={`
                          w-0.5 h-8 mt-2
                          ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}
                        `} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${
                          status === 'active' ? step.textColor : 
                          status === 'completed' ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </h4>
                        {status === 'active' && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      
                      {/* Show timestamp for completed steps */}
                      {status === 'completed' && order.tracking.find(t => t.status === step.id) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.tracking.find(t => t.status === step.id)!.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Details */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Restaurant Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">{order.restaurant.name}</p>
                  <p className="text-sm text-gray-600">{order.restaurant.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <p className="text-sm">{order.restaurant.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <img
                    src={item.foodItem.imageUrl}
                    alt={item.foodItem.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.foodItem.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{item.price}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Delivery Address</h3>
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm">{order.deliveryAddress}</p>
                <p className="text-sm text-gray-600 mt-1">Phone: {order.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Having issues with your order? Contact us for support.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}