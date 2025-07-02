import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

interface OrderTrackingProps {
  orderId: number;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: isOpen,
  });

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="w-6 h-6 text-white" />;
    }
    
    switch (status) {
      case 'preparing':
        return <Clock className="w-6 h-6 text-white" />;
      case 'out_for_delivery':
        return <Truck className="w-6 h-6 text-white" />;
      default:
        return <CheckCircle className="w-6 h-6 text-white" />;
    }
  };

  const getStatusColor = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return 'bg-accent';
    if (isCurrent) return 'bg-primary';
    return 'bg-gray-300';
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'We have received your order';
      case 'confirmed':
        return 'Your order has been confirmed';
      case 'preparing':
        return 'Restaurant is preparing your order';
      case 'out_for_delivery':
        return 'Your order is on the way';
      case 'delivered':
        return 'Order delivered successfully';
      default:
        return 'Order status update';
    }
  };

  const orderStatuses = [
    { key: 'confirmed', label: 'Order Confirmed', time: '2 mins ago' },
    { key: 'preparing', label: 'Food Preparing', time: '5 mins ago' },
    { key: 'out_for_delivery', label: 'Out for Delivery', time: 'In Progress' },
    { key: 'delivered', label: 'Delivered', time: '' },
  ];

  const getCurrentStatusIndex = (status: string) => {
    return orderStatuses.findIndex(s => s.key === status);
  };

  if (isLoading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Track Order
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="bg-gray-200 w-8 h-8 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Track Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Tracking</DialogTitle>
        </DialogHeader>
        
        {order && (
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              <p>Order ID: <span className="font-mono">#{order.id}</span></p>
              <p>Restaurant: <span className="font-medium">{order.restaurant.name}</span></p>
              {order.estimatedDeliveryTime && (
                <p>Estimated delivery: <span className="font-medium">
                  {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span></p>
              )}
            </div>
            
            <div className="space-y-4">
              {orderStatuses.map((statusInfo, index) => {
                const currentIndex = getCurrentStatusIndex(order.status);
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isUpcoming = index > currentIndex;
                
                return (
                  <div key={statusInfo.key} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(isCompleted, isCurrent)}`}>
                      {getStatusIcon(statusInfo.key, isCompleted)}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${isUpcoming ? 'text-gray-400' : 'text-gray-900'}`}>
                        {statusInfo.label}
                      </p>
                      <p className={`text-sm ${isUpcoming ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getStatusDescription(statusInfo.key)}
                      </p>
                    </div>
                    
                    {statusInfo.time && !isUpcoming && (
                      <span className={`text-sm ${isCurrent ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        {isCurrent && statusInfo.key === 'out_for_delivery' ? 'In Progress' : statusInfo.time}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {order.status === 'out_for_delivery' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Delivery Partner</p>
                    <p className="text-sm text-gray-600">Your order is on the way</p>
                  </div>
                  {order.restaurant.phone && (
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Delivery Address</p>
                  <p className="text-sm text-blue-700">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
