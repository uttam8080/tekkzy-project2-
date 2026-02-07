// Load environment variables
require('dotenv').config();

const { sequelize } = require('./config/database');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const bcrypt = require('bcryptjs');

// Odisha Cities and their restaurants
const odishaData = {
    cities: [
        'Bhubaneswar',
        'Cuttack',
        'Puri',
        'Rourkela',
        'Berhampur',
        'Sambalpur',
        'Balasore',
        'Bhadrak',
        'Baripada',
        'Jharsuguda',
        'Jeypore',
        'Rayagada',
        'Angul',
        'Kendrapara',
        'Dhenkanal'
    ],

    restaurantTypes: [
        {
            name: 'Biryani House',
            cuisine: 'Indian, Biryani',
            description: 'Authentic Hyderabadi and Kolkata style biryani',
            rating: 4.5,
            deliveryTime: 35,
            deliveryFee: 30,
            minOrder: 200,
            image: 'images/biryani-restaurant.jpg'
        },
        {
            name: 'Dosa Corner',
            cuisine: 'South Indian',
            description: 'Crispy dosas and authentic South Indian cuisine',
            rating: 4.3,
            deliveryTime: 25,
            deliveryFee: 20,
            minOrder: 150,
            image: 'images/dosa-restaurant.jpg'
        },
        {
            name: 'Pizza Paradise',
            cuisine: 'Italian, Pizza',
            description: 'Wood-fired pizzas and Italian delicacies',
            rating: 4.4,
            deliveryTime: 30,
            deliveryFee: 35,
            minOrder: 250,
            image: 'images/pizza-restaurant.jpg'
        },
        {
            name: 'Burger Junction',
            cuisine: 'American, Burgers',
            description: 'Juicy burgers and crispy fries',
            rating: 4.2,
            deliveryTime: 20,
            deliveryFee: 25,
            minOrder: 180,
            image: 'images/burger-restaurant.jpg'
        },
        {
            name: 'Chinese Wok',
            cuisine: 'Chinese, Asian',
            description: 'Authentic Chinese and Indo-Chinese cuisine',
            rating: 4.3,
            deliveryTime: 30,
            deliveryFee: 30,
            minOrder: 200,
            image: 'images/chinese-restaurant.jpg'
        },
        {
            name: 'Tandoor Nights',
            cuisine: 'North Indian, Tandoor',
            description: 'Tandoori specialties and North Indian curries',
            rating: 4.6,
            deliveryTime: 35,
            deliveryFee: 30,
            minOrder: 220,
            image: 'images/tandoor-restaurant.jpg'
        },
        {
            name: 'Odia Rasoi',
            cuisine: 'Odia, Traditional',
            description: 'Authentic Odia cuisine and traditional dishes',
            rating: 4.7,
            deliveryTime: 30,
            deliveryFee: 25,
            minOrder: 180,
            image: 'images/odia-restaurant.jpg'
        },
        {
            name: 'Cafe Delight',
            cuisine: 'Cafe, Continental',
            description: 'Coffee, sandwiches, and continental dishes',
            rating: 4.4,
            deliveryTime: 20,
            deliveryFee: 20,
            minOrder: 150,
            image: 'images/cafe-restaurant.jpg'
        },
        {
            name: 'Seafood Shack',
            cuisine: 'Seafood, Coastal',
            description: 'Fresh seafood and coastal delicacies',
            rating: 4.5,
            deliveryTime: 40,
            deliveryFee: 40,
            minOrder: 300,
            image: 'images/seafood-restaurant.jpg'
        },
        {
            name: 'Sweet Treats',
            cuisine: 'Desserts, Sweets',
            description: 'Traditional sweets and modern desserts',
            rating: 4.6,
            deliveryTime: 25,
            deliveryFee: 20,
            minOrder: 150,
            image: 'images/sweets-restaurant.jpg'
        }
    ],

    menuItems: {
        'Biryani House': [
            { name: 'Chicken Biryani', price: 180, category: 'Main Course', isVegetarian: false },
            { name: 'Mutton Biryani', price: 220, category: 'Main Course', isVegetarian: false },
            { name: 'Veg Biryani', price: 150, category: 'Main Course', isVegetarian: true },
            { name: 'Raita', price: 40, category: 'Sides', isVegetarian: true }
        ],
        'Dosa Corner': [
            { name: 'Masala Dosa', price: 80, category: 'Main Course', isVegetarian: true },
            { name: 'Onion Dosa', price: 70, category: 'Main Course', isVegetarian: true },
            { name: 'Idli Sambar', price: 60, category: 'Breakfast', isVegetarian: true },
            { name: 'Filter Coffee', price: 30, category: 'Beverages', isVegetarian: true }
        ],
        'Pizza Paradise': [
            { name: 'Margherita Pizza', price: 250, category: 'Pizza', isVegetarian: true },
            { name: 'Chicken Tikka Pizza', price: 320, category: 'Pizza', isVegetarian: false },
            { name: 'Garlic Bread', price: 120, category: 'Starters', isVegetarian: true },
            { name: 'Pasta Alfredo', price: 200, category: 'Pasta', isVegetarian: true }
        ],
        'Burger Junction': [
            { name: 'Chicken Burger', price: 150, category: 'Burgers', isVegetarian: false },
            { name: 'Veg Burger', price: 120, category: 'Burgers', isVegetarian: true },
            { name: 'French Fries', price: 80, category: 'Sides', isVegetarian: true },
            { name: 'Coke', price: 40, category: 'Beverages', isVegetarian: true }
        ],
        'Chinese Wok': [
            { name: 'Veg Fried Rice', price: 140, category: 'Rice', isVegetarian: true },
            { name: 'Chicken Manchurian', price: 180, category: 'Main Course', isVegetarian: false },
            { name: 'Veg Noodles', price: 130, category: 'Noodles', isVegetarian: true },
            { name: 'Spring Rolls', price: 100, category: 'Starters', isVegetarian: true }
        ],
        'Tandoor Nights': [
            { name: 'Paneer Tikka', price: 200, category: 'Starters', isVegetarian: true },
            { name: 'Chicken Tikka', price: 220, category: 'Starters', isVegetarian: false },
            { name: 'Dal Makhani', price: 160, category: 'Main Course', isVegetarian: true },
            { name: 'Butter Naan', price: 40, category: 'Breads', isVegetarian: true }
        ],
        'Odia Rasoi': [
            { name: 'Dalma', price: 120, category: 'Main Course', isVegetarian: true },
            { name: 'Machha Besara', price: 180, category: 'Main Course', isVegetarian: false },
            { name: 'Pakhala Bhata', price: 100, category: 'Main Course', isVegetarian: true },
            { name: 'Chhena Poda', price: 80, category: 'Desserts', isVegetarian: true }
        ],
        'Cafe Delight': [
            { name: 'Cappuccino', price: 100, category: 'Beverages', isVegetarian: true },
            { name: 'Club Sandwich', price: 150, category: 'Sandwiches', isVegetarian: false },
            { name: 'Brownie', price: 80, category: 'Desserts', isVegetarian: true },
            { name: 'Caesar Salad', price: 140, category: 'Salads', isVegetarian: true }
        ],
        'Seafood Shack': [
            { name: 'Prawn Curry', price: 280, category: 'Main Course', isVegetarian: false },
            { name: 'Fish Fry', price: 200, category: 'Starters', isVegetarian: false },
            { name: 'Crab Masala', price: 350, category: 'Main Course', isVegetarian: false },
            { name: 'Steamed Rice', price: 60, category: 'Sides', isVegetarian: true }
        ],
        'Sweet Treats': [
            { name: 'Rasgulla', price: 60, category: 'Sweets', isVegetarian: true },
            { name: 'Gulab Jamun', price: 50, category: 'Sweets', isVegetarian: true },
            { name: 'Chocolate Cake', price: 120, category: 'Cakes', isVegetarian: true },
            { name: 'Ice Cream', price: 80, category: 'Desserts', isVegetarian: true }
        ]
    }
};

