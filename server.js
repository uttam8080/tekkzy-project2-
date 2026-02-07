require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDynamoDB } = require("./config/dynamodb");
const errorHandler = require("./middleware/errorHandler");
const path = require("path");

// Initialize express app
const app = express();

// Connect to DynamoDB
connectDynamoDB()
  .then(() => {
    console.log("🗄️  DynamoDB database initialized");
  })
  .catch((error) => {
    console.error("Failed to connect to DynamoDB:", error);
    process.exit(1);
  });

// Serve the auth_callback.html file directly from the backend
// This ensures the OAuth redirect works even if the frontend isn't running on the expected port
app.get("/auth_callback.html", (req, res) => {
  const filePath = path.join(__dirname, "../auth_callback.html");
  console.log(`Serving auth_callback.html from: ${filePath}`);
  res.sendFile(filePath);
});

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8080",
      "https://tekkyproject.netlify.app",
      "http://localhost:8080",
      "http://localhost:8000",
      "http://localhost:5173",
      "http://127.0.0.1:8000",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:5000",
      "null",
    ],
    credentials: true,
  }),
);

// Compression middleware for better performance
const compression = require("compression");
app.use(compression());

// Cache control for API responses
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.set("Cache-Control", "public, max-age=300"); // 5 min cache
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Passport Config
require("./config/passport");
const passport = require("passport");
app.use(passport.initialize());

// Minimal request logging - only errors in production
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    if (req.method !== "GET" || process.env.DEBUG_LOGS === "true") {
      console.log(
        `[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`,
      );
    }
    next();
  });
}

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/restaurants", require("./routes/restaurants"));
app.use("/api/menu-items", require("./routes/menu"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/offers", require("./routes/offers"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/payment/razorpay", require("./routes/razorpay"));

// Help & Support Routes
app.use("/api/help", require("./routes/help"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/about", require("./routes/about"));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    database: "DynamoDB",
    timestamp: new Date().toISOString(),
  });
});

// Root route
// Serve static files from the root directory (frontend)
// Security: Block access to backend files and sensitive data
app.use((req, res, next) => {
  if (
    req.path.startsWith("/backend") ||
    req.path.includes(".env") ||
    req.path.includes(".git")
  ) {
    return res.status(403).send("Forbidden");
  }
  next();
});

app.use(express.static(path.join(__dirname, "..")));

// Fallback to API info if no static file matches (optional, for explicit /api/info)
app.get("/api/info", (req, res) => {
  res.json({
    success: true,
    message: "FoodHub API Server",
    version: "1.0.0",
    database: "DynamoDB",
    endpoints: {
      auth: "/api/auth",
      restaurants: "/api/restaurants",
      menuItems: "/api/menu-items",
      cart: "/api/cart",
      orders: "/api/orders",
      offers: "/api/offers",
      health: "/api/health",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📊 Database: DynamoDB (${process.env.AWS_REGION})`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:8000"}`,
  );
  console.log(`\n✅ API Endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Restaurants: http://localhost:${PORT}/api/restaurants`);
  console.log(`   - Cart: http://localhost:${PORT}/api/cart`);
  console.log(`\n📝 Ready to accept requests!\n`);
});

// Handle unhandled promise rejections
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  console.error(err); // Log full stack trace
  // server.close(() => process.exit(1)); // Don't crash for debugging
});

module.exports = app;
