#!/usr/bin/env node

/**
 * DynamoDB Table Initialization Script
 * Creates all required tables for FoodHub application
 *
 * Usage: node config/initializeDynamoDB.js
 */

require("dotenv").config();
const AWS = require("aws-sdk");
const tables = require("./dynamodbTables");

AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB();

const tableList = Object.values(tables);

async function createTable(tableConfig) {
  try {
    console.log(`\n📋 Creating table: ${tableConfig.TableName}...`);

    const result = await dynamoDB.createTable(tableConfig).promise();
    console.log(`✅ Table ${tableConfig.TableName} created successfully!`);
    return true;
  } catch (error) {
    if (error.code === "ResourceInUseException") {
      console.log(`⚠️  Table ${tableConfig.TableName} already exists`);
      return true;
    } else {
      console.error(
        `❌ Error creating table ${tableConfig.TableName}:`,
        error.message,
      );
      return false;
    }
  }
}

async function initializeTables() {
  console.log("\n🚀 Initializing DynamoDB Tables for FoodHub...\n");
  console.log(`AWS Region: ${process.env.AWS_REGION || "us-east-1"}`);
  console.log(`Total Tables: ${tableList.length}\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const table of tableList) {
    const success = await createTable(table);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    // Add delay to avoid throttling
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📋 Total: ${tableList.length}`);
  console.log(`${"=".repeat(50)}\n`);

  if (failureCount === 0) {
    console.log("🎉 All tables initialized successfully!\n");
    process.exit(0);
  } else {
    console.log("⚠️  Some tables failed to initialize\n");
    process.exit(1);
  }
}

// Run initialization
initializeTables().catch((error) => {
  console.error("Fatal error during initialization:", error);
  process.exit(1);
});
