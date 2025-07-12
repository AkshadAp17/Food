import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Store, Menu, Package } from 'lucide-react';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisineType: string;
  imageUrl: string;
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
  deliveryFee: number;
  isOpen: boolean;
  address: string;
  phone: string;
}

interface Category {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
}

interface MenuItem {
  _id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
  spiceLevel: string;
  calories: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurants');

  // Restaurant form state
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    cuisineType: '',
    imageUrl: '',
    deliveryTime: '',
    minimumOrder: '',
    deliveryFee: '',
    address: '',
    phone: '',
  });

  // Menu item form state
  const [menuItemForm, setMenuItemForm] = useState({
    restaurantId: '',
    categoryId: '',
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isVeg: true,
    preparationTime: '',
    spiceLevel: '',
    calories: '',
  });

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurants
      const restaurantsResponse = await fetch('/api/restaurants');
      const restaurantsData = await restaurantsResponse.json();
      setRestaurants(restaurantsData);

      // Fetch categories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      // Fetch menu items
      const menuItemsResponse = await fetch('/api/food-items');
      const menuItemsData = await menuItemsResponse.json();
      setMenuItems(menuItemsData);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...restaurantForm,
          email: user?.email,
          minimumOrder: parseFloat(restaurantForm.minimumOrder),
          deliveryFee: parseFloat(restaurantForm.deliveryFee),
        }),
      });

      if (response.ok) {
        alert('Restaurant created successfully');
        setRestaurantForm({
          name: '',
          description: '',
          cuisineType: '',
          imageUrl: '',
          deliveryTime: '',
          minimumOrder: '',
          deliveryFee: '',
          address: '',
          phone: '',
        });
        fetchData();
      } else {
        throw new Error('Failed to create restaurant');
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
      alert('Failed to create restaurant');
    }
  };

  const handleMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...menuItemForm,
          email: user?.email,
          price: parseFloat(menuItemForm.price),
          preparationTime: parseInt(menuItemForm.preparationTime),
          calories: parseInt(menuItemForm.calories),
        }),
      });

      if (response.ok) {
        alert('Menu item created successfully');
        setMenuItemForm({
          restaurantId: '',
          categoryId: '',
          name: '',
          description: '',
          price: '',
          imageUrl: '',
          isVeg: true,
          preparationTime: '',
          spiceLevel: '',
          calories: '',
        });
        fetchData();
      } else {
        throw new Error('Failed to create menu item');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item');
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have admin access to this dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-orange-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Welcome, {user?.firstName}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex space-x-4 border-b pb-4">
            <button 
              onClick={() => setActiveTab('restaurants')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'restaurants' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              <Store className="h-4 w-4 mr-2 inline" />
              Restaurants
            </button>
            <button 
              onClick={() => setActiveTab('menu-items')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'menu-items' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              <Menu className="h-4 w-4 mr-2 inline" />
              Menu Items
            </button>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              <Package className="h-4 w-4 mr-2 inline" />
              Overview
            </button>
          </div>

          {/* Restaurants Tab */}
          {activeTab === 'restaurants' && (
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Restaurant
                </CardTitle>
                <CardDescription>
                  Create a new restaurant to expand your delivery network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRestaurantSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                      <Input
                        value={restaurantForm.name}
                        onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                        placeholder="Enter restaurant name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cuisine Type</label>
                      <select
                        value={restaurantForm.cuisineType}
                        onChange={(e) => setRestaurantForm({...restaurantForm, cuisineType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select cuisine type</option>
                        <option value="Italian">Italian</option>
                        <option value="Indian">Indian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Mexican">Mexican</option>
                        <option value="American">American</option>
                        <option value="Fast Food">Fast Food</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={restaurantForm.description}
                      onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                      placeholder="Enter restaurant description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Time</label>
                      <Input
                        value={restaurantForm.deliveryTime}
                        onChange={(e) => setRestaurantForm({...restaurantForm, deliveryTime: e.target.value})}
                        placeholder="e.g., 30-45 mins"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Minimum Order ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={restaurantForm.minimumOrder}
                        onChange={(e) => setRestaurantForm({...restaurantForm, minimumOrder: e.target.value})}
                        placeholder="15.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Fee ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={restaurantForm.deliveryFee}
                        onChange={(e) => setRestaurantForm({...restaurantForm, deliveryFee: e.target.value})}
                        placeholder="2.99"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <Input
                        value={restaurantForm.address}
                        onChange={(e) => setRestaurantForm({...restaurantForm, address: e.target.value})}
                        placeholder="Enter full address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        value={restaurantForm.phone}
                        onChange={(e) => setRestaurantForm({...restaurantForm, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <Input
                      value={restaurantForm.imageUrl}
                      onChange={(e) => setRestaurantForm({...restaurantForm, imageUrl: e.target.value})}
                      placeholder="Enter image URL"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Restaurant
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Restaurants ({restaurants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurants.map((restaurant) => (
                    <Card key={restaurant._id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                          <div className={`px-2 py-1 rounded text-xs ${restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {restaurant.isOpen ? "Open" : "Closed"}
                          </div>
                        </div>
                        <CardDescription>{restaurant.cuisineType}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{restaurant.description}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>⭐ {restaurant.rating}</span>
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Menu Items Tab */}
          {activeTab === 'menu-items' && (
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Menu Item
                </CardTitle>
                <CardDescription>
                  Add a new menu item to an existing restaurant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMenuItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Restaurant</label>
                      <select
                        value={menuItemForm.restaurantId}
                        onChange={(e) => setMenuItemForm({...menuItemForm, restaurantId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select restaurant</option>
                        {restaurants.map((restaurant) => (
                          <option key={restaurant._id} value={restaurant._id}>
                            {restaurant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={menuItemForm.categoryId}
                        onChange={(e) => setMenuItemForm({...menuItemForm, categoryId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Item Name</label>
                      <Input
                        value={menuItemForm.name}
                        onChange={(e) => setMenuItemForm({...menuItemForm, name: e.target.value})}
                        placeholder="Enter item name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={menuItemForm.price}
                        onChange={(e) => setMenuItemForm({...menuItemForm, price: e.target.value})}
                        placeholder="15.99"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={menuItemForm.description}
                      onChange={(e) => setMenuItemForm({...menuItemForm, description: e.target.value})}
                      placeholder="Enter item description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Prep Time (min)</label>
                      <Input
                        type="number"
                        value={menuItemForm.preparationTime}
                        onChange={(e) => setMenuItemForm({...menuItemForm, preparationTime: e.target.value})}
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Spice Level</label>
                      <select
                        value={menuItemForm.spiceLevel}
                        onChange={(e) => setMenuItemForm({...menuItemForm, spiceLevel: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select spice level</option>
                        <option value="Mild">Mild</option>
                        <option value="Medium">Medium</option>
                        <option value="Hot">Hot</option>
                        <option value="Extra Hot">Extra Hot</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Calories</label>
                      <Input
                        type="number"
                        value={menuItemForm.calories}
                        onChange={(e) => setMenuItemForm({...menuItemForm, calories: e.target.value})}
                        placeholder="350"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <Input
                      value={menuItemForm.imageUrl}
                      onChange={(e) => setMenuItemForm({...menuItemForm, imageUrl: e.target.value})}
                      placeholder="Enter image URL"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isVeg"
                      checked={menuItemForm.isVeg}
                      onChange={(e) => setMenuItemForm({...menuItemForm, isVeg: e.target.checked})}
                    />
                    <label htmlFor="isVeg" className="text-sm font-medium">Vegetarian</label>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Menu Item
                  </Button>
                </form>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{restaurants.length}</div>
                  <p className="text-xs text-muted-foreground">Active restaurants</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
                  <Menu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{menuItems.length}</div>
                  <p className="text-xs text-muted-foreground">Available items</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <p className="text-xs text-muted-foreground">Food categories</p>
                </CardContent>
              </Card>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}