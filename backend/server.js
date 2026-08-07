const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// Models
// ==============================
const User = require("./models/User");
const Customer = require("./models/Customer");
const Product = require("./models/Product");
const Invoice = require("./models/Invoice");
const Expense = require("./models/Expense");
const Task = require("./models/Task");
const Employee = require("./models/Employee");
const Sales = require("./models/Sales");

// ==============================
// Associations
// ==============================

// A task is assigned to one user
Task.belongsTo(User, {
  foreignKey: "assignedTo",
  as: "assignee",
});

// A task is assigned by one user
Task.belongsTo(User, {
  foreignKey: "assignedBy",
  as: "assigner",
});

// Optional reverse associations
User.hasMany(Task, {
  foreignKey: "assignedTo",
  as: "assignedTasks",
});

User.hasMany(Task, {
  foreignKey: "assignedBy",
  as: "createdTasks",
});

// ==============================
// CORS
// ==============================
const allowedOrigins = [
  "http://localhost:5173",
  "https://smartbizai.site",
  "https://www.smartbizai.site",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, curl, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      const isVercelPreview =
        /^https:\/\/smartbiz-ai-[a-z0-9-]+.*\.vercel\.app$/i.test(
          origin
        );

      if (isVercelPreview) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(
        new Error(`Origin ${origin} is not allowed by CORS`)
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// ==============================
// Middleware
// ==============================
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==============================
// Basic routes
// ==============================
app.get("/", (req, res) => {
  res.send("SmartBiz backend running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SmartBiz AI backend is running",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API working",
  });
});

// ==============================
// API Routes
// ==============================
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/dashboard",
  require("./routes/dashboardRoutes")
);

app.use(
  "/api/customers",
  require("./routes/customerRoutes")
);

app.use(
  "/api/profile",
  require("./routes/profileRoutes")
);

app.use(
  "/api/products",
  require("./routes/inventoryRoutes")
);

app.use(
  "/api/invoices",
  require("./routes/invoiceRoutes")
);

app.use(
  "/api/expenses",
  require("./routes/expenseRoutes")
);

app.use(
  "/api/employees",
  require("./routes/employeeRoutes")
);

app.use(
  "/api/tasks",
  require("./routes/tasksRoutes")
);

app.use(
  "/api/sales",
  require("./routes/salesRoutes")
);

app.use(
  "/api/ai",
  require("./routes/aiRoutes")
);

app.use(
  "/api/users",
  require("./routes/userRoutes")
);

app.use(
  "/api/reports",
  require("./routes/reportRoutes")
);

// ==============================
// 404 handler
// ==============================
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ==============================
// Error handler
// ==============================
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (
    error.message &&
    error.message.includes("not allowed by CORS")
  ) {
    return res.status(403).json({
      message: "Origin is not allowed by CORS",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
});

// ==============================
// Start server
// ==============================
const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("MySQL connected");

    await sequelize.sync({
      alter: true,
    });

    console.log("Database synchronized");

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Backend running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Database connection failed:",
      error
    );

    process.exit(1);
  }
};

startServer();