// src/components/cards/StatsBar.tsx
import { Layers, Star, Clock } from "lucide-react";

interface StatsBarProps {
  stats: {
    totalCards: number;
    favorites: number;
    recentlyOpened: number;
    categoryCounts: Record<string, number>;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex items-center gap-6 px-6 py-3 border-b border-border bg-muted/30">
      <Stat icon={Layers} label="Total" value={stats.totalCards} />
      <Stat icon={Star} label="Favorites" value={stats.favorites} color="text-yellow-400" />
      <Stat icon={Clock} label="Used today" value={stats.recentlyOpened} color="text-blue-400" />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className={color || "text-muted-foreground"} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
