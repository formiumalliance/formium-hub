// src/app/api/stats/route.ts
// GET /api/stats - Returns dashboard statistics

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth, rateLimit, getRateLimitKey } from "@/lib/api";
import { Category } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!rateLimit(getRateLimitKey(req, "stats"), 60)) {
    return err("Too many requests", 429);
  }

  const userId = session!.user.id;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalCards, favorites, recentlyOpened, allCards] = await Promise.all([
    prisma.accountCard.count({ where: { createdById: userId } }),
    prisma.accountCard.count({ where: { createdById: userId, isFavorite: true } }),
    prisma.accountCard.count({
      where: { createdById: userId, lastOpenedAt: { gte: oneDayAgo } },
    }),
    prisma.accountCard.findMany({
      where: { createdById: userId },
      select: { category: true },
    }),
  ]);

  const categoryCounts: Partial<Record<Category, number>> = {};
  for (const card of allCards) {
    categoryCounts[card.category] = (categoryCounts[card.category] || 0) + 1;
  }

  return ok({ totalCards, favorites, recentlyOpened, categoryCounts });
}
