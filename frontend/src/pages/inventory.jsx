import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CATEGORIES = ['electronics', 'clothing', 'food', 'office', 'software', 'furniture', 'tools', 'other'];

const categoryColors = {
  electronics: 'bg-primary/10 text-primary',
  clothing: 'bg-accent/10 text-accent',
  food: 'bg-success/10 text-success',
  office: 'bg-warning/10 text-warning',
  software: 'bg-chart-2/10 text-chart-2',
  furniture: 'bg-chart-4/10 text-chart-4',
  tools: 'bg-destructive/10 text-destructive',
  other: 'bg-muted text-muted-foreground',
};

const initialForm = { name: '', category: 'other', quantity: '', low_stock_threshold: '10', price: '', cost: '', supplier: '', sku: '', description: '' };

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const closeDialog = () => { setDialogOpen(false); setEditingProduct(null); setForm(initialForm); };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name, category: p.category || 'other',
      quantity: String(p.quantity ?? ''), low_stock_threshold: String(p.low_stock_threshold ?? '10'),
      price: String(p.price ?? ''), cost: String(p.cost ?? ''),
      supplier: p.supplier || '', sku: p.sku || '', description: p.description || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      quantity: parseFloat(form.quantity),
      low_stock_threshold: parseFloat(form.low_stock_threshold),
      price: parseFloat(form.price),
      cost: form.cost ? parseFloat(form.cost) : undefined,
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLowStock = (p) => p.quantity <= (p.low_stock_threshold ?? 10);
  const lowStockCount = products.filter(isLowStock).length;

  const filtered = products
    .filter(p => stockFilter === 'low_stock' ? isLowStock(p) : true)
    .filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} products · ${lowStockCount} low stock`}
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        }
      />

      {lowStockCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{lowStockCount} product{lowStockCount > 1 ? 's are' : ' is'} running low on stock and need restocking.</span>
        </motion.div>
      )}

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products, SKU, supplier…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Tabs value={stockFilter} onValueChange={setStockFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="low_stock" className="gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>


        {filtered.length === 0 && !isLoading ? (
          <EmptyState icon={Package} title="No products found" description="Add your first product to start tracking inventory"
            action={<Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>} />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((product) => {
                const low = isLowStock(product);
                return (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={cn("p-4 rounded-xl border transition-all",
                      low ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10" : "border-border/50 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", categoryColors[product.category] || categoryColors.other)}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="font-medium break-words">{product.name}</p>
                        {product.description && <p className="text-xs text-muted-foreground break-words">{product.description}</p>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(product)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(product.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2 pl-[52px]">
                      <Badge variant="secondary" className={cn("text-xs capitalize", categoryColors[product.category])}>{product.category}</Badge>
                      <div className="flex items-center gap-1 text-xs">
                        {low && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                        <span className={cn("font-medium", low ? "text-destructive" : "text-muted-foreground")}>Qty: {product.quantity}</span>
                      </div>
                      <span className="text-sm font-semibold">${product.price?.toLocaleString()}</span>
                      {product.supplier && <span className="text-xs text-muted-foreground">{product.supplier}</span>}
                      {product.sku && <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Product Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. PROD-001" /></div>
              <div><Label>Quantity *</Label><Input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
              <div><Label>Low Stock Alert</Label><Input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} /></div>
              <div><Label>Selling Price *</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div><Label>Cost Price</Label><Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
              <div className="col-span-2"><Label>Supplier</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
              <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editingProduct ? 'Update' : 'Add Product'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}