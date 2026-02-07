# Tekkzy Food Delivery - Backend

The core API server for the FoodHub delivery application. Built with Node.js, Express, and AWS DynamoDB.

## 🚀 Key Features
- **RESTful API**: Clean endpoints for authentication, restaurant management, and orders.
- **AWS Integration**: Fully integrated with DynamoDB for scalable data storage.
- **In-Memory Caching**: Implemented a 5-minute cache TTL for restaurant data to optimize database performance.
- **Secure Authentication**: JWT-based auth with Passport.js and bcrypt password hashing.
- **Payment Integration**: Support for Razorpay and Stripe.

## 🛠️ Technology Stack
- **Server**: Node.js & Express
- **Database**: AWS DynamoDB
- **Authentication**: JWT & Passport.js
- **Security**: Bcrypt
- **Payments**: Razorpay & Stripe

## 📁 Directory Structure
- `/controllers`: API request handling logic.
- `/routes`: Endpoint definitions.
- `/config`: Database and Passport configurations.
- `/utils`: Common utility functions and DynamoDB services.
- `/middleware`: Auth and error handling filters.

## 🔧 Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file (see `.env.example`)
4. Run the server: `npm run dev`
