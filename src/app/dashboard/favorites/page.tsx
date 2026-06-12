// src/app/dashboard/favorites/page.tsx
"use client";

import { useState } from "react";
import { Star, Plus } from "lucide-react";
import { AccountCard } from "@/components/cards/AccountCard";
import { CardModal } from "@/components/forms/CardModal";
import { useCards } from "@/hooks/useCards";
import { AccountCard as AccountCardType } from "@/types";
import { Loader2 } from "lucide-react";

export default function FavoritesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AccountCardType | null>(null);

  const { cards, loading, createCard, updateCard, deleteCard } = useCards({ favorites: true });

  async function handleSubmit(data: Record<string, unknown>) {
    if (editingCard) await updateCard(editingCard.id, data);
    else await createCard(data);
  }

  return (
    <div>
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-2">
        <Star size={18} className="text-yellow-400" />
        <h1 className="font-semibold text-foreground text-sm">Favorites</h1>
        {!loading && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {cards.length}
          </span>
        )}
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-24">
            <Star size={32} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No favorites yet. Star a card to add it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
              <AccountCard
                key={card.id}
                card={card}
                onEdit={(c) => { setEditingCard(c); setModalOpen(true); }}
                onDelete={deleteCard}
              />
            ))}
          </div>
        )}
      </div>

      <CardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingCard}
      />
    </div>
  );
}
