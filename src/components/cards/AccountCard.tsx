// src/components/cards/AccountCard.tsx
"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Trash2, Star, Clock } from "lucide-react";
import { AccountCard as AccountCardType, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";
import { cn, getFaviconUrl, formatRelative, openCardUrl } from "@/lib/utils";

interface AccountCardProps {
  card: AccountCardType;
  onEdit: (card: AccountCardType) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ card, onEdit, onDelete }: AccountCardProps) {
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const faviconUrl = getFaviconUrl(card.websiteUrl, card.iconUrl);
  const categoryColor = CATEGORY_COLORS[card.category];

  async function handleDelete() {
    if (!confirm(`Delete "${card.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await onDelete(card.id);
    } finally {
      setDeleting(false);
    }
  }

  function handleOpen() {
    openCardUrl(card.websiteUrl, card.id);
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden",
        "hover:border-border/80 card-glow transition-all duration-200"
      )}
    >
      {/* Favorite indicator */}
      {card.isFavorite && (
        <div className="absolute top-3 right-3 z-10">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
        </div>
      )}

      {/* Card body */}
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
          {!imgError ? (
            <img
              src={faviconUrl}
              alt={card.title}
              width={24}
              height={24}
              onError={() => setImgError(true)}
              className="w-6 h-6 object-contain"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {card.title[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">{card.title}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{card.websiteUrl}</p>
          {card.username && (
            <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{card.username}</p>
          )}
        </div>
      </div>

      {/* Category badge */}
      <div className="px-4 pb-3">
        <span
          className={cn(
            "inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md border",
            categoryColor
          )}
        >
          {CATEGORY_LABELS[card.category]}
        </span>
      </div>

      {/* Last opened */}
      {card.lastOpenedAt && (
        <div className="px-4 pb-3 flex items-center gap-1 text-[10px] text-muted-foreground/60">
          <Clock size={10} />
          {formatRelative(card.lastOpenedAt)}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border mx-0" />

      {/* Actions */}
      <div className="flex items-center gap-1 p-2">
        <button
          onClick={handleOpen}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
        >
          <ExternalLink size={12} />
          Open
        </button>
        <button
          onClick={() => onEdit(card)}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          aria-label="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
