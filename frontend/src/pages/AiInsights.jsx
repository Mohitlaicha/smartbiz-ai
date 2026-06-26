import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, TrendingUp, ShoppingCart, Package, Users, Lightbulb, RefreshCw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function AiInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customers, products, sales, tasks] = await Promise.all([
          base44.entities.Customer.list(),
          base44.entities.Product.list(),
          base44.entities.Sale.list("-created_date", 50),
          base44.entities.Task.list(),
        ]);
        setBusinessData({ customers, products, sales, tasks });
      } finally { setDataLoading(false); }
    };
    loadData();
  }, []);

  const generateInsights = async () => {
    if (!businessData) return;
    setLoading(true);
    try {
      const { customers, products, sales, tasks } = businessData;
      const totalRevenue = sales.filter(s => s.status === "completed").reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
      const completedTasks = tasks.filter(t => t.status === "completed");
      const vipCustomers = customers.filter(c => c.segment === "vip");

      const prompt = `You are a business analyst AI assistant for an SME management platform called SmartBiz AI.

Analyze the following business data and provide actionable insights and recommendations.

BUSINESS SUMMARY:
- Total Customers: ${customers.length} (VIP: ${vipCustomers.length}, Active: ${customers.filter(c => c.segment === "active").length}, Leads: ${customers.filter(c => c.segment === "lead").length})
- Total Products: ${products.length} (Low Stock: ${lowStockProducts.length}, Out of Stock: ${products.filter(p => p.stock_quantity === 0).length})
- Total Sales: ${sales.length} (Revenue: $${totalRevenue.toLocaleString()})
- Tasks: ${tasks.length} total, ${completedTasks.length} completed, ${tasks.filter(t => t.status === "in_progress").length} in progress

TOP PRODUCTS BY SALES (if available):
${sales.flatMap(s => s.items || []).reduce((acc, item) => {
  const existing = acc.find(a => a.name === item.product_name);
  if (existing) { existing.quantity += item.quantity; existing.revenue += item.subtotal; }
  else acc.push({ name: item.product_name, quantity: item.quantity, revenue: item.subtotal });
  return acc;
}, []).sort((a, b) => b.revenue - a.revenue).slice(0, 5).map(p => `- ${p.name}: ${p.quantity} units, $${p.revenue?.toFixed(2)} revenue`).join("\n") || "No sales data available"}

LOW STOCK PRODUCTS:
${lowStockProducts.map(p => `- ${p.name}: ${p.stock_quantity} remaining (threshold: ${p.low_stock_threshold})`).join("\n") || "No low stock alerts"}

Please provide:
1. **Sales Performance Analysis** - Key trends and observations
2. **Inventory Recommendations** - Reorder suggestions and optimization
3. **Customer Insights** - Segmentation analysis and growth opportunities
4. **Operational Efficiency** - Task completion and productivity observations
5. **Strategic Recommendations** - 3-5 actionable recommendations for business growth

Format with clear markdown headings and bullet points. Be specific and data-driven in your analysis.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setInsights(result);
    } finally { setLoading(false); }
  };

  if (dataLoading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" /></div>;
  }

  const { customers = [], products = [], sales = [], tasks = [] } = businessData || {};
  const totalRevenue = sales.filter(s => s.status === "completed").reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const hasData = customers.length > 0 || products.length > 0 || sales.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Insights</h1>
          <p className="text-slate-500 mt-1">AI-powered analysis of your business data</p>
        </div>
        <Button onClick={generateInsights} disabled={loading || !hasData} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
          {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Brain className="w-4 h-4 mr-2" /> Generate Insights</>}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xs text-slate-500">Customers</p><p className="text-lg font-bold">{customers.length}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs text-slate-500">Revenue</p><p className="text-lg font-bold">${totalRevenue.toLocaleString()}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center"><Package className="w-5 h-5 text-violet-600" /></div>
          <div><p className="text-xs text-slate-500">Products</p><p className="text-lg font-bold">{products.length}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-xs text-slate-500">Sales Count</p><p className="text-lg font-bold">{sales.length}</p></div>
        </div>
      </div>

      {/* No Data State */}
      {!hasData && !insights && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Add business data first</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">Add customers, products, and record some sales to get AI-powered insights and recommendations for your business.</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
            <Brain className="w-8 h-8 text-violet-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-violet-800 mb-2">Analyzing your business data...</h3>
          <p className="text-sm text-violet-500">Our AI is crunching the numbers and generating personalized insights</p>
        </motion.div>
      )}

      {/* Insights Result */}
      {insights && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">AI Analysis & Recommendations</h3>
          </div>
          <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-800">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* Initial CTA */}
      {hasData && !insights && !loading && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-12 text-center">
          <Brain className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-violet-800 mb-2">Ready to analyze your business</h3>
          <p className="text-sm text-violet-500 max-w-md mx-auto mb-6">Click "Generate Insights" to get AI-powered analysis of your sales trends, inventory optimization, customer segmentation, and strategic recommendations.</p>
          <Button onClick={generateInsights} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
            <Brain className="w-4 h-4 mr-2" /> Generate Insights
          </Button>
        </div>
      )}
    </div>
  );
}