const OpenAI = require("openai");

const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");
const Employee = require("../models/Employee");
const Task = require("../models/Task");
const Sales = require("../models/Sales");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.askAdvisor = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        message: "Please enter a question",
      });
    }

    const [
      customers,
      products,
      invoices,
      expenses,
      employees,
      tasks,
      sales,
    ] = await Promise.all([
      Customer.findAll(),
      Product.findAll(),
      Invoice.findAll(),
      Expense.findAll(),
      Employee.findAll(),
      Task.findAll(),
      Sales.findAll(),
    ]);

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total_amount || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    const paidInvoices = invoices.filter(
      (invoice) => invoice.status === "paid"
    ).length;

    const overdueInvoices = invoices.filter(
      (invoice) => invoice.status === "overdue"
    ).length;

    const lowStockProducts = products.filter(
      (product) =>
        Number(product.quantity || 0) <=
        Number(product.low_stock_threshold || 10)
    );

    const activeTasks = tasks.filter(
      (task) => task.status !== "done"
    ).length;

    const businessContext = `
SmartBiz AI business data:

Revenue: $${totalRevenue}
Expenses: $${totalExpenses}
Net profit: $${totalRevenue - totalExpenses}

Customers: ${customers.length}
Products: ${products.length}
Employees: ${employees.length}
Sales: ${sales.length}
Invoices: ${invoices.length}
Paid invoices: ${paidInvoices}
Overdue invoices: ${overdueInvoices}
Active tasks: ${activeTasks}

Low-stock products:
${
  lowStockProducts.length
    ? lowStockProducts
        .map(
          (product) =>
            `- ${product.name}: ${product.quantity} remaining`
        )
        .join("\n")
    : "No low-stock products"
}

Recent sales:
${
  sales.length
    ? sales
        .slice(0, 5)
        .map(
          (sale) =>
            `- ${sale.customer_name}: $${sale.total_amount}`
        )
        .join("\n")
    : "No sales recorded"
}
`;

    const conversation = history
      .slice(-10)
      .map((item) => `${item.role}: ${item.content}`)
      .join("\n");

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `
You are SmartBiz AI, a practical business advisor for small and medium businesses.

Use the provided business data to answer the user's question.
Give clear, useful and data-based advice.
Do not invent business figures.
Use short headings and bullet points where helpful.

${businessContext}

Previous conversation:
${conversation || "No previous conversation"}

User question:
${message}
`,
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("AI Advisor error:", error);

    res.status(500).json({
      message:
        error?.message || "Failed to generate AI advice",
    });
  }
};