// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, Filter, Loader2, LayoutGrid } from "lucide-react";
import { AccountCard } from "@/components/cards/AccountCard";
import { CardModal } from "@/components/forms/CardModal";
import { StatsBar } from "@/components/cards/StatsBar";
import { useCards, useStats } from "@/hooks/useCards";
import { AccountCard as AccountCardType, Category, CATEGORIES, CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AccountCardType | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { cards, loading, error, createCard, updateCard, deleteCard } = useCards({
    search: debouncedSearch,
    category,
  });

  const { stats } = useStats();

  function openAddModal() {
    setEditingCard(null);
    setModalOpen(true);
  }

  function openEditModal(card: AccountCardType) {
    setEditingCard(card);
    setModalOpen(true);
  }

  async function handleSubmit(data: Record<string, unknown>) {
    if (editingCard) {
      await updateCard(editingCard.id, data);
    } else {
      await createCard(data);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-6 py-3">
          <div className="flex items-center gap-2 mr-auto">
            <LayoutGrid size={18} className="text-muted-foreground" />
            <h1 className="font-semibold text-foreground text-sm">All Cards</h1>
            {!loading && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {cards.length}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards..."
              className="w-full h-8 pl-8 pr-8 rounded-lg border border-input bg-muted/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={openAddModal}
            className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            Add Card
          </button>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 px-6 py-2 overflow-x-auto scrollbar-thin">
          <Filter size={12} className="text-muted-foreground flex-shrink-0" />
          <CategoryPill
            label="All"
            active={category === ""}
            onClick={() => setCategory("")}
          />
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={category === cat}
              onClick={() => setCategory(cat === category ? "" : cat)}
            />
          ))}
        </div>
      </header>

      {/* Stats bar */}
      {stats && <StatsBar stats={stats} />}

      {/* Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
            >
              Reload page
            </button>
          </div>
        ) : cards.length === 0 ? (
          <EmptyState onAdd={openAddModal} hasFilters={!!search || !!category} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
              <AccountCard
                key={card.id}
                card={card}
                onEdit={openEditModal}
                onDelete={deleteCard}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card modal */}
      <CardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingCard}
      />
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({ onAdd, hasFilters }: { onAdd: () => void; hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <LayoutGrid size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">
        {hasFilters ? "No results found" : "No cards yet"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        {hasFilters
          ? "Try clearing your search or filters."
          : "Add your first card to get started."}
      </p>
      {!hasFilters && (
        <button
          onClick={onAdd}
          className="h-9 px-4 flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} />
          Add your first card
        </button>
      )}
    </div>
  );
}
