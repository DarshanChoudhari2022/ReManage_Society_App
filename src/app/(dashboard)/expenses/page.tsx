"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Wallet, Download, RefreshCcw, Paperclip, ShieldCheck, ShieldAlert, Eye, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ExpenseType } from "@/types";
import { useLiveData } from "@/lib/use-live-data";
import { EXPENSE_CATEGORY_GROUPS, expenseCategoryLabel } from "@/lib/finance-categories";

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "maintenance",
    paidTo: "",
    paidOn: new Date().toISOString().split("T")[0],
    notes: "",
    billProofDataUrl: "",
    billProofFileName: "",
    billProofFileType: "",
  });

  // Optimized Live Data Loading
  const { 
    data, 
    loading, 
    refetch,
    isStale 
  } = useLiveData<{ expenses: ExpenseType[], total: number }>({
    url: "/api/expenses",
    interval: 60_000, // Refresh every minute
  });

  const expenses = data?.expenses || [];
  const total = data?.total || 0;
  const missingProofCount = expenses.filter((expense) => !expense.billProofDataUrl).length;
  const unverifiedProofCount = expenses.filter((expense) => expense.billProofDataUrl && !expense.billProofVerifiedAt).length;
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const resetForm = () => {
    setForm({
      title: "",
      amount: "",
      category: "maintenance",
      paidTo: "",
      paidOn: new Date().toISOString().split("T")[0],
      notes: "",
      billProofDataUrl: "",
      billProofFileName: "",
      billProofFileType: "",
    });
  };

  const handleProofFile = (file: File | null) => {
    if (!file) {
      setForm((current) => ({ ...current, billProofDataUrl: "", billProofFileName: "", billProofFileType: "" }));
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Upload JPG, PNG, WebP, or PDF bill only");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Bill proof must be under 3 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        billProofDataUrl: String(reader.result || ""),
        billProofFileName: file.name,
        billProofFileType: file.type,
      }));
    };
    reader.onerror = () => toast.error("Could not read bill proof");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Expense added");
        setShowForm(false);
        resetForm();
        refetch();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add expense");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const verifyProof = async (expenseId: string, shouldVerify: boolean) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId, action: shouldVerify ? "verify_proof" : "unverify_proof" }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Could not update proof status");
        return;
      }
      toast.success(shouldVerify ? "Bill proof verified" : "Bill proof marked unverified");
      refetch();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const categoryColors: Record<string, string> = {
    maintenance: "bg-blue-100 text-blue-700",
    repairs: "bg-orange-100 text-orange-700",
    security_salary: "bg-purple-100 text-purple-700",
    housekeeping_salary: "bg-purple-100 text-purple-700",
    manager_salary: "bg-purple-100 text-purple-700",
    electricity_common_area: "bg-green-100 text-green-700",
    water_bill: "bg-cyan-100 text-cyan-700",
    other: "bg-gray-100 text-gray-700",
  };

  const exportCsv = async () => {
    try {
      const headers = ["Description", "Amount", "Category", "Paid To", "Paid On", "Proof", "Proof Verified", "Notes"];
      const csvContent = [
        headers.join(","),
        ...expenses.map((e: ExpenseType) => 
          [
            e.title,
            e.amount,
            e.category,
            e.paidTo || "",
            new Date(e.paidOn).toISOString().split('T')[0],
            e.billProofFileName || "Missing",
            e.billProofVerifiedAt ? `Verified by ${e.billProofVerifiedBy || "finance"}` : "Not verified",
            e.notes || "",
          ].map(v => `"${v}"`).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success("Export successful");
    } catch { toast.error("Failed to export"); }
  };

  return (
    <div className={isStale ? "opacity-90 transition-opacity" : "transition-opacity"}>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-primary" />
          <div>
            <h1 className="page-title flex items-center gap-2">
               Expenses
               {loading && !data && <div className="spinner !w-4 !h-4" />}
               {isStale && <RefreshCcw className="w-4 h-4 text-primary animate-spin" />}
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Total: {formatCurrency(total)} this month
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportCsv} className="btn btn-secondary btn-sm"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Add Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="card !p-4 border-l-4 border-l-primary">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Finance Control</p>
          <p className="text-sm font-semibold text-text-primary mt-1">Attach vendor bill proofs with every expense.</p>
        </div>
        <div className={`card !p-4 border-l-4 ${missingProofCount ? "border-l-warning" : "border-l-success"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Missing Proof</p>
          <p className="text-2xl font-black text-text-primary mt-1">{missingProofCount}</p>
        </div>
        <div className={`card !p-4 border-l-4 ${unverifiedProofCount ? "border-l-warning" : "border-l-success"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Pending Verification</p>
          <p className="text-2xl font-black text-text-primary mt-1">{unverifiedProofCount}</p>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content !max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="label">Description *</label><input className="input" placeholder="e.g. Lift AMC" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label">Amount *</label><input type="number" className="input" placeholder="₹" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div>
                  <label className="label">Category *</label>
                  <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {EXPENSE_CATEGORY_GROUPS.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.categories.map(([id, label]) => (
                          <option key={id} value={id}>{label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
              <div><label className="label">Paid To / Vendor</label><input className="input" placeholder="e.g. ABC Elevator Services" value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} /></div>
              <div><label className="label">Date *</label><input type="date" className="input" value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} required /></div>
              <div><label className="label">Notes / Reference</label><input className="input" placeholder="Invoice no, approval note, payment reference" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-4">
                <label className="label flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  Vendor Bill / Receipt Proof
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="input mt-2"
                  onChange={(e) => handleProofFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-text-secondary mt-2">
                  Upload the carpenter/electrician/vendor bill so the amount can be verified later. JPG, PNG, WebP, or PDF up to 3 MB.
                </p>
                {form.billProofFileName && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{form.billProofFileName}</p>
                      <p className="text-[10px] text-text-secondary">{form.billProofFileType}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleProofFile(null)}
                      className="rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-danger"
                      title="Remove proof"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? <div className="spinner !w-4 !h-4 !border-white/30 !border-t-white" /> : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <div key={category} className="stat-card !p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{expenseCategoryLabel(category)}</p>
              <p className="text-sm font-black text-text-primary mt-1">{formatCurrency(amount)}</p>
            </div>
          ))}
        </div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : expenses.length === 0 ? (
        <div className="card text-center py-12 text-text-secondary">No records found.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Paid To</th>
                <th>Category</th>
                <th>Bill Proof</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="text-text-secondary">{formatDate(e.paidOn)}</td>
                  <td>
                    <p className="font-medium">{e.title}</p>
                    {e.notes && <p className="text-[10px] text-text-secondary mt-0.5">{e.notes}</p>}
                  </td>
                  <td className="text-text-secondary">{e.paidTo || "—"}</td>
                  <td><span className={`badge text-xs ${categoryColors[e.category] || categoryColors.other}`}>{expenseCategoryLabel(e.category)}</span></td>
                  <td>
                    {e.billProofDataUrl ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={e.billProofDataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm !py-1 !px-2 text-xs"
                          title={e.billProofFileName || "View bill proof"}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </a>
                        {e.billProofVerifiedAt ? (
                          <button
                            type="button"
                            onClick={() => verifyProof(e.id, false)}
                            className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-1 text-[10px] font-black text-success"
                            title={`Verified by ${e.billProofVerifiedBy || "finance"}`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => verifyProof(e.id, true)}
                            className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-1 text-[10px] font-black text-warning-text"
                          >
                            <ShieldAlert className="h-3 w-3" />
                            Verify
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-1 text-[10px] font-black text-danger">
                        <ShieldAlert className="h-3 w-3" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="text-right font-medium">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
