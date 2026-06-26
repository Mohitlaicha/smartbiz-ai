import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Plus, Search, Eye, Trash2, ShoppingCart, Receipt, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import moment from "moment";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewSale, setViewSale] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    customer_id: "", customer_name: "", payment_method: "cash", notes: "",
    items: [{ product_id: "", product_name: "", quantity: 1, unit_price: 0, subtotal: 0 }]
  });

const load = async () => {
  try {
    setLoading(true);

    const [salesRes, customersRes, productsRes] = await Promise.all([
      api.get("/sales"),
      api.get("/customers"),
      api.get("/products"),
    ]);

    setSales(salesRes.data);
    setCustomers(customersRes.data);
    setProducts(productsRes.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({
      customer_id: "", customer_name: "", payment_method: "cash", notes: "",
      items: [{ product_id: "", product_name: "", quantity: 1, unit_price: 0, subtotal: 0 }]
    });
    setDialogOpen(true);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    if (field === "product_id") {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].unit_price = product.price;
        newItems[index].subtotal = product.price * newItems[index].quantity;
      }
    }
    if (field === "quantity") {
      newItems[index].subtotal = newItems[index].unit_price * Number(value);
    }
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: "", product_name: "", quantity: 1, unit_price: 0, subtotal: 0 }] });
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const totalAmount = form.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleSave = async () => {
    if (!form.customer_name.trim() || form.items.some(i => !i.product_id)) return;
    setSaving(true);
    try {
      // const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      const response = await api.post("/sales", {
  ...form,
  total_amount: totalAmount,
});

const sale = response.data;

      // Deduct inventory
      for (const item of form.items) {
        const product = products.find(p => p._id === item.product_id);
        if (product) {
          await api.put(`/products/${product._id}`, {
    stock_quantity:
      Math.max(0, (product.stock_quantity || 0) - item.quantity),
});
        }
      }

      // Update customer spending
      if (form.customer_id) {
        const customer = customers.find(c => c._id === form.customer_id);
        if (customer) {
          await api.put(`/customers/${customer._id}`, {
    total_spent:
      (customer.total_spent || 0) + totalAmount,
});
        }
      }

      

      setDialogOpen(false);
      load();
      toast({ title: "Sale recorded successfully" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!confirm("Delete this sale?")) return;
    await api.delete(`/sales/${s._id}`);
   load();
    toast({ title: "Sale deleted" });
  };

  const totalRevenue = sales.filter(s => s.status === "completed").reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const filtered = sales.filter(s => s.customer_name?.toLowerCase().includes(search.toLowerCase()) || s.invoice_number?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales</h1>
          <p className="text-slate-500 mt-1">{sales.length} transactions · ${totalRevenue.toLocaleString()} revenue</p>
        </div>
        <Button onClick={openNew} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" /> New Sale
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search by customer or invoice..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Sales List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">No sales yet</p>
          <p className="text-sm mt-1">Record your first sale</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Invoice</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">Payment</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Amount</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-mono font-medium text-violet-600">{s.invoice_number || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{s.customer_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">{moment(s.createdAt).format("MMM D, YYYY")}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 capitalize hidden sm:table-cell">{s.payment_method?.replace("_", " ")}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 text-right">${s.total_amount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewSale(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Sale Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Sale</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Customer *</Label>
              <Select value={form.customer_id} onValueChange={(v) => {
                const c = customers.find(c => c._id === v);
                setForm({ ...form, customer_id: v, customer_name: c?.name || "" });
              }}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <Label>Items</Label>
              <div className="space-y-3 mt-2">
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={item.product_id} onValueChange={(v) => updateItem(i, "product_id", v)}>
                        <SelectTrigger className="text-sm"><SelectValue placeholder="Product" /></SelectTrigger>
                        <SelectContent>{products.filter(p => p.status === "active").map(p => <SelectItem key={p._id} value={p._id}>{p.name} (${p.price})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} className="text-sm" />
                    </div>
                    <div className="w-24 text-right">
                      <p className="text-sm font-medium py-2">${item.subtotal?.toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeItem(i)} className="p-2 text-slate-400 hover:text-red-500"><Minus className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addItem} className="mt-2 text-xs">+ Add Item</Button>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center">
              <span className="font-medium text-slate-700">Total</span>
              <span className="text-2xl font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
            </div>

            <Button onClick={handleSave} disabled={saving || !form.customer_name || form.items.some(i => !i.product_id)} className="w-full bg-violet-600 hover:bg-violet-700">
              {saving ? "Processing..." : "Complete Sale"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Sale Dialog */}
      <Dialog open={!!viewSale} onOpenChange={() => setViewSale(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-violet-600" />Invoice {viewSale?.invoice_number}</DialogTitle></DialogHeader>
          {viewSale && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-400 text-xs">Customer</p><p className="font-medium">{viewSale.customer_name}</p></div>
                <div><p className="text-slate-400 text-xs">Date</p><p className="font-medium">{moment(viewSale.createdAt).format("MMM D, YYYY")}</p></div>
                <div><p className="text-slate-400 text-xs">Payment</p><p className="font-medium capitalize">{viewSale.payment_method?.replace("_", " ")}</p></div>
                <div><p className="text-slate-400 text-xs">Status</p><p className="font-medium capitalize">{viewSale.status}</p></div>
              </div>
              {viewSale.items?.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">Items</p>
                  {viewSale.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">${item.subtotal?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-violet-600">${viewSale.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}