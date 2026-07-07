const Invoice = require("../models/Invoice");

exports.getInvoices = async (req, res) => {
  const invoices = await Invoice.findAll({ order: [["id", "DESC"]] });
  res.json(invoices);
};

exports.createInvoice = async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.status(201).json(invoice);
};

exports.updateInvoice = async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id);
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  await invoice.update(req.body);
  res.json(invoice);
};

exports.deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id);
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  await invoice.destroy();
  res.json({ message: "Invoice deleted successfully" });
};