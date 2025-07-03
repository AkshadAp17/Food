import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Star, Clock, Truck, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toaster';
import { Link } from 'wouter';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisineType: string;
  imageUrl: string;
  rating: string;
  deliveryTime: string;
  minimumOrder: string;
  deliveryFee: string;
  isOpen: boolean;
  address: string;
}

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: restaurants = [], isLoading: restaurantsLoading, error: restaurantsError } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
    queryFn: async () => {
      const response = await fetch('/api/restaurants');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  const { data: categories = [], error: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  // Debug logging
  console.log('Restaurants query:', { restaurants, restaurantsLoading, restaurantsError });
  console.log('Categories query:', { categories, categoriesError });

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisineType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !selectedCuisine || restaurant.cuisineType.toLowerCase().includes(selectedCuisine.toLowerCase());
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-brand bg-clip-text text-transparent">
                FoodieExpress
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{user?.address || user?.city || 'Set delivery location'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hello, {user?.firstName}</span>
                <button
                  onClick={logout}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Hungry? Order Now!
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Delicious food from your favorite restaurants delivered in minutes
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for restaurants, cuisines, or dishes..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setSelectedCuisine('')}
              className={`p-4 rounded-xl text-center transition-all ${
                !selectedCuisine 
                  ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' 
                  : 'bg-white hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">🍽️</div>
              <span className="text-sm font-medium">All</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCuisine(category.name)}
                className={`p-4 rounded-xl text-center transition-all ${
                  selectedCuisine === category.name 
                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' 
                    : 'bg-white hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedCuisine ? `${selectedCuisine} Restaurants` : 'All Restaurants'}
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({filteredRestaurants.length} found)
            </span>
          </h3>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filter & Sort</span>
          </button>
        </div>

        {/* Restaurant Grid */}
        <section>
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                  <div className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-200 food-card cursor-pointer">
                    <div className="relative">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-48 object-cover rounded-t-2xl"
                      />
                      {!restaurant.isOpen && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-2xl flex items-center justify-center">
                          <span className="text-white font-semibold">Currently Closed</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{restaurant.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h4>
                      <p className="text-gray-600 mb-4 line-clamp-2">{restaurant.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {restaurant.cuisineType.split(',').map((cuisine, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {cuisine.trim()}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Truck className="h-4 w-4" />
                          <span>₹{restaurant.deliveryFee}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-500">
                        Min order: ₹{restaurant.minimumOrder}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Navigation */}
      <div className="fixed bottom-6 right-6 space-y-3">
        <Link href="/cart">
          <button className="bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors">
            <div className="relative">
              🛒
              {/* Cart badge would go here */}
            </div>
          </button>
        </Link>
        
        <Link href="/orders">
          <button className="bg-white text-gray-700 p-4 rounded-full shadow-lg hover:bg-gray-50 transition-colors border">
            📋
          </button>
        </Link>
      </div>
    </div>
  );
}