// src/app/dashboard/audit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Shield, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Log {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
  user: { name?: string; email: string };
}

const ACTION_COLORS: Record<string, string> = {
  CARD_CREATED: "text-green-400",
  CARD_UPDATED: "text-blue-400",
  CARD_DELETED: "text-red-400",
  CREDENTIAL_VIEWED: "text-yellow-400",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/audit?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((j) => {
        setLogs(j.data.logs);
        setTotal(j.data.total);
        setPages(j.data.pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-2">
        <Shield size={18} className="text-primary" />
        <h1 className="font-semibold text-foreground text-sm">Audit Logs</h1>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-auto">
          {total} events
        </span>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">IP</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs ${ACTION_COLORS[log.action] || "text-foreground"}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {log.user.name || log.user.email}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                        {log.ipAddress || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Page {page} of {pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 flex items-center gap-1"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
