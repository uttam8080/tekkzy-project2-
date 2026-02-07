// Seed data generator - Run with: node seeds/seedData.js

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Offer = require('../models/Offer');
const HelpArticle = require('../models/HelpArticle');
const FAQ = require('../models/FAQ');
const AppInfo = require('../models/AppInfo');
const { encryptPassword } = require('../config/utils');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await MenuItem.deleteMany({});
        await Offer.deleteMany({});
        await HelpArticle.deleteMany({});
        await FAQ.deleteMany({});
        await AppInfo.deleteMany({});

        console.log('Cleared existing data...');

        // Create sample users (restaurant owners)
        const adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@foodhub.com',
            password: await encryptPassword('admin123'),
            phone: '9876543210',
            role: 'admin',
            isVerified: true
        });

        const restaurantOwner1 = await User.create({
            firstName: 'Pizza',
            lastName: 'Owner',
            email: 'pizza@foodhub.com',
            password: await encryptPassword('owner123'),
            phone: '9876543211',
            role: 'restaurant',
            isVerified: true
        });

        const restaurantOwner2 = await User.create({
            firstName: 'Burger',
            lastName: 'Owner',
            email: 'burger@foodhub.com',
            password: await encryptPassword('owner123'),
            phone: '9876543212',
            role: 'restaurant',
            isVerified: true
        });

        console.log('Created sample users...');

        // Create restaurants
        const restaurant1 = await Restaurant.create({
            name: 'Pizza Paradise',
            owner: restaurantOwner1._id,
            description: 'Authentic Italian pizzas',
            cuisine: ['Italian', 'Pizza'],
            rating: 4.5,
            deliveryTime: 30,
            deliveryFee: 0,
            distance: 2,
            priceRange: '₹200-500',
            image: '🍕',
            address: {
                street: '123 Pizza Lane',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001'
            },
            phone: '9876543211',
            email: 'pizza@foodhub.com',
            operatingHours: {
                monday: { open: '11:00', close: '23:00' },
                tuesday: { open: '11:00', close: '23:00' },
                wednesday: { open: '11:00', close: '23:00' },
                thursday: { open: '11:00', close: '23:00' },
                friday: { open: '11:00', close: '23:00' },
                saturday: { open: '12:00', close: '23:30' },
                sunday: { open: '12:00', close: '23:00' }
            }
        });

        const restaurant2 = await Restaurant.create({
          name: "Burger Barn",
          owner: restaurantOwner2._id,
          description: "Juicy burgers and sides",
          cuisine: ["American", "Burgers"],
          rating: 4.3,
          deliveryTime: 25,
          deliveryFee: 0,
          distance: 1.5,
          priceRange: "₹150-400",
          image:
            "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          address: {
            street: "456 Burger Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400002",
          },
          phone: "9876543212",
          email: "burger@foodhub.com",
          operatingHours: {
            monday: { open: "10:00", close: "22:00" },
            tuesday: { open: "10:00", close: "22:00" },
            wednesday: { open: "10:00", close: "22:00" },
            thursday: { open: "10:00", close: "22:00" },
            friday: { open: "10:00", close: "22:00" },
            saturday: { open: "11:00", close: "23:00" },
            sunday: { open: "11:00", close: "22:00" },
          },
        });

        console.log('Created restaurants...');

        // Create menu items
        const menuItems = [
            {
                restaurant: restaurant1._id,
                name: 'Margherita',
                description: 'Classic cheese pizza',
                category: 'Pizzas',
                price: 299,
                isVegetarian: true
            },
            {
                restaurant: restaurant1._id,
                name: 'Pepperoni',
                description: 'Loaded with pepperoni',
                category: 'Pizzas',
                price: 399
            },
            {
                restaurant: restaurant1._id,
                name: 'Garlic Bread',
                description: 'Crispy garlic bread',
                category: 'Sides',
                price: 149,
                isVegetarian: true
            },
            {
                restaurant: restaurant2._id,
                name: 'Classic Burger',
                description: 'Juicy beef patty',
                category: 'Burgers',
                price: 249
            },
            {
                restaurant: restaurant2._id,
                name: 'Cheese Burger',
                description: 'With melted cheese',
                category: 'Burgers',
                price: 299
            },
            {
                restaurant: restaurant2._id,
                name: 'Fries',
                description: 'Golden crispy fries',
                category: 'Sides',
                price: 99,
                isVegetarian: true
            }
        ];

        await MenuItem.insertMany(menuItems);
        console.log('Created menu items...');

        // Create sample offers
        await Offer.create({
            code: 'WELCOME20',
            description: 'Welcome offer - 20% off on first order',
            discountType: 'percentage',
            discountValue: 20,
            minOrderValue: 200,
            maxDiscount: 100,
            usageLimit: 100,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            applicableRestaurants: [restaurant1._id, restaurant2._id]
        });

        await Offer.create({
            code: 'FLAT50',
            description: 'Flat ₹50 off on orders above ₹300',
            discountType: 'fixed',
            discountValue: 50,
            minOrderValue: 300,
            usageLimit: 200,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            isActive: true
        });

        console.log('Created offers...');

        // Create help articles
        const helpArticles = [
            {
                title: 'How to Place an Order',
                category: 'ordering',
                content: 'To place an order: 1. Browse restaurants 2. Select items 3. Add to cart 4. Proceed to checkout 5. Confirm payment.',
                keywords: ['order', 'place', 'ordering'],
                isPublished: true
            },
            {
                title: 'Payment Methods',
                category: 'payment',
                content: 'We accept credit cards, debit cards, UPI, and digital wallets for payment.',
                keywords: ['payment', 'card', 'method'],
                isPublished: true
            },
            {
                title: 'Track Your Order',
                category: 'ordering',
                content: 'You can track your order in real-time through the "My Orders" section in your account.',
                keywords: ['track', 'order', 'status'],
                isPublished: true
            },
            {
                title: 'Update Your Profile',
                category: 'account',
                content: 'Go to Settings > Profile to update your personal information and delivery address.',
                keywords: ['profile', 'account', 'update'],
                isPublished: true
            },
            {
                title: 'Delivery Information',
                category: 'delivery',
                content: 'Delivery typically takes 30-45 minutes. You\'ll receive notifications for order status updates.',
                keywords: ['delivery', 'time', 'status'],
                isPublished: true
            }
        ];

        await HelpArticle.insertMany(helpArticles);
        console.log('Created help articles...');

        // Create FAQs
        const faqs = [
            {
                question: 'What are your delivery timings?',
                answer: 'Most restaurants deliver within 30-45 minutes. You can see estimated delivery time before placing your order.',
                category: 'delivery',
                order: 1,
                isActive: true
            },
            {
                question: 'Can I cancel my order?',
                answer: 'Yes, you can cancel orders that are not yet being prepared. Once preparation starts, cancellation may not be possible.',
                category: 'general',
                order: 2,
                isActive: true
            },
            {
                question: 'What payment methods are accepted?',
                answer: 'We accept credit cards, debit cards, UPI, net banking, and digital wallets.',
                category: 'payment',
                order: 3,
                isActive: true
            },
            {
                question: 'Is there a minimum order value?',
                answer: 'Different restaurants have different minimum order values. You\'ll see this when viewing their menu.',
                category: 'ordering',
                order: 4,
                isActive: true
            },
            {
                question: 'How do I contact customer support?',
                answer: 'You can reach us through the Help section or contact us directly via email or phone number provided in the app.',
                category: 'general',
                order: 5,
                isActive: true
            }
        ];

        await FAQ.insertMany(faqs);
        console.log('Created FAQs...');

        // Create app info (for About page)
        await AppInfo.create({
            appName: 'FoodHub',
            tagline: 'Order Food Online - Fast & Fresh Delivery',
            description: 'FoodHub is your one-stop solution for ordering delicious food from your favorite restaurants.',
            foundedYear: 2023,
            mission: 'To revolutionize food delivery by bringing restaurant-quality meals to your doorstep quickly and reliably.',
            vision: 'To become the leading food delivery platform connecting millions of customers with their favorite restaurants.',
            values: ['Customer First', 'Quality', 'Reliability', 'Innovation', 'Sustainability'],
            statistics: {
                totalUsers: 50000,
                totalOrders: 500000,
                partnerRestaurants: 5000,
                cities: 50
            },
            team: [
                {
                    name: 'Raj Kumar',
                    role: 'Founder & CEO',
                    bio: 'Visionary entrepreneur with 10 years of experience in the food industry.'
                },
                {
                    name: 'Priya Singh',
                    role: 'CTO',
                    bio: 'Tech innovator passionate about building scalable solutions.'
                },
                {
                    name: 'Amit Patel',
                    role: 'COO',
                    bio: 'Operations expert ensuring seamless delivery experiences.'
                }
            ],
            socialLinks: {
                facebook: 'https://facebook.com/foodhub',
                twitter: 'https://twitter.com/foodhub',
                instagram: 'https://instagram.com/foodhub',
                linkedin: 'https://linkedin.com/company/foodhub'
            },
            contactEmail: 'support@foodhub.com',
            supportPhone: '1800-123-4567',
            address: '123 Tech Park, Mumbai, Maharashtra, India'
        });

        console.log('Created app info...');

        console.log('✓ Database seeding completed successfully!');
        console.log('\nTest Credentials:');
        console.log('Admin Email: admin@foodhub.com, Password: admin123');
        console.log('Restaurant Email: pizza@foodhub.com, Password: owner123');
        console.log('Restaurant Email: burger@foodhub.com, Password: owner123');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

connectDB().then(() => seedData());
