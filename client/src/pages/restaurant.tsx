import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import FoodItemCard from "@/components/food-item-card";
import CartSidebar from "@/components/cart-sidebar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, DollarSign, Phone, MapPin } from "lucide-react";
import type { RestaurantWithItems, FoodItem } from "@shared/schema";

export default function Restaurant() {
  const { id } = useParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: [`/api/restaurants/${id}`],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: { foodItemId: number; quantity: number }) => {
      await apiRequest('POST', '/api/cart', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (foodItem: FoodItem) => {
    addToCartMutation.mutate({
      foodItemId: foodItem.id,
      quantity: 1,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-64 w-full rounded-lg mb-6"></div>
            <div className="bg-gray-200 h-8 w-1/2 mb-4"></div>
            <div className="bg-gray-200 h-4 w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h1>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      
      {/* Restaurant Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <img
              src={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300"}
              alt={restaurant.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-lg opacity-90">{restaurant.description}</p>
            </div>
          </div>
          
          <div className="py-6">
            <div className="flex flex-wrap items-center gap-6">
              <Badge variant="secondary" className="bg-accent text-white">
                <Star className="w-4 h-4 mr-1 fill-current" />
                {restaurant.rating}
              </Badge>
              
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>${restaurant.minimumOrder} minimum</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <span className="text-sm">Delivery: ${restaurant.deliveryFee}</span>
              </div>
              
              {restaurant.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
              
              {restaurant.address && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{restaurant.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Menu</h2>
          
          {restaurant.foodItems && restaurant.foodItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurant.foodItems.map((foodItem: FoodItem) => (
                <FoodItemCard
                  key={foodItem.id}
                  foodItem={foodItem}
                  onAddToCart={handleAddToCart}
                  isLoading={addToCartMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No menu items available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
