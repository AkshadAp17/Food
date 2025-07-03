import { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, DollarSign, MapPin, ShoppingCart, Package, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';

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
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const cartItems = await response.json();
          const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };

    fetchCartCount();
  }, [user]);

  console.log('HomePage component rendered');

  // Fetch data directly with useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurants
        const restaurantsResponse = await fetch('/api/restaurants');
        if (restaurantsResponse.ok) {
          const restaurantsData = await restaurantsResponse.json();
          console.log('Fetched restaurants:', restaurantsData);
          setRestaurants(restaurantsData);
        } else {
          console.error('Failed to fetch restaurants:', restaurantsResponse.status);
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log('Fetched categories:', categoriesData);
          setCategories(categoriesData);
        } else {
          console.error('Failed to fetch categories:', categoriesResponse.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load restaurant data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisineType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === '' || restaurant.cuisineType === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const uniqueCuisines = Array.from(new Set(restaurants.map(r => r.cuisineType)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">FoodieExpress</h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Orders
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 relative"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.firstName}!
                  </span>
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCuisine}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCuisine(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Cuisines</option>
                {uniqueCuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter & Sort
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div
                onClick={() => setSelectedCuisine('')}
                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCuisine === '' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <div className="text-2xl mb-1">🍽️</div>
                  <span className="text-xs font-medium text-center">All</span>
                </div>
              </div>
              {uniqueCuisines.map(cuisine => (
                <div
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCuisine === cuisine 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <div className="text-2xl mb-1">
                      {cuisine === 'Italian' && '🍝'}
                      {cuisine === 'Indian' && '🍛'}
                      {cuisine === 'Chinese' && '🥢'}
                      {cuisine === 'Mexican' && '🌮'}
                      {cuisine === 'American' && '🍔'}
                      {cuisine === 'Fast Food' && '🍟'}
                    </div>
                    <span className="text-xs font-medium text-center">{cuisine}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restaurants */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              All Restaurants ({filteredRestaurants.length} found)
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading restaurants...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Total restaurants in database: {restaurants.length}</p>
                <p>Categories available: {categories.length}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <div 
                  key={restaurant.id} 
                  className="cursor-pointer"
                  onClick={() => {
                    console.log('Clicking restaurant:', restaurant.id, restaurant.name);
                    navigate(`/restaurant/${restaurant.id}`);
                  }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {!restaurant.isOpen && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                        <span className="text-white font-semibold">Closed</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{restaurant.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${restaurant.deliveryFee}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{restaurant.cuisineType}</Badge>
                      <span className="text-sm text-gray-500">Min: ${restaurant.minimumOrder}</span>
                    </div>
                  </CardContent>
                </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}