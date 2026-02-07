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
const TABLE_NAME = 'menuItems';

async function seedMenuItems() {
    console.log(`Extracting menu items for '${TABLE_NAME}' table...`);

    let menuItems = [];

    // Extract items from the nested menu structure
    restaurants.forEach(restaurant => {
        if (restaurant.menu) {
            Object.keys(restaurant.menu).forEach(category => {
                const items = restaurant.menu[category];
                items.forEach(item => {
                    menuItems.push({
                        menuItemId: item.id.toString(), // Primary Key (Corrected)
                        itemId: item.id.toString(), // Keeping original ID for reference if needed
                        restaurantId: restaurant.id, // Foreign Key
                        category: category,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        isVeg: item.isVeg !== undefined ? item.isVeg : true, // Default to true if missing? or strict check
                        isAvailable: true,
                        createdAt: new Date().toISOString()
                    });
                });
            });
        }
    });

    console.log(`Found ${menuItems.length} menu items to insert.`);

    let successCount = 0;
    let errorCount = 0;

    // Insert items in batches or sequentially
    for (const item of menuItems) {
        const params = {
            TableName: TABLE_NAME,
            Item: item
        };

        try {
            await docClient.put(params).promise();
            process.stdout.write('.'); // Progress dot
            successCount++;
        } catch (err) {
            console.error(`\n❌ Failed to insert ${item.name}:`, err.message);
            errorCount++;
        }
    }

    console.log(`\n\nSeeding Complete! Success: ${successCount}, Failed: ${errorCount}`);
}

seedMenuItems();
