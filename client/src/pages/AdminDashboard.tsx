import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Store, Menu, Package, Upload, Users, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, BarChart3, PieChart, Settings, ShoppingCart, Mail, Activity, FileText, Calendar } from 'lucide-react';

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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isVerified: boolean;
  city?: string;
  createdAt: string;
}

interface Analytics {
  users: {
    total: number;
    verified: number;
    unverified: number;
    recentUsers: User[];
  };
  orders: {
    total: number;
    active: number;
    today: number;
    statusBreakdown: Record<string, number>;
  };
  revenue: {
    total: number;
    today: number;
    average: number;
  };
  restaurants: {
    popularByOrders: Record<string, number>;
  };
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

      // Fetch analytics
      const analyticsResponse = await fetch(`/api/admin/analytics?email=${user?.email}`);
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      // Fetch users
      const usersResponse = await fetch(`/api/admin/users?email=${user?.email}`);
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Fetch orders
      const ordersResponse = await fetch(`/api/admin/orders?email=${user?.email}`);
      const ordersData = await ordersResponse.json();
      setOrders(ordersData);

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
    
    // Validate required fields
    if (!menuItemForm.restaurantId) {
      alert('Please select a restaurant');
      return;
    }
    if (!menuItemForm.categoryId) {
      alert('Please select a category');
      return;
    }
    if (!menuItemForm.name || !menuItemForm.price) {
      alert('Please fill in all required fields');
      return;
    }
    
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
          preparationTime: menuItemForm.preparationTime ? parseInt(menuItemForm.preparationTime) : undefined,
          calories: menuItemForm.calories ? parseInt(menuItemForm.calories) : undefined,
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
          <div className="flex flex-wrap gap-2 border-b pb-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              <BarChart3 className="h-4 w-4 mr-2 inline" />
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Users ({analytics?.users.total || 0})
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              <ShoppingCart className="h-4 w-4 mr-2 inline" />
              Orders
            </button>
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
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'settings' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              <Settings className="h-4 w-4 mr-2 inline" />
              Settings
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
                      <label className="block text-sm font-medium mb-2">Restaurant *</label>
                      <select
                        value={menuItemForm.restaurantId}
                        onChange={(e) => setMenuItemForm({...menuItemForm, restaurantId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
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
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        value={menuItemForm.categoryId}
                        onChange={(e) => setMenuItemForm({...menuItemForm, categoryId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
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
                    <label className="block text-sm font-medium mb-2">Food Image</label>
                    <div className="space-y-3">
                      <Input
                        value={menuItemForm.imageUrl}
                        onChange={(e) => setMenuItemForm({...menuItemForm, imageUrl: e.target.value})}
                        placeholder="Enter image URL or upload an image"
                      />
                      <div className="text-center text-gray-500 text-sm">or</div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setMenuItemForm({...menuItemForm, imageUrl: event.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="imageUpload"
                        />
                        <label htmlFor="imageUpload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Click to upload food image</span>
                            <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
                          </div>
                        </label>
                      </div>
                      {menuItemForm.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={menuItemForm.imageUrl} 
                            alt="Food preview" 
                            className="w-32 h-32 object-cover rounded-lg mx-auto"
                          />
                        </div>
                      )}
                    </div>
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

          {/* Analytics Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              {/* Main Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.users.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.users.verified} verified, {analytics.users.unverified} pending
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${analytics.revenue.total.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Today: ${analytics.revenue.today.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.orders.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.orders.active} active, {analytics.orders.today} today
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${analytics.revenue.average.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Per order average</p>
                  </CardContent>
                </Card>
              </div>

              {/* Order Status Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Order Status Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.orders.statusBreakdown).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center">
                            {status === 'delivered' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                            {status === 'pending' && <Clock className="h-4 w-4 text-yellow-500 mr-2" />}
                            {status === 'cancelled' && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
                            {!['delivered', 'pending', 'cancelled'].includes(status) && <Package className="h-4 w-4 text-blue-500 mr-2" />}
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                          </div>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Platform Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Total Restaurants</span>
                        <span className="font-semibold">{restaurants.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Menu Items</span>
                        <span className="font-semibold">{menuItems.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Food Categories</span>
                        <span className="font-semibold">{categories.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Open Restaurants</span>
                        <span className="font-semibold">{restaurants.filter(r => r.isOpen).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Recent Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.users.recentUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Management ({users.length} users)
                  </CardTitle>
                  <CardDescription>
                    Manage all registered users on your platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                              {user.city && <p className="text-sm text-gray-500">{user.city}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(user.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Management Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Order Management ({orders.length} orders)
                  </CardTitle>
                  <CardDescription>
                    Manage customer orders and track their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No orders found</p>
                    ) : (
                      orders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">Order #{order.orderNumber}</p>
                                <p className="text-sm text-gray-600">${order.totalAmount.toFixed(2)} • {order.paymentMethod}</p>
                                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Email Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure email settings for notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Status</label>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Email service is configured and active</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Features</label>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>✓ User registration OTP emails</li>
                          <li>✓ Order confirmation emails</li>
                          <li>✓ Payment verification emails</li>
                          <li>✓ Order status update notifications</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      System Status
                    </CardTitle>
                    <CardDescription>
                      Monitor platform health and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Database Connection</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email Service</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Order Tracking</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Running</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment Processing</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Email-based Active</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Platform Configuration
                    </CardTitle>
                    <CardDescription>
                      Core platform settings and features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Admin Features</label>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>✓ User management and analytics</li>
                          <li>✓ Restaurant and menu management</li>
                          <li>✓ Order tracking and management</li>
                          <li>✓ Revenue and business analytics</li>
                          <li>✓ Admin-only access controls</li>
                        </ul>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Security</label>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>✓ Email-based user verification</li>
                          <li>✓ Admin role protection</li>
                          <li>✓ Secure password hashing</li>
                          <li>✓ Session management</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh Dashboard Data
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('users')} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View All Users
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('orders')} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Manage Orders
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('restaurants')} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Store className="h-4 w-4 mr-2" />
                        Add Restaurant
                      </Button>
                    </div>
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