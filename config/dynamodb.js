const AWS = require("aws-sdk");

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create DynamoDB Document Client (easier to work with)
const dynamoDb = new AWS.DynamoDB.DocumentClient({
  convertEmptyValues: true,
  region: process.env.AWS_REGION || "us-east-1",
});

// Create DynamoDB client for table management (creating/deleting tables)
const dynamoDbClient = new AWS.DynamoDB({
  region: process.env.AWS_REGION || "us-east-1",
});

const connectDynamoDB = async () => {
  try {
    // Test connection by listing tables
    const tables = await dynamoDbClient.listTables().promise();
    console.log("✅ AWS DynamoDB Connected Successfully");
    console.log(`📊 Available tables: ${tables.TableNames.length}`);
    return { dynamoDb, dynamoDbClient };
  } catch (error) {
    console.error("❌ Unable to connect to DynamoDB:", error.message);
    process.exit(1);
  }
};

module.exports = { dynamoDb, dynamoDbClient, connectDynamoDB };
