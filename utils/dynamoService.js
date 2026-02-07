const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE || "FoodHub_Users";

// Helper: Ensure table exists (simplified for now, ideally handled by IaC)

// Table Schema for foodhub123_table.
// PK: real_user (We will store EMAIL here)
// SK: createdAt (ISO Timestamp)

exports.createUser = async (userData) => {
  // Check if user already exists
  // Since we have a Sort Key (createdAt), we can't just rely on PutItem's condition for "email" uniqueness easily
  // if the timestamp is different. So we must QUERY first.
  const existing = await this.findUserByEmail(userData.email);
  if (existing) {
    throw new Error("Email already registered");
  }

  const userId = uuidv4();
  const createdAt = new Date().toISOString();

  const newUser = {
    real_user: userData.email, // Mapped to PK
    createdAt: createdAt, // Mapped to SK

    // Attributes
    userId,
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    role: userData.role || "customer",
    isVerified: false,
  };

  const command = new PutCommand({
    TableName: USERS_TABLE,
    Item: newUser,
  });

  await docClient.send(command);
  return newUser;
};

exports.findUserByEmail = async (email) => {
  // With a composite key (PK + SK), we cannot use GetItem unless we know the SK (createdAt).
  // We only know the email (PK), so we must use QUERY.
  const command = new QueryCommand({
    TableName: USERS_TABLE,
    KeyConditionExpression: "real_user = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  });

  const response = await docClient.send(command);
  // Return the first match (there should theoretically be only one if we enforce uniqueness)
  return response.Items && response.Items.length > 0 ? response.Items[0] : null;
};

exports.updateUser = async (email, updates) => {
  // 1. Fetch user to get the Sort Key (createdAt)
  const user = await this.findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: {
      real_user: email,
      createdAt: user.createdAt,
    },
    UpdateExpression: "set firstName = :f, lastName = :l, phone = :p",
    ExpressionAttributeValues: {
      ":f": updates.firstName || user.firstName,
      ":l": updates.lastName || user.lastName,
      ":p": updates.phone || user.phone,
    },
    ReturnValues: "ALL_NEW",
  });

  const response = await docClient.send(command);
  return response.Attributes;
};

exports.updateUserPassword = async (email, hashedPassword) => {
  // Fetch user to get the Sort Key (createdAt)
  const user = await this.findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: {
      real_user: email,
      createdAt: user.createdAt,
    },
    UpdateExpression: "set password = :pwd",
    ExpressionAttributeValues: {
      ":pwd": hashedPassword,
    },
    ReturnValues: "ALL_NEW",
  });

  const response = await docClient.send(command);
  return response.Attributes;
};
