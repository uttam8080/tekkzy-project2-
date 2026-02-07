// DynamoDB Table Definitions
// This file contains the schema for all DynamoDB tables

const tables = {
  users: {
    TableName: "users",
    KeySchema: [
      { AttributeName: "email", KeyType: "HASH" }, // Partition Key
    ],
    AttributeDefinitions: [
      { AttributeName: "email", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "role", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST", // On-demand pricing
    GlobalSecondaryIndexes: [
      {
        IndexName: "userIdIndex",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "roleIndex",
        KeySchema: [{ AttributeName: "role", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    Tags: [
      { Key: "Environment", Value: "production" },
      { Key: "Application", Value: "FoodHub" },
    ],
  },

  restaurants: {
    TableName: "restaurants",
    KeySchema: [{ AttributeName: "restaurantId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "restaurantId", AttributeType: "S" },
      { AttributeName: "ownerId", AttributeType: "S" },
      { AttributeName: "cuisine", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "ownerIdIndex",
        KeySchema: [{ AttributeName: "ownerId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "cuisineIndex",
        KeySchema: [{ AttributeName: "cuisine", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },

  menuItems: {
    TableName: "menuItems",
    KeySchema: [{ AttributeName: "menuItemId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "menuItemId", AttributeType: "S" },
      { AttributeName: "restaurantId", AttributeType: "S" },
      { AttributeName: "category", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "restaurantIdIndex",
        KeySchema: [{ AttributeName: "restaurantId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "categoryIndex",
        KeySchema: [{ AttributeName: "category", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },

  carts: {
    TableName: "carts",
    KeySchema: [{ AttributeName: "cartId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "cartId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "userIdIndex",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },

  orders: {
    TableName: "orders",
    KeySchema: [{ AttributeName: "orderId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "orderId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "userIdIndex",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "statusIndex",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },

  offers: {
    TableName: "offers",
    KeySchema: [{ AttributeName: "offerId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "offerId", AttributeType: "S" },
      { AttributeName: "restaurantId", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "restaurantIdIndex",
        KeySchema: [{ AttributeName: "restaurantId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },

  reviews: {
    TableName: "reviews",
    KeySchema: [{ AttributeName: "reviewId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "reviewId", AttributeType: "S" },
      { AttributeName: "restaurantId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "restaurantIdIndex",
        KeySchema: [{ AttributeName: "restaurantId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "userIdIndex",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },

  faqs: {
    TableName: "faqs",
    KeySchema: [{ AttributeName: "faqId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "faqId", AttributeType: "S" },
      { AttributeName: "category", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "categoryIndex",
        KeySchema: [{ AttributeName: "category", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },

  contacts: {
    TableName: "contacts",
    KeySchema: [{ AttributeName: "contactId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "contactId", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "emailIndex",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },

  feedback: {
    TableName: "feedback",
    KeySchema: [{ AttributeName: "feedbackId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "feedbackId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
      {
        IndexName: "userIdIndex",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
};

module.exports = tables;
