// src/app/dashboard/recent/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { AccountCard } from "@/components/cards/AccountCard";
import { AccountCard as AccountCardType } from "@/types";

export default function RecentPage() {
  const [cards, setCards] = useState<AccountCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((j) => {
        const sorted = (j.data as AccountCardType[])
          .filter((c) => c.lastOpenedAt)
          .sort((a, b) => new Date(b.lastOpenedAt!).getTime() - new Date(a.lastOpenedAt!).getTime())
          .slice(0, 20);
        setCards(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  async function deleteCard(id: string) {
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-2">
        <Clock size={18} className="text-blue-400" />
        <h1 className="font-semibold text-foreground text-sm">Recently Used</h1>
      </header>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-24">
            <Clock size={32} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No cards opened yet. Open a card to track usage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
              <AccountCard
                key={card.id}
                card={card}
                onEdit={() => {}}
                onDelete={deleteCard}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