// Seed function
async function seedOdishaData() {
    try {
        console.log('🌱 Starting Odisha data seeding...\n');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected successfully\n');

        // Sync models
        await sequelize.sync();
        console.log('✅ Database models synchronized\n');

        // Create admin user
        console.log('👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        let adminUser = await User.findOne({ where: { email: 'admin@foodhub.com' } });

        if (!adminUser) {
            adminUser = await User.create({
                firstName: 'Admin',
                lastName: 'FoodHub',
                email: 'admin@foodhub.com',
                password: hashedPassword,
                phone: '9876543210',
                role: 'admin'
            });
            console.log('✅ Admin user created: admin@foodhub.com / admin123\n');
        } else {
            console.log('ℹ️  Admin user already exists\n');
        }

        // Create restaurant owners for each city
        console.log('👥 Creating restaurant owners...');
        const owners = [];

        for (let i = 0; i < odishaData.cities.length; i++) {
            const city = odishaData.cities[i];
            const email = `owner.${city.toLowerCase()}@foodhub.com`;

            let owner = await User.findOne({ where: { email } });

            if (!owner) {
                owner = await User.create({
                    firstName: 'Restaurant',
                    lastName: `Owner ${city}`,
                    email,
                    password: hashedPassword,
                    phone: `98765432${10 + i}`,
                    role: 'restaurant',
                    city
                });
            }

            owners.push(owner);
        }
        console.log(`✅ Created ${owners.length} restaurant owners\n`);

        // Create restaurants for each city
        console.log('🏪 Creating restaurants...');
        let restaurantCount = 0;
        let menuItemCount = 0;

        for (let cityIndex = 0; cityIndex < odishaData.cities.length; cityIndex++) {
            const city = odishaData.cities[cityIndex];
            const owner = owners[cityIndex];

            console.log(`\n📍 ${city}:`);

            // Create 3-5 restaurants per city (varies by city size)
            const restaurantsToCreate = cityIndex < 5 ? 5 : cityIndex < 10 ? 4 : 3;

            for (let i = 0; i < restaurantsToCreate; i++) {
                const restaurantType = odishaData.restaurantTypes[i % odishaData.restaurantTypes.length];
                const restaurantName = `${restaurantType.name} ${city}`;

                // Check if restaurant already exists
                let restaurant = await Restaurant.findOne({
                    where: {
                        name: restaurantName,
                        city
                    }
                });

                if (!restaurant) {
                    // Create restaurant
                    restaurant = await Restaurant.create({
                        name: restaurantName,
                        cuisine: restaurantType.cuisine,
                        description: restaurantType.description,
                        rating: restaurantType.rating + (Math.random() * 0.4 - 0.2), // Slight variation
                        deliveryTime: restaurantType.deliveryTime + Math.floor(Math.random() * 10 - 5),
                        deliveryFee: restaurantType.deliveryFee,
                        minOrder: restaurantType.minOrder,
                        image: restaurantType.image,
                        address: `${Math.floor(Math.random() * 500) + 1}, Main Road, ${city}`,
                        city,
                        state: 'Odisha',
                        zipCode: `75${cityIndex.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`,
                        phone: `0674${Math.floor(Math.random() * 900000) + 100000}`,
                        isActive: true,
                        isOpen: true,
                        ownerId: owner.id
                    });

                    restaurantCount++;
                    console.log(`  ✓ ${restaurantName}`);

                    // Create menu items for this restaurant
                    const menuItemsForType = odishaData.menuItems[restaurantType.name];

                    if (menuItemsForType) {
                        for (const item of menuItemsForType) {
                            await MenuItem.create({
                                restaurantId: restaurant.id,
                                name: item.name,
                                description: `Delicious ${item.name.toLowerCase()} from ${restaurantName}`,
                                price: item.price,
                                category: item.category,
                                isVegetarian: item.isVegetarian,
                                isVegan: false,
                                isAvailable: true,
                                rating: 4.0 + Math.random() * 1.0
                            });
                            menuItemCount++;
                        }
                    }
                }
            }
        }

        console.log('\n\n🎉 Seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   • Cities: ${odishaData.cities.length}`);
        console.log(`   • Restaurants: ${restaurantCount}`);
        console.log(`   • Menu Items: ${menuItemCount}`);
        console.log(`   • Users: ${owners.length + 1} (${owners.length} owners + 1 admin)`);

        console.log('\n🔐 Login Credentials:');
        console.log('   Admin: admin@foodhub.com / admin123');
        console.log('   Owners: owner.[cityname]@foodhub.com / admin123');

        console.log('\n📍 Available Cities:');
        odishaData.cities.forEach(city => {
            console.log(`   • ${city}`);
        });

        console.log('\n✨ You can now search for restaurants in any Odisha city!\n');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed\n');
    }
}

// Run seeder
if (require.main === module) {
    seedOdishaData()
        .then(() => {
            console.log('✅ Seeding process completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Seeding process failed:', error);
            process.exit(1);
        });
}

module.exports = { seedOdishaData };
