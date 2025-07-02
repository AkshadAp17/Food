import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Clock, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";
import type { Restaurant, Category } from "@shared/schema";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['/api/restaurants'],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Initialize sample data on component mount
  useEffect(() => {
    fetch('/api/init-data', { method: 'POST' })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">FoodieExpress</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => window.location.href = '/api/login'}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Delicious Food
              <span className="block">Delivered Fast</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
              Order from your favorite restaurants and get fresh food delivered to your doorstep in minutes
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Enter your delivery address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-32 py-6 text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Find Food
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Browse by Category</h2>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-full w-20 h-20 mx-auto mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded mx-auto w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories?.map((category: Category) => (
                <div key={category.id} className="food-category group cursor-pointer text-center">
                  <div className="bg-gray-100 rounded-full p-6 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <img
                      src={category.imageUrl || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={category.name}
                      className="w-16 h-16 mx-auto rounded-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <p className="text-sm font-medium mt-3 group-hover:text-primary">{category.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Popular Restaurants</h2>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/api/login'}
            >
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 w-full"></div>
                  <CardContent className="p-6">
                    <div className="bg-gray-200 h-6 w-3/4 mb-2"></div>
                    <div className="bg-gray-200 h-4 w-1/2 mb-3"></div>
                    <div className="flex justify-between">
                      <div className="bg-gray-200 h-4 w-20"></div>
                      <div className="bg-gray-200 h-4 w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants?.slice(0, 6).map((restaurant: Restaurant) => (
                <Card key={restaurant.id} className="restaurant-card hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer">
                  <img
                    src={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                  />
                  
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{restaurant.name}</h3>
                      <Badge variant="secondary" className="bg-accent text-white">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {restaurant.rating}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <span>{restaurant.cuisine}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>${restaurant.minimumOrder} minimum</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Free delivery</span>
                        <Button 
                          size="sm"
                          onClick={() => window.location.href = '/api/login'}
                        >
                          View Menu
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trust FoodieExpress for their food delivery needs.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
