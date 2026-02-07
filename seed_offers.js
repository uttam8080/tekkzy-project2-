const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'offers';

const offersData = [
    {
        image: 'images/authentic_pizza.png',
        type: 'discount',
        value: '50% OFF',
        description: 'On Pizza & Burgers',
        restaurant: 'Pizza Paradise & Burger Barn',
        validFrom: new Date().toISOString(),
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(), // Valid for 1 month
        code: 'FOODHUB50',
        minOrderValue: 200,
        discountType: 'percentage',
        discountValue: 50,
        maxDiscount: 150
    },
    {
        image: 'images/authentic_hyderabadi_biryani.png',
        type: 'cashback',
        value: '₹100 Cash',
        description: 'On orders above ₹300',
        restaurant: 'All Restaurants',
        validFrom: new Date().toISOString(),
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
        code: 'SAVE100',
        minOrderValue: 300,
        discountType: 'flat',
        discountValue: 100
    },
    {
        image: 'images/fresh_sushi.png',
        type: 'discount',
        value: '30% OFF',
        description: 'On Sushi & Asian Cuisine',
        restaurant: 'Sushi Sensation & Dragon Wok',
        validFrom: new Date().toISOString(),
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        code: 'SUSHI30',
        minOrderValue: 500,
        discountType: 'percentage',
        discountValue: 30,
        maxDiscount: 200
    },
    {
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80',
        type: 'free',
        value: 'FREE Drink',
        description: 'On orders above ₹500',
        restaurant: 'All Restaurants',
        validFrom: new Date().toISOString(),
        validUntil: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
        code: 'FREEDRINK',
        minOrderValue: 500,
        discountType: 'free_item',
        discountValue: 0
    },
    {
        image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
        type: 'combo',
        value: 'Combo Deal',
        description: '2 items for ₹399',
        restaurant: 'Selected Restaurants',
        validFrom: new Date().toISOString(),
        validUntil: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        code: 'COMBO399',
        minOrderValue: 0,
        discountType: 'flat',
        discountValue: 0 // Special logic might apply
    },
    {
        image: 'images/delicious_dessert.png',
        type: 'discount',
        value: '25% OFF',
        description: 'On Desserts & Sweets',
        restaurant: 'Sweet Dreams',
        validFrom: new Date().toISOString(),
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        code: 'SWEET25',
        minOrderValue: 150,
        discountType: 'percentage',
        discountValue: 25,
        maxDiscount: 100
    }
];

async function seedOffers() {
    console.log(`Seeding '${TABLE_NAME}' table with ${offersData.length} offers...`);

    let successCount = 0;
    let errorCount = 0;

    for (const offer of offersData) {
        const item = {
            offerId: uuidv4(),
            isActive: true,
            usedCount: 0,
            createdAt: new Date().toISOString(),
            ...offer
        };

        const params = {
            TableName: TABLE_NAME,
            Item: item
        };

        try {
            await docClient.put(params).promise();
            console.log(`✅ Inserted: ${offer.value} - ${offer.description}`);
            successCount++;
        } catch (err) {
            console.error(`❌ Failed to insert offer:`, err.message);
            errorCount++;
        }
    }

    console.log(`\nSeeding Complete! Success: ${successCount}, Failed: ${errorCount}`);
}

seedOffers();
