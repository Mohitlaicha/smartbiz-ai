const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "https://smartbizai.site",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const isVercelPreview =
        origin &&
        /^https:\/\/smartbiz-ai-2b6n-[a-z0-9-]+-smart-biz-ai\.vercel\.app$/i.test(
          origin
        );

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isVercelPreview
      ) {
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

app.options("*", cors());
app.use(express.json());

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

// Load Sequelize models
require("./models/User");
require("./models/Customer");
require("./models/Product");
require("./models/Invoice");
require("./models/Expense");
require("./models/Task");
require("./models/Employee");
require("./models/Sales");

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/products", require("./routes/inventoryRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/tasks", require("./routes/tasksRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (error.message.includes("not allowed by CORS")) {
    return res.status(403).json({
      message: "Origin is not allowed by CORS",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected");

    await sequelize.sync({
      alter: true,
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Database connection failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();