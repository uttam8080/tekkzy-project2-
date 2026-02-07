/**
 * Find all users with corrupted password fields
 * Usage: node find_corrupted_users.js
 */

require("dotenv").config();
const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const USERS_TABLE = process.env.USERS_TABLE || "FoodHub_Users";

async function findCorruptedUsers() {
  console.log("\n🔍 Scanning for corrupted user records...\n");

  try {
    // Scan all users
    const result = await dynamoDb
      .scan({
        TableName: USERS_TABLE,
      })
      .promise();

    const users = result.Items || [];
    const corrupted = [];
    const valid = [];

    users.forEach((user) => {
      const hasValidPassword = user.password && user.password.startsWith("$2");

      if (hasValidPassword) {
        valid.push(user.email || user.real_user);
      } else {
        corrupted.push({
          email: user.email || user.real_user,
          password: user.password,
          name: user.firstName,
        });
      }
    });

    console.log(`📊 SCAN RESULTS:`);
    console.log(`─`.repeat(60));
    console.log(`Total users found: ${users.length}`);
    console.log(`Valid accounts: ${valid.length}`);
    console.log(`Corrupted accounts: ${corrupted.length}\n`);

    if (corrupted.length > 0) {
      console.log(`⚠️  CORRUPTED ACCOUNTS:\n`);
      corrupted.forEach((user, i) => {
        console.log(`${i + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name || "N/A"}`);
        console.log(
          `   Password field: ${user.password ? user.password.substring(0, 30) + "..." : "MISSING"}`,
        );
        console.log(`   Status: ⚠️  NEEDS FIXING\n`);
      });

      console.log(`🔧 TO FIX:`);
      console.log(`─`.repeat(60));
      corrupted.forEach((user) => {
        console.log(`node fix_corrupted_users.js ${user.email}`);
      });
      console.log("");
    } else {
      console.log(`✅ All accounts are valid! No corrupted records found.\n`);
    }

    if (valid.length > 0) {
      console.log(`✅ VALID ACCOUNTS:\n`);
      valid.forEach((email, i) => {
        console.log(`${i + 1}. ${email}`);
      });
      console.log("");
    }
  } catch (error) {
    console.error(`❌ Error scanning database: ${error.message}`);
    process.exit(1);
  }
}

findCorruptedUsers();
