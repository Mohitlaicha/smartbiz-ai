const { Op } = require("sequelize");

const Sales = require("../models/Sales");
const Expense = require("../models/Expense");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};

      if (startDate) {
        dateFilter.createdAt[Op.gte] = new Date(
          `${startDate}T00:00:00`
        );
      }

      if (endDate) {
        dateFilter.createdAt[Op.lte] = new Date(
          `${endDate}T23:59:59.999`
        );
      }
    }

    const [sales, expenses, invoices, customers, products] =
      await Promise.all([
        Sales.findAll({
          where: dateFilter,
          order: [["createdAt", "DESC"]],
        }),

        Expense.findAll({
          where: dateFilter,
          order: [["createdAt", "DESC"]],
        }),

        Invoice.findAll({
          where: dateFilter,
          order: [["createdAt", "DESC"]],
        }),

        Customer.findAll({
          where: dateFilter,
          order: [["createdAt", "DESC"]],
        }),

        Product.findAll(),
      ]);

    const totalRevenue = sales.reduce(
      (sum, sale) =>
        sum + Number(sale.total_amount || sale.amount || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

    const inventoryValue = products.reduce(
      (sum, product) =>
        sum +
        Number(product.quantity || 0) *
          Number(product.cost || product.price || 0),
      0
    );

    return res.json({
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },

      summary: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        inventoryValue,
        totalCustomers: customers.length,
        totalInvoices: invoices.length,
        totalSales: sales.length,
      },

      sales,
      expenses,
      invoices,
      customers,
    });
  } catch (error) {
    console.error("Report error:", error);

    return res.status(500).json({
      message: "Unable to generate report",
    });
  }
};