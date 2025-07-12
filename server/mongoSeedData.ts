import { storage } from './mongoStorage.js';
import { User, Restaurant, Category, FoodItem, CartItem, Order, OrderItem, OrderTracking } from '../shared/mongoSchemas.js';

export async function seedDatabase() {
  console.log('Starting database seeding...');
  
  // Clear existing data
  try {
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Category.deleteMany({});
    await FoodItem.deleteMany({});
    await CartItem.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await OrderTracking.deleteMany({});
    console.log('Cleared all existing data');

    // Create categories
    const categories = [
      { name: 'Italian', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80', description: 'Authentic Italian cuisine' },
      { name: 'Indian', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', description: 'Traditional Indian dishes' },
      { name: 'Chinese', imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80', description: 'Authentic Chinese cuisine' },
      { name: 'Mexican', imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80', description: 'Spicy Mexican delights' },
      { name: 'American', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80', description: 'Classic American food' },
      { name: 'Fast Food', imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80', description: 'Quick and tasty meals' },
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await storage.createCategory(category);
      createdCategories.push(created);
      console.log(`Created category: ${created.name}`);
    }

    // Create restaurants - 10 total restaurants
    const restaurants = [
      {
        name: 'Mama Mia Italian Kitchen',
        description: 'Authentic Italian dishes made with love and traditional recipes',
        cuisineType: 'Italian',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        deliveryTime: '30-45 mins',
        minimumOrder: 15.00,
        deliveryFee: 2.99,
        isOpen: true,
        address: '123 Italian Street, Food City, FC 12345',
        phone: '+1 (555) 123-4567',
      },
      {
        name: 'Spice Palace',
        description: 'Traditional Indian cuisine with aromatic spices and flavors',
        cuisineType: 'Indian',
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        deliveryTime: '25-40 mins',
        minimumOrder: 20.00,
        deliveryFee: 3.49,
        isOpen: true,
        address: '456 Spice Avenue, Food City, FC 12346',
        phone: '+1 (555) 234-5678',
      },
      {
        name: 'Golden Dragon',
        description: 'Authentic Chinese cuisine with fresh ingredients and traditional cooking',
        cuisineType: 'Chinese',
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
        rating: 4.3,
        deliveryTime: '20-35 mins',
        minimumOrder: 18.00,
        deliveryFee: 2.49,
        isOpen: true,
        address: '789 Dragon Lane, Food City, FC 12347',
        phone: '+1 (555) 345-6789',
      },
      {
        name: 'El Sombrero',
        description: 'Vibrant Mexican flavors with fresh ingredients and bold spices',
        cuisineType: 'Mexican',
        imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80',
        rating: 4.4,
        deliveryTime: '25-40 mins',
        minimumOrder: 16.00,
        deliveryFee: 3.99,
        isOpen: true,
        address: '321 Fiesta Boulevard, Food City, FC 12348',
        phone: '+1 (555) 456-7890',
      },
      {
        name: 'Burger Junction',
        description: 'Gourmet burgers and American classics made with premium ingredients',
        cuisineType: 'American',
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80',
        rating: 4.2,
        deliveryTime: '15-30 mins',
        minimumOrder: 12.00,
        deliveryFee: 1.99,
        isOpen: true,
        address: '654 Burger Street, Food City, FC 12349',
        phone: '+1 (555) 567-8901',
      },
      {
        name: 'Quick Bites',
        description: 'Fast and delicious meals for people on the go',
        cuisineType: 'Fast Food',
        imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
        rating: 4.0,
        deliveryTime: '10-20 mins',
        minimumOrder: 8.00,
        deliveryFee: 1.49,
        isOpen: true,
        address: '987 Fast Lane, Food City, FC 12350',
        phone: '+1 (555) 678-9012',
      },
      {
        name: 'Tokyo Sushi House',
        description: 'Fresh sushi and Japanese specialties made by expert chefs',
        cuisineType: 'Japanese',
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        deliveryTime: '20-35 mins',
        minimumOrder: 25.00,
        deliveryFee: 3.99,
        isOpen: true,
        address: '111 Sakura Street, Food City, FC 12351',
        phone: '+1 (555) 789-0123',
      },
      {
        name: 'Mediterranean Delight',
        description: 'Healthy Mediterranean cuisine with fresh ingredients and olive oil',
        cuisineType: 'Mediterranean',
        imageUrl: 'https://images.unsplash.com/photo-1544510747-4ca819892da4?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        deliveryTime: '25-40 mins',
        minimumOrder: 18.00,
        deliveryFee: 2.99,
        isOpen: true,
        address: '222 Olive Avenue, Food City, FC 12352',
        phone: '+1 (555) 890-1234',
      },
      {
        name: 'Thai Garden',
        description: 'Authentic Thai flavors with fresh herbs and traditional spices',
        cuisineType: 'Thai',
        imageUrl: 'https://images.unsplash.com/photo-1559847844-d7af0bae0ad5?auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        deliveryTime: '20-35 mins',
        minimumOrder: 16.00,
        deliveryFee: 2.49,
        isOpen: true,
        address: '333 Thai Plaza, Food City, FC 12353',
        phone: '+1 (555) 901-2345',
      },
      {
        name: 'French Bistro',
        description: 'Classic French cuisine with elegant presentation and rich flavors',
        cuisineType: 'French',
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        deliveryTime: '35-50 mins',
        minimumOrder: 30.00,
        deliveryFee: 4.99,
        isOpen: true,
        address: '444 Champagne Boulevard, Food City, FC 12354',
        phone: '+1 (555) 012-3456',
      },
    ];

    const createdRestaurants = [];
    for (const restaurant of restaurants) {
      const created = await storage.createRestaurant(restaurant);
      createdRestaurants.push(created);
      console.log(`Created restaurant: ${created.name}`);
    }

    // Create food items for each restaurant
    const foodItems = [
      // Mama Mia Italian Kitchen
      {
        restaurantId: createdRestaurants[0]._id.toString(),
        categoryId: createdCategories[0]._id.toString(),
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh tomatoes, mozzarella, and basil',
        price: 16.99,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 20,
        calories: 280,
      },
      {
        restaurantId: createdRestaurants[0]._id.toString(),
        categoryId: createdCategories[0]._id.toString(),
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with eggs, cheese, pancetta, and black pepper',
        price: 18.99,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 25,
        calories: 450,
      },
      {
        restaurantId: createdRestaurants[0]._id.toString(),
        categoryId: createdCategories[0]._id.toString(),
        name: 'Chicken Parmigiana',
        description: 'Breaded chicken breast with marinara sauce and melted cheese',
        price: 22.99,
        imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 30,
        calories: 520,
      },
      {
        restaurantId: createdRestaurants[0]._id.toString(),
        categoryId: createdCategories[0]._id.toString(),
        name: 'Lasagna',
        description: 'Layers of pasta, meat sauce, and cheese baked to perfection',
        price: 20.99,
        imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 35,
        calories: 480,
      },
      {
        restaurantId: createdRestaurants[0]._id.toString(),
        categoryId: createdCategories[0]._id.toString(),
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 10,
        calories: 320,
      },

      // Spice Palace
      {
        restaurantId: createdRestaurants[1]._id.toString(),
        categoryId: createdCategories[1]._id.toString(),
        name: 'Butter Chicken',
        description: 'Tender chicken in a rich, creamy tomato-based sauce',
        price: 19.99,
        imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 25,
        calories: 420,
        spiceLevel: 'Medium',
      },
      {
        restaurantId: createdRestaurants[1]._id.toString(),
        categoryId: createdCategories[1]._id.toString(),
        name: 'Vegetable Biryani',
        description: 'Aromatic basmati rice with mixed vegetables and traditional spices',
        price: 16.99,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 30,
        calories: 380,
        spiceLevel: 'Mild',
      },
      {
        restaurantId: createdRestaurants[1]._id.toString(),
        categoryId: createdCategories[1]._id.toString(),
        name: 'Tandoori Chicken',
        description: 'Marinated chicken cooked in a traditional tandoor oven',
        price: 21.99,
        imageUrl: 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 35,
        calories: 350,
        spiceLevel: 'Hot',
      },
      {
        restaurantId: createdRestaurants[1]._id.toString(),
        categoryId: createdCategories[1]._id.toString(),
        name: 'Palak Paneer',
        description: 'Cottage cheese cubes in a spiced spinach curry',
        price: 17.99,
        imageUrl: 'https://images.unsplash.com/photo-1631452180539-96aca7d48617?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 20,
        calories: 300,
        spiceLevel: 'Medium',
      },
      {
        restaurantId: createdRestaurants[1]._id.toString(),
        categoryId: createdCategories[1]._id.toString(),
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in rose-flavored sugar syrup',
        price: 7.99,
        imageUrl: 'https://images.unsplash.com/photo-1606471191009-63a5b5240c56?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 10,
        calories: 280,
      },

      // Golden Dragon
      {
        restaurantId: createdRestaurants[2]._id.toString(),
        categoryId: createdCategories[2]._id.toString(),
        name: 'Sweet and Sour Pork',
        description: 'Crispy pork pieces with bell peppers in sweet and sour sauce',
        price: 18.99,
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 20,
        calories: 410,
      },
      {
        restaurantId: createdRestaurants[2]._id.toString(),
        categoryId: createdCategories[2]._id.toString(),
        name: 'Kung Pao Chicken',
        description: 'Spicy chicken with peanuts, vegetables, and chili peppers',
        price: 17.99,
        imageUrl: 'https://images.unsplash.com/photo-1559847844-d7ad0ff7e9a4?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 18,
        calories: 380,
        spiceLevel: 'Hot',
      },
      {
        restaurantId: createdRestaurants[2]._id.toString(),
        categoryId: createdCategories[2]._id.toString(),
        name: 'Vegetable Fried Rice',
        description: 'Wok-fried rice with mixed vegetables and soy sauce',
        price: 14.99,
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 15,
        calories: 320,
      },
      {
        restaurantId: createdRestaurants[2]._id.toString(),
        categoryId: createdCategories[2]._id.toString(),
        name: 'Beef and Broccoli',
        description: 'Tender beef strips with fresh broccoli in savory sauce',
        price: 19.99,
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38174c5b1d60?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 22,
        calories: 350,
      },
      {
        restaurantId: createdRestaurants[2]._id.toString(),
        categoryId: createdCategories[2]._id.toString(),
        name: 'Mango Pudding',
        description: 'Silky smooth mango-flavored dessert',
        price: 6.99,
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 5,
        calories: 180,
      },

      // El Sombrero
      {
        restaurantId: createdRestaurants[3]._id.toString(),
        categoryId: createdCategories[3]._id.toString(),
        name: 'Chicken Tacos',
        description: 'Soft corn tortillas with seasoned chicken, salsa, and lime',
        price: 12.99,
        imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 15,
        calories: 280,
        spiceLevel: 'Medium',
      },
      {
        restaurantId: createdRestaurants[3]._id.toString(),
        categoryId: createdCategories[3]._id.toString(),
        name: 'Beef Burrito',
        description: 'Large flour tortilla filled with seasoned beef, rice, and beans',
        price: 15.99,
        imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 18,
        calories: 520,
        spiceLevel: 'Medium',
      },
      {
        restaurantId: createdRestaurants[3]._id.toString(),
        categoryId: createdCategories[3]._id.toString(),
        name: 'Vegetarian Quesadilla',
        description: 'Grilled tortilla with cheese, peppers, and onions',
        price: 11.99,
        imageUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 12,
        calories: 380,
      },
      {
        restaurantId: createdRestaurants[3]._id.toString(),
        categoryId: createdCategories[3]._id.toString(),
        name: 'Nachos Supreme',
        description: 'Crispy tortilla chips with cheese, jalapeños, and sour cream',
        price: 13.99,
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 10,
        calories: 450,
        spiceLevel: 'Hot',
      },
      {
        restaurantId: createdRestaurants[3]._id.toString(),
        categoryId: createdCategories[3]._id.toString(),
        name: 'Churros',
        description: 'Crispy fried dough sticks with cinnamon sugar and chocolate sauce',
        price: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1541781408260-3c61143b63d5?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 8,
        calories: 250,
      },

      // Burger Junction
      {
        restaurantId: createdRestaurants[4]._id.toString(),
        categoryId: createdCategories[4]._id.toString(),
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
        price: 14.99,
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 15,
        calories: 520,
      },
      {
        restaurantId: createdRestaurants[4]._id.toString(),
        categoryId: createdCategories[4]._id.toString(),
        name: 'BBQ Bacon Burger',
        description: 'Beef patty with bacon, BBQ sauce, onion rings, and cheese',
        price: 17.99,
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 18,
        calories: 680,
      },
      {
        restaurantId: createdRestaurants[4]._id.toString(),
        categoryId: createdCategories[4]._id.toString(),
        name: 'Veggie Burger',
        description: 'Plant-based patty with fresh vegetables and avocado',
        price: 13.99,
        imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 12,
        calories: 420,
      },
      {
        restaurantId: createdRestaurants[4]._id.toString(),
        categoryId: createdCategories[4]._id.toString(),
        name: 'Loaded Fries',
        description: 'Crispy fries topped with cheese, bacon, and green onions',
        price: 9.99,
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 10,
        calories: 580,
      },
      {
        restaurantId: createdRestaurants[4]._id.toString(),
        categoryId: createdCategories[4]._id.toString(),
        name: 'Chocolate Milkshake',
        description: 'Creamy chocolate milkshake topped with whipped cream',
        price: 6.99,
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 5,
        calories: 420,
      },

      // Quick Bites
      {
        restaurantId: createdRestaurants[5]._id.toString(),
        categoryId: createdCategories[5]._id.toString(),
        name: 'Chicken Nuggets',
        description: 'Crispy breaded chicken pieces with dipping sauce',
        price: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 8,
        calories: 320,
      },
      {
        restaurantId: createdRestaurants[5]._id.toString(),
        categoryId: createdCategories[5]._id.toString(),
        name: 'Fish and Chips',
        description: 'Battered fish fillet with crispy fries and tartar sauce',
        price: 12.99,
        imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 12,
        calories: 580,
      },
      {
        restaurantId: createdRestaurants[5]._id.toString(),
        categoryId: createdCategories[5]._id.toString(),
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
        price: 9.99,
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 8,
        calories: 280,
      },
      {
        restaurantId: createdRestaurants[5]._id.toString(),
        categoryId: createdCategories[5]._id.toString(),
        name: 'Hot Dog',
        description: 'Grilled frankfurter with mustard, ketchup, and onions',
        price: 6.99,
        imageUrl: 'https://images.unsplash.com/photo-1612392062798-2307f4c3e7d1?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        preparationTime: 5,
        calories: 380,
      },
      {
        restaurantId: createdRestaurants[5]._id.toString(),
        categoryId: createdCategories[5]._id.toString(),
        name: 'Apple Pie',
        description: 'Classic apple pie with cinnamon and a flaky crust',
        price: 5.99,
        imageUrl: 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e9b5?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        preparationTime: 5,
        calories: 320,
      },
    ];

    let createdItemsCount = 0;
    for (const item of foodItems) {
      await storage.createFoodItem(item);
      createdItemsCount++;
    }

    console.log(`Created ${createdItemsCount} menu items across all restaurants`);
    console.log('Database seeding completed successfully!');
    
    return {
      categories: createdCategories.length,
      restaurants: createdRestaurants.length,
      foodItems: createdItemsCount,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

console.log(`Created 6 categories, 6 restaurants, and 30 menu items`);
console.log('Seeding complete!');