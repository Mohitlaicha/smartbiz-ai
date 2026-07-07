const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");
const Employee = require("../models/Employee");
const Task = require("../models/Task");
const Sale = require("../models/Sales");

exports.getDashboard = async (req, res) => {
  try {
    const customers = await Customer.count();
    const products = await Product.count();
    const invoices = await Invoice.count();
    const expenses = await Expense.findAll();
    const employees = await Employee.count();
    const tasks = await Task.count();
    const sales = await Sale.findAll();

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total_amount || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    res.json({
      totalRevenue,
      totalExpenses,
      customers,
      products,
      invoices,
      employees,
      tasks,
      salesCount: sales.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};