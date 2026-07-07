const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartBiz backend running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

const PORT = process.env.PORT || 5000;

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
app.use("/api/products", require("./routes/inventoryRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/tasks", require("./routes/tasksRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));