// src/hooks/useCards.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { AccountCard, Category } from "@/types";

interface UseCardsOptions {
  search?: string;
  category?: Category | "";
  favorites?: boolean;
}

export function useCards(options: UseCardsOptions = {}) {
  const [cards, setCards] = useState<AccountCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.search) params.set("q", options.search);
      if (options.category) params.set("category", options.category);
      if (options.favorites) params.set("favorites", "true");

      const res = await fetch(`/api/cards?${params}`);
      if (!res.ok) throw new Error("Failed to load cards");
      const json = await res.json();
      setCards(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [options.search, options.category, options.favorites]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const createCard = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Failed to create card");
    }
    await fetchCards();
    return res.json();
  };

  const updateCard = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Failed to update card");
    }
    await fetchCards();
    return res.json();
  };

  const deleteCard = async (id: string) => {
    const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete card");
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return { cards, loading, error, refetch: fetchCards, createCard, updateCard, deleteCard };
}

export function useStats() {
  const [stats, setStats] = useState<{
    totalCards: number;
    favorites: number;
    recentlyOpened: number;
    categoryCounts: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => setStats(j.data))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
