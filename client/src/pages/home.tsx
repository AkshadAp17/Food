import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import RestaurantCard from "@/components/restaurant-card";
import Footer from "@/components/footer";
import CartSidebar from "@/components/cart-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Restaurant, Category } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['/api/restaurants'],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const filteredRestaurants = restaurants?.filter((restaurant: Restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              What are you craving today?
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Discover amazing food from restaurants near you
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          
          {categoriesLoading ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 animate-pulse">
                  <div className="bg-gray-200 rounded-full w-16 h-16 mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-6 overflow-x-auto pb-4">
              {categories?.map((category: Category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex-shrink-0 text-center p-4 rounded-lg transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <img
                    src={category.imageUrl || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                    alt={category.name}
                    className="w-12 h-12 mx-auto rounded-full object-cover mb-2"
                  />
                  <p className="text-sm font-medium">{category.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Restaurant Listings */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? `${selectedCategory} Restaurants` : 'All Restaurants'}
            </h2>
            <div className="flex items-center space-x-4">
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="delivery-time">Delivery Time</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
              {selectedCategory && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory("")}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
          
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-6">
                  <div className="bg-gray-200 h-48 w-full rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-6 w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 w-1/2 mb-3"></div>
                  <div className="flex justify-between">
                    <div className="bg-gray-200 h-4 w-20"></div>
                    <div className="bg-gray-200 h-4 w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants?.map((restaurant: Restaurant) => (
                <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                  <RestaurantCard restaurant={restaurant} />
                </Link>
              ))}
            </div>
          )}
          
          {filteredRestaurants?.length === 0 && !restaurantsLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No restaurants found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
