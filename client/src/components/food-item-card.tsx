import { useState } from "react";
import { Plus, Leaf, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FoodItem } from "@shared/schema";

interface FoodItemCardProps {
  foodItem: FoodItem;
  onAddToCart: (foodItem: FoodItem) => void;
  isLoading?: boolean;
}

export default function FoodItemCard({ foodItem, onAddToCart, isLoading = false }: FoodItemCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(foodItem);
  };

  const defaultImage = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative">
        <img
          src={imageError ? defaultImage : (foodItem.imageUrl || defaultImage)}
          alt={foodItem.name}
          onError={() => setImageError(true)}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {foodItem.isVegetarian && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              <Leaf className="w-3 h-3 mr-1" />
              Veg
            </Badge>
          )}
          {foodItem.isVegan && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Vegan
            </Badge>
          )}
          {foodItem.isGlutenFree && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              Gluten Free
            </Badge>
          )}
        </div>
        {!foodItem.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Currently Unavailable</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {foodItem.name}
          </h3>
          <div className="text-right ml-2">
            <p className="text-xl font-bold text-primary">
              ${foodItem.price}
            </p>
          </div>
        </div>
        
        {foodItem.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {foodItem.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          {foodItem.preparationTime && (
            <span>{foodItem.preparationTime} mins</span>
          )}
          {foodItem.calories && (
            <span>{foodItem.calories} cal</span>
          )}
        </div>
        
        <Button 
          onClick={handleAddToCart}
          disabled={!foodItem.isAvailable || isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white"
          size="sm"
        >
          {isLoading ? (
            "Adding..."
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
