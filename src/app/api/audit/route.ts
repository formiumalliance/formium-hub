// src/app/api/audit/route.ts
// GET /api/audit - Returns audit logs (admin only)

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAdmin, rateLimit, getRateLimitKey } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!rateLimit(getRateLimitKey(req, "audit"), 30)) {
    return err("Too many requests", 429);
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.count(),
  ]);

  return ok({ logs, total, page, limit, pages: Math.ceil(total / limit) });
}
