const AWS = require('aws-sdk');
const restaurants = require('./data/restaurants_data');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'restaurants';

async function seedRestaurants() {
    console.log(`Seeding '${TABLE_NAME}' table with ${restaurants.length} items...`);

    let successCount = 0;
    let errorCount = 0;

    for (const restaurant of restaurants) {
        const item = {
            restaurantId: restaurant.id, // Map 'id' to 'restaurantId'
            ...restaurant
        };
        // Remove the original 'id' if desired, but keeping it is harmless usually.
        // However, best practice is to have the PK clear.
        delete item.id;

        const params = {
            TableName: TABLE_NAME,
            Item: item
        };

        try {
            await docClient.put(params).promise();
            console.log(`✅ Inserted: ${restaurant.name} (ID: ${restaurant.id})`);
            successCount++;
        } catch (err) {
            console.error(`❌ Failed to insert ${restaurant.name}:`, err.message);
            errorCount++;
        }
    }

    console.log(`\nSeeding Complete! Success: ${successCount}, Failed: ${errorCount}`);
}

seedRestaurants();
