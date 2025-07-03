import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Star, Clock, DollarSign, MapPin, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

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
  phone?: string;
}

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
}

interface RestaurantWithItems extends Restaurant {
  foodItems: FoodItem[];
}

export function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [restaurant, setRestaurant] = useState<RestaurantWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/restaurants/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRestaurant(data);
        } else {
          toast({
            title: "Error",
            description: "Restaurant not found",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        toast({
          title: "Error",
          description: "Failed to load restaurant details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id, navigate, toast]);

  const addToCart = async (foodItemId: string) => {
    console.log('addToCart called - user:', user);
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive"
      });
      return;
    }
    
    if (!user.id) {
      console.error('User exists but has no ID:', user);
      toast({
        title: "Authentication error",
        description: "Please log out and log in again",
        variant: "destructive"
      });
      return;
    }

    try {
      const requestBody = {
        userId: user.id,
        foodItemId,
        quantity: 1
      };
      console.log('Sending cart request:', requestBody);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setCartItems(prev => ({
          ...prev,
          [foodItemId]: (prev[foodItemId] || 0) + 1
        }));
        toast({
          title: "Added to cart",
          description: "Item added to your cart successfully"
        });
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  const updateCartQuantity = async (foodItemId: string, change: number) => {
    if (!user) return;

    const newQuantity = (cartItems[foodItemId] || 0) + change;
    
    if (newQuantity <= 0) {
      try {
        await fetch(`/api/cart/${foodItemId}`, {
          method: 'DELETE'
        });
        setCartItems(prev => {
          const newCart = { ...prev };
          delete newCart[foodItemId];
          return newCart;
        });
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodItemId,
          quantity: newQuantity
        })
      });

      if (response.ok) {
        setCartItems(prev => ({
          ...prev,
          [foodItemId]: newQuantity
        }));
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h1>
          <Button onClick={() => navigate('/')}>Go back to home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to restaurants
            </Button>
            <h1 className="text-xl font-semibold">{restaurant.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="md:w-2/3">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{restaurant.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${restaurant.deliveryFee} delivery</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{restaurant.cuisineType}</Badge>
                <span className="text-sm text-gray-500">Min order: ${restaurant.minimumOrder}</span>
                <Badge variant={restaurant.isOpen ? "default" : "destructive"}>
                  {restaurant.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Menu</h2>
          {!restaurant.foodItems || restaurant.foodItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items available</h3>
              <p className="text-gray-600">This restaurant hasn't added their menu yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(restaurant.foodItems || []).map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                        <span className="text-white font-semibold">Unavailable</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-600">${item.price}</span>
                      {item.isAvailable && (
                        <div className="flex items-center gap-2">
                          {cartItems[item.id] > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-medium">{cartItems[item.id]}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(item.id)}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add to cart
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {Object.keys(cartItems).length > 0 && (
          <div className="fixed bottom-4 right-4">
            <Button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <ShoppingCart className="h-4 w-4" />
              View Cart ({Object.values(cartItems).reduce((sum, qty) => sum + qty, 0)})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}