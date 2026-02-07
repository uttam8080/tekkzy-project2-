const AWS = require('aws-sdk');
require('dotenv').config();

const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function run() {
    const tables = ['users', 'foodhub123_table.'];
    for (const t of tables) {
        console.log(`\n--- Table: ${t} ---`);
        try {
            const res = await dynamodb.scan({ TableName: t }).promise();
            res.Items.forEach(u => {
                const email = u.email || u.real_user;
                const hasPwd = !!u.password;
                const pwdStart = u.password ? u.password.substring(0, 5) : 'NONE';
                console.log(`User: ${email} | Has Pwd: ${hasPwd} | Pwd Start: ${pwdStart}`);
            });
        } catch (e) { console.log(`Error: ${e.message}`); }
    }
}
run();
