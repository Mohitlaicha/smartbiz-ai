const Customer = require("../models/Customer");

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [["id", "DESC"]],
    });

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add customer
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    await customer.update(req.body);

    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    await customer.destroy();

    res.json({
      message: "Customer deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};