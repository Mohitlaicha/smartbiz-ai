import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartBiz backend running");
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "mohitlaicha22@gmail.com" && password === "12345678") {
    return res.json({
      message: "Login successful",
      user: {
        name: "Mohit",
        email,
        role: "admin",
      },
    });
  }

  res.status(401).json({ message: "Invalid email or password" });
});

app.post("/api/auth/register", (req, res) => {
  res.json({
    message: "Account created successfully",
    user: req.body,
  });
});

app.get("/api/dashboard", (req, res) => {
  res.json({
    revenue: 24500,
    customers: 42,
    products: 18,
    invoices: 12,
  });
});

app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "Laptop", stock: 10, price: 1200 },
    { id: 2, name: "Phone", stock: 25, price: 900 },
  ]);
});

app.post("/api/products", (req, res) => {
  res.json({ message: "Product added", product: req.body });
});

app.get("/api/invoices", (req, res) => {
  res.json([
    { id: 1, customer: "ABC Store", amount: 500, status: "Paid" },
    { id: 2, customer: "XYZ Mart", amount: 850, status: "Pending" },
  ]);
});

app.post("/api/invoices", (req, res) => {
  res.json({ message: "Invoice created", invoice: req.body });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});