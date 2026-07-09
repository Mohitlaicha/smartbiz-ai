const Sales = require("../models/Sales");
const Invoice = require("../models/Invoice");

exports.getSales = async (req, res) => {
  try {
    const sales = await Sales.findAll({
      order: [["id", "DESC"]],
    });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const invoiceNumber = `INV-${Date.now()}`;

    const sale = await Sales.create({
      ...req.body,
      invoice_number: invoiceNumber,
    });

    await Invoice.create({
      invoice_number: invoiceNumber,
      customer_name: req.body.customer_name,
      amount: req.body.total_amount,
      status: "paid",
      due_date: new Date(),
      notes: "Auto-generated from sale",
    });

    res.status(201).json({
      message: "Sale and invoice created successfully",
      sale,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    await sale.destroy();

    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};