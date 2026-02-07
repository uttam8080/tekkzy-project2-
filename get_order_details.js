const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'orders';

async function getRecentOrderDetails() {
    console.log(`Scanning '${TABLE_NAME}' for recent orders...`);

    try {
        // 1. Scan for orders (Limit 10 to be safe)
        // Note: In production, you woud Query by Index (e.g., UserId or CreatedAt). 
        // Scan is fine for this dev/test scenario.
        const data = await docClient.scan({
            TableName: TABLE_NAME,
            Limit: 10
        }).promise();

        if (data.Items.length === 0) {
            console.log("No orders found in the database.");
            return;
        }

        // 2. Sort by createdAt desc to get the latest
        // (Assuming createdAt is ISO string)
        const sortedOrders = data.Items.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        console.log(`\nFound ${sortedOrders.length} orders. Here are the most recent 3:`);
        sortedOrders.slice(0, 3).forEach((order, i) => {
            console.log(`${i + 1}. ID: ${order.orderId} | Date: ${order.createdAt} | Amount: ${order.amount}`);
        });

        const latestOrder = sortedOrders[0];
        console.log(`\n\n=== FULL DETAILS OF MOST RECENT ORDER (${latestOrder.orderId}) ===`);
        console.dir(latestOrder, { depth: null, colors: true });

    } catch (err) {
        console.error("Error fetching order:", err);
    }
}

getRecentOrderDetails();
