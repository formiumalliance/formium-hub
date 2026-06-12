// src/app/dashboard/stats/page.tsx
"use client";

import { BarChart2, Loader2, Layers, Star, Clock } from "lucide-react";
import { useStats } from "@/hooks/useCards";
import { CATEGORY_LABELS, CATEGORY_COLORS, Category } from "@/types";
import { cn } from "@/lib/utils";

export default function StatsPage() {
  const { stats, loading } = useStats();

  return (
    <div>
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-2">
        <BarChart2 size={18} className="text-primary" />
        <h1 className="font-semibold text-foreground text-sm">Statistics</h1>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : !stats ? (
          <p className="text-muted-foreground text-sm">No data available.</p>
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Layers} label="Total Cards" value={stats.totalCards} color="text-primary" bg="bg-primary/10" />
              <StatCard icon={Star} label="Favorites" value={stats.favorites} color="text-yellow-400" bg="bg-yellow-500/10" />
              <StatCard icon={Clock} label="Used Today" value={stats.recentlyOpened} color="text-blue-400" bg="bg-blue-500/10" />
            </div>

            {/* By category */}
            <div>
              <h2 className="text-sm font-medium text-foreground mb-3">By Category</h2>
              <div className="space-y-2">
                {Object.entries(stats.categoryCounts).map(([cat, count]) => {
                  const pct = stats.totalCards > 0 ? Math.round((count / stats.totalCards) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded border w-28 text-center",
                          CATEGORY_COLORS[cat as Category]
                        )}
                      >
                        {CATEGORY_LABELS[cat as Category] || cat}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
