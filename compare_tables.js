const AWS = require('aws-sdk');
require('dotenv').config();

const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function listUsersInTable(tableName) {
    console.log(`\nScanning table: ${tableName}`);
    try {
        const result = await dynamodb.scan({ TableName: tableName }).promise();
        console.log(`Total records: ${result.Items.length}`);
        result.Items.forEach(u => {
            console.log(`Item: ${JSON.stringify(u)}`);
        });
    } catch (e) {
        console.log(`Error scanning ${tableName}: ${e.message}`);
    }
}

async function run() {
    await listUsersInTable('users');
    await listUsersInTable('foodhub123_table.');
}
run();
