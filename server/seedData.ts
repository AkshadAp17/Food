import { storage } from './storage';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create categories first
    const categories = [
      { name: 'Italian', description: 'Authentic Italian cuisine with pasta, pizza, and more', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400' },
      { name: 'Indian', description: 'Traditional Indian dishes with rich spices and flavors', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Chinese', description: 'Delicious Chinese cuisine with stir-fries and noodles', imageUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400' },
      { name: 'Mexican', description: 'Authentic Mexican flavors with tacos, burritos, and more', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400' },
      { name: 'American', description: 'Classic American comfort food and burgers', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
      { name: 'Fast Food', description: 'Quick and tasty fast food options', imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400' }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await storage.createCategory(category);
      createdCategories.push(created);
      console.log(`Created category: ${created.name}`);
    }

    // Create restaurants
    const restaurants = [
      {
        name: 'Mama Mia Italian Kitchen',
        description: 'Authentic Italian cuisine with fresh pasta and wood-fired pizzas',
        cuisineType: 'Italian',
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600',
        rating: '4.5',
        deliveryTime: '25-35 min',
        minimumOrder: '15.00',
        deliveryFee: '2.99',
        isOpen: true,
        address: '123 Little Italy St, Downtown',
        phone: '+1-555-PIZZA',
        latitude: '40.7128',
        longitude: '-74.0060'
      },
      {
        name: 'Spice Palace',
        description: 'Traditional Indian restaurant with aromatic curries and tandoor specialties',
        cuisineType: 'Indian',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
        rating: '4.3',
        deliveryTime: '30-40 min',
        minimumOrder: '12.00',
        deliveryFee: '3.99',
        isOpen: true,
        address: '456 Curry Lane, Midtown',
        phone: '+1-555-SPICE',
        latitude: '40.7589',
        longitude: '-73.9851'
      },
      {
        name: 'Golden Dragon',
        description: 'Authentic Chinese cuisine with fresh ingredients and traditional recipes',
        cuisineType: 'Chinese',
        imageUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600',
        rating: '4.4',
        deliveryTime: '20-30 min',
        minimumOrder: '10.00',
        deliveryFee: '2.49',
        isOpen: true,
        address: '789 Dragon Ave, Chinatown',
        phone: '+1-555-DRAGON',
        latitude: '40.7156',
        longitude: '-73.9970'
      },
      {
        name: 'El Sombrero',
        description: 'Vibrant Mexican restaurant with fresh tacos, burritos, and margaritas',
        cuisineType: 'Mexican',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600',
        rating: '4.2',
        deliveryTime: '25-35 min',
        minimumOrder: '8.00',
        deliveryFee: '1.99',
        isOpen: true,
        address: '321 Fiesta Blvd, South Side',
        phone: '+1-555-TACOS',
        latitude: '40.7282',
        longitude: '-73.7949'
      },
      {
        name: 'Burger Junction',
        description: 'Classic American burgers with hand-cut fries and milkshakes',
        cuisineType: 'American',
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600',
        rating: '4.0',
        deliveryTime: '15-25 min',
        minimumOrder: '6.00',
        deliveryFee: '1.49',
        isOpen: true,
        address: '654 Main Street, Uptown',
        phone: '+1-555-BURGER',
        latitude: '40.7831',
        longitude: '-73.9712'
      },
      {
        name: 'Quick Bites',
        description: 'Fast and delicious food for when you need a quick meal',
        cuisineType: 'Fast Food',
        imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600',
        rating: '3.8',
        deliveryTime: '10-20 min',
        minimumOrder: '5.00',
        deliveryFee: '0.99',
        isOpen: true,
        address: '987 Speed Way, City Center',
        phone: '+1-555-QUICK',
        latitude: '40.7505',
        longitude: '-73.9934'
      }
    ];

    const createdRestaurants = [];
    for (const restaurant of restaurants) {
      const created = await storage.createRestaurant(restaurant);
      createdRestaurants.push(created);
      console.log(`Created restaurant: ${created.name}`);
    }

    // Create comprehensive menu items for each restaurant
    const menuItems = [
      // Mama Mia Italian Kitchen
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh tomatoes, mozzarella, and basil',
        price: '18.99',
        imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[0].id,
        categoryId: createdCategories[0].id
      },
      {
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with pancetta, eggs, and parmesan cheese',
        price: '16.99',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[0].id,
        categoryId: createdCategories[0].id
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Classic pizza topped with spicy pepperoni and cheese',
        price: '19.99',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[0].id,
        categoryId: createdCategories[0].id
      },
      {
        name: 'Chicken Alfredo',
        description: 'Grilled chicken with fettuccine in creamy alfredo sauce',
        price: '21.99',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[0].id,
        categoryId: createdCategories[0].id
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers',
        price: '8.99',
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[0].id,
        categoryId: createdCategories[0].id
      },

      // Spice Palace (Indian)
      {
        name: 'Chicken Tikka Masala',
        description: 'Tender chicken in rich tomato-based curry sauce',
        price: '17.99',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[1].id,
        categoryId: createdCategories[1].id
      },
      {
        name: 'Butter Chicken',
        description: 'Creamy chicken curry with aromatic spices',
        price: '18.99',
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[1].id,
        categoryId: createdCategories[1].id
      },
      {
        name: 'Biryani',
        description: 'Fragrant basmati rice with spiced chicken and herbs',
        price: '19.99',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[1].id,
        categoryId: createdCategories[1].id
      },
      {
        name: 'Naan Bread',
        description: 'Fresh baked Indian bread, perfect for dipping',
        price: '4.99',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[1].id,
        categoryId: createdCategories[1].id
      },
      {
        name: 'Lamb Korma',
        description: 'Tender lamb in creamy coconut curry sauce',
        price: '22.99',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[1].id,
        categoryId: createdCategories[1].id
      },

      // Golden Dragon (Chinese)
      {
        name: 'Sweet & Sour Pork',
        description: 'Crispy pork with pineapple in tangy sauce',
        price: '16.99',
        imageUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[2].id,
        categoryId: createdCategories[2].id
      },
      {
        name: 'Kung Pao Chicken',
        description: 'Spicy chicken with peanuts and vegetables',
        price: '17.99',
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[2].id,
        categoryId: createdCategories[2].id
      },
      {
        name: 'Fried Rice',
        description: 'Wok-fried rice with egg, vegetables, and choice of meat',
        price: '12.99',
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[2].id,
        categoryId: createdCategories[2].id
      },
      {
        name: 'Spring Rolls',
        description: 'Crispy rolls filled with vegetables and served with dipping sauce',
        price: '8.99',
        imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[2].id,
        categoryId: createdCategories[2].id
      },
      {
        name: 'Beef Broccoli',
        description: 'Tender beef with fresh broccoli in savory sauce',
        price: '18.99',
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[2].id,
        categoryId: createdCategories[2].id
      },

      // El Sombrero (Mexican)
      {
        name: 'Chicken Tacos',
        description: 'Three soft tacos with grilled chicken, salsa, and cheese',
        price: '13.99',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[3].id,
        categoryId: createdCategories[3].id
      },
      {
        name: 'Beef Burrito',
        description: 'Large burrito with seasoned beef, rice, beans, and cheese',
        price: '15.99',
        imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[3].id,
        categoryId: createdCategories[3].id
      },
      {
        name: 'Guacamole & Chips',
        description: 'Fresh guacamole made daily with crispy tortilla chips',
        price: '9.99',
        imageUrl: 'https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[3].id,
        categoryId: createdCategories[3].id
      },
      {
        name: 'Quesadilla',
        description: 'Grilled tortilla with cheese, chicken, and peppers',
        price: '12.99',
        imageUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[3].id,
        categoryId: createdCategories[3].id
      },
      {
        name: 'Churros',
        description: 'Crispy fried dough sticks with cinnamon sugar',
        price: '7.99',
        imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[3].id,
        categoryId: createdCategories[3].id
      },

      // Burger Junction (American)
      {
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
        price: '12.99',
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[4].id,
        categoryId: createdCategories[4].id
      },
      {
        name: 'BBQ Bacon Burger',
        description: 'Double patty with bacon, BBQ sauce, and onion rings',
        price: '16.99',
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[4].id,
        categoryId: createdCategories[4].id
      },
      {
        name: 'Loaded Fries',
        description: 'Crispy fries topped with cheese, bacon, and sour cream',
        price: '9.99',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[4].id,
        categoryId: createdCategories[4].id
      },
      {
        name: 'Chicken Wings',
        description: 'Crispy wings with choice of buffalo or BBQ sauce',
        price: '14.99',
        imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[4].id,
        categoryId: createdCategories[4].id
      },
      {
        name: 'Milkshake',
        description: 'Thick and creamy shake in vanilla, chocolate, or strawberry',
        price: '5.99',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[4].id,
        categoryId: createdCategories[4].id
      },

      // Quick Bites (Fast Food)
      {
        name: 'Chicken Nuggets',
        description: 'Crispy chicken nuggets with choice of dipping sauce',
        price: '8.99',
        imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[5].id,
        categoryId: createdCategories[5].id
      },
      {
        name: 'Fish & Chips',
        description: 'Beer-battered fish with golden fries',
        price: '13.99',
        imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[5].id,
        categoryId: createdCategories[5].id
      },
      {
        name: 'Hot Dog',
        description: 'All-beef hot dog with onions and mustard',
        price: '6.99',
        imageUrl: 'https://images.unsplash.com/photo-1612392166886-ee7c97b42e31?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[5].id,
        categoryId: createdCategories[5].id
      },
      {
        name: 'Onion Rings',
        description: 'Crispy beer-battered onion rings',
        price: '5.99',
        imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[5].id,
        categoryId: createdCategories[5].id
      },
      {
        name: 'Soft Drink',
        description: 'Choice of cola, lemon-lime, or orange soda',
        price: '2.99',
        imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400',
        isAvailable: true,
        restaurantId: createdRestaurants[5].id,
        categoryId: createdCategories[5].id
      }
    ];

    // Create all menu items
    let createdItems = 0;
    for (const item of menuItems) {
      await storage.createFoodItem(item);
      createdItems++;
    }
    console.log(`Created ${createdItems} menu items across all restaurants`);

    console.log('Database seeding completed successfully!');
    console.log(`Created ${createdCategories.length} categories, ${createdRestaurants.length} restaurants, and ${createdItems} menu items`);
    
    return { categories: createdCategories, restaurants: createdRestaurants, menuItems: createdItems };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}