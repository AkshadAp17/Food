import { Star, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@shared/schema";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const handleViewMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigation will be handled by the parent Link component
  };

  return (
    <Card className="restaurant-card hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group">
      <div className="relative">
        <img
          src={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"}
          alt={restaurant.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-900 backdrop-blur-sm">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {restaurant.rating}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {restaurant.description || restaurant.cuisine}
        </p>
        
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
            {restaurant.cuisine}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm mb-4">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>${restaurant.minimumOrder} minimum</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm">
            {parseFloat(restaurant.deliveryFee) === 0 ? (
              <span className="text-accent font-medium">Free delivery</span>
            ) : (
              <span className="text-gray-600">Delivery: ${restaurant.deliveryFee}</span>
            )}
          </div>
          <Button 
            size="sm"
            onClick={handleViewMenu}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            View Menu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
