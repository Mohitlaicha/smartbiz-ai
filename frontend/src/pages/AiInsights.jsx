import React, { useEffect, useState } from "react";
import {
  Brain,
  TrendingUp,
  Package,
  Users,
  Lightbulb,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { businessAPI } from "@/api/client";

export default function AiInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [businessData, setBusinessData] = useState({
    customers: [],
    products: [],
    invoices: [],
    tasks: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, invoicesRes] = await Promise.all([
          businessAPI.getProducts(),
          businessAPI.getInvoices(),
        ]);

        setBusinessData({
          customers: [],
          products: productsRes.data || [],
          invoices: invoicesRes.data || [],
          tasks: [],
        });
      } catch (error) {
        console.error("Failed to load business data", error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  const generateInsights = () => {
    setLoading(true);

    const { customers, products, invoices, tasks } = businessData;

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.amount || invoice.total || 0),
      0
    );

    const lowStockProducts = products.filter(
      (product) =>
        Number(product.stock || product.stock_quantity || 0) <=
        Number(product.low_stock_threshold || 10)
    );

    const generatedInsight = `
## AI Business Insights

### 1. Sales Performance Analysis
- Total recorded revenue is **$${totalRevenue.toLocaleString()}**.
- Total invoices recorded: **${invoices.length}**.
- Regular invoice tracking can improve cash flow and reduce unpaid balances.

### 2. Inventory Recommendations
- Total products: **${products.length}**.
- Low stock products: **${lowStockProducts.length}**.
- Reorder low-stock items before they affect sales.

### 3. Customer Insights
- Total customers: **${customers.length}**.
- Customer data should be used to identify repeat buyers and high-value clients.

### 4. Operational Efficiency
- Total tasks: **${tasks.length}**.
- Tasks should be grouped by priority: urgent, high, medium, and low.

### 5. Strategic Recommendations
- Review sales reports weekly.
- Track stock levels daily.
- Follow up on unpaid invoices.
- Add customer segmentation.
- Use monthly reports for business planning.
`;

    setTimeout(() => {
      setInsights(generatedInsight);
      setLoading(false);
    }, 800);
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { customers, products, invoices } = businessData;

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || invoice.total || 0),
    0
  );

  const hasData =
    customers.length > 0 || products.length > 0 || invoices.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Insights</h1>
          <p className="text-slate-500 mt-1">
            AI-powered analysis of your business data
          </p>
        </div>

        <Button
          onClick={generateInsights}
          disabled={loading || !hasData}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Customers</p>
            <p className="text-lg font-bold">{customers.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Revenue</p>
            <p className="text-lg font-bold">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Products</p>
            <p className="text-lg font-bold">{products.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Invoices</p>
            <p className="text-lg font-bold">{invoices.length}</p>
          </div>
        </div>
      </div>

      {!hasData && !insights && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Add business data first
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Add customers, products, and invoices to get AI-powered insights and
            recommendations.
          </p>
        </div>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-12 text-center"
        >
          <Brain className="w-16 h-16 text-violet-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-violet-800 mb-2">
            Analyzing your business data...
          </h3>
          <p className="text-sm text-violet-500">
            SmartBiz AI is generating local demo insights.
          </p>
        </motion.div>
      )}

      {insights && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              AI Analysis & Recommendations
            </h3>
          </div>

          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {hasData && !insights && !loading && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-12 text-center">
          <Brain className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-violet-800 mb-2">
            Ready to analyze your business
          </h3>
          <p className="text-sm text-violet-500 max-w-md mx-auto mb-6">
            Click Generate Insights to get a local AI-style business analysis.
          </p>

          <Button
            onClick={generateInsights}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      )}
    </div>
  );
}