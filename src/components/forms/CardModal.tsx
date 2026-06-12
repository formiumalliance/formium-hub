// src/components/forms/CardModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Eye, EyeOff, Globe, Loader2 } from "lucide-react";
import { AccountCard, AccountCardFormData, CATEGORIES, CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

interface CardModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AccountCardFormData) => Promise<void>;
  initialData?: AccountCard | null;
}

const defaultData: AccountCardFormData = {
  title: "",
  category: "OPERATIONS",
  websiteUrl: "",
  username: "",
  password: "",
  notes: "",
  iconUrl: "",
  isFavorite: false,
};

export function CardModal({ open, onClose, onSubmit, initialData }: CardModalProps) {
  const [form, setForm] = useState<AccountCardFormData>(defaultData);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              title: initialData.title,
              category: initialData.category,
              websiteUrl: initialData.websiteUrl,
              username: initialData.username || "",
              password: "", // never pre-fill password
              notes: initialData.notes || "",
              iconUrl: initialData.iconUrl || "",
              isFavorite: initialData.isFavorite,
            }
          : defaultData
      );
      setError(null);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, initialData]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const set = (key: keyof AccountCardFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {initialData ? "Edit Card" : "Add Card"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Title */}
          <Field label="Title" required>
            <input
              ref={firstInputRef}
              type="text"
              required
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. Instagram"
              className={inputCls}
            />
          </Field>

          {/* Category */}
          <Field label="Category" required>
            <select
              value={form.category}
              onChange={set("category")}
              className={inputCls}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </Field>

          {/* Website URL */}
          <Field label="Website URL" required>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                required
                value={form.websiteUrl}
                onChange={set("websiteUrl")}
                placeholder="https://example.com"
                className={cn(inputCls, "pl-8")}
              />
            </div>
          </Field>

          {/* Username */}
          <Field label="Username / Email">
            <input
              type="text"
              value={form.username}
              onChange={set("username")}
              placeholder="your@email.com"
              autoComplete="off"
              className={inputCls}
            />
          </Field>

          {/* Password */}
          <Field label={initialData ? "New Password (leave blank to keep current)" : "Password"}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder={initialData ? "Enter new password to change" : "Enter password"}
                autoComplete="new-password"
                className={cn(inputCls, "pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>

          {/* Icon URL */}
          <Field label="Icon URL (optional)">
            <input
              type="url"
              value={form.iconUrl}
              onChange={set("iconUrl")}
              placeholder="https://example.com/icon.png"
              className={inputCls}
            />
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this account..."
              rows={3}
              className={cn(inputCls, "resize-none")}
            />
          </Field>

          {/* Favorite */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isFavorite}
                onChange={(e) => setForm((prev) => ({ ...prev, isFavorite: e.target.checked }))}
                className="sr-only"
              />
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  form.isFavorite
                    ? "bg-primary border-primary"
                    : "border-border group-hover:border-primary/50"
                )}
              >
                {form.isFavorite && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-foreground">Mark as favorite</span>
          </label>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-9 px-4 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {initialData ? "Save changes" : "Add card"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all";
