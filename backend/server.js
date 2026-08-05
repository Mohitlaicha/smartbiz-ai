const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");

dotenv.config();
const app = express();



app.use(cors());

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SmartBiz AI backend is running",
  });
});

app.get("/", (req, res) => {
  res.send("SmartBiz backend running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

 require("./models/User");
require("./models/Customer");
require("./models/Product");
require("./models/Invoice");
require("./models/Expense");
require("./models/Task");
require("./models/Employee");
require("./models/Sales");

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use(
  "/api/profile",
  require("./routes/profileRoutes")
);
app.use("/api/products", require("./routes/inventoryRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/tasks", require("./routes/tasksRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use(
  "/api/reports",
  require("./routes/reportRoutes")
);
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});

sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL connected");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });
  const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use(express.json());
 