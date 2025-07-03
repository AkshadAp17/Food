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

    console.log('Database seeding completed successfully!');
    console.log(`Created ${createdCategories.length} categories and ${createdRestaurants.length} restaurants`);
    
    return { categories: createdCategories, restaurants: createdRestaurants };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}