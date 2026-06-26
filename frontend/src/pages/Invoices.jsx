import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { businessAPI } from "@/api/client";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground line-through",
};

const initialForm = {
  invoice_number: "",
  customer_name: "",
  amount: "",
  status: "draft",
  due_date: "",
  notes: "",
};

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [form, setForm] = useState(initialForm);

  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: businessAPI.getInvoices,
  });

  const invoices = response?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) =>
      businessAPI.createInvoice({
        ...data,
        amount: Number(data.amount || 0),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      businessAPI.updateInvoice(id, {
        ...data,
        amount: Number(data.amount || 0),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: businessAPI.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingInvoice(null);
    setForm(initialForm);
  };

  const openEdit = (invoice) => {
    setEditingInvoice(invoice);
    setForm({
      invoice_number: invoice.invoice_number || "",
      customer_name: invoice.customer_name || "",
      amount: String(invoice.amount || ""),
      status: invoice.status || "draft",
      due_date: invoice.due_date || "",
      notes: invoice.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingInvoice) {
      updateMutation.mutate({
        id: editingInvoice._id || editingInvoice.id,
        data: form,
      });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = invoices.filter(
    (invoice) =>
      invoice.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total invoices`}
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        }
      />

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filtered.length === 0 && !isLoading ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Create your first invoice"
            action={
              <Button onClick={() => setDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" /> New Invoice
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((invoice) => (
                <motion.div
                  key={invoice._id || invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="font-medium break-words">
                        {invoice.invoice_number}
                      </p>

                      <p className="text-xs text-muted-foreground break-words">
                        {invoice.customer_name}
                        {invoice.due_date &&
                          ` · Due ${format(
                            new Date(invoice.due_date),
                            "MMM d, yyyy"
                          )}`}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(invoice)}>
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            deleteMutation.mutate(invoice._id || invoice.id)
                          }
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pl-[52px]">
                    <span className="font-semibold text-sm">
                      ${Number(invoice.amount || 0).toLocaleString()}
                    </span>

                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs capitalize",
                        statusColors[invoice.status] || statusColors.draft
                      )}
                    >
                      {invoice.status || "draft"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Edit Invoice" : "New Invoice"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Invoice # *</Label>
              <Input
                value={form.invoice_number}
                onChange={(e) =>
                  setForm({ ...form, invoice_number: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Customer Name *</Label>
              <Input
                value={form.customer_name}
                onChange={(e) =>
                  setForm({ ...form, customer_name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({ ...form, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingInvoice ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}