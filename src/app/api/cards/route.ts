// src/app/api/cards/route.ts
// GET /api/cards - List all cards (with search & filter)
// POST /api/cards - Create a new card

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { ok, err, requireAuth, rateLimit, getRateLimitKey, logAudit } from "@/lib/api";
import { Category } from "@prisma/client";

const createCardSchema = z.object({
  title: z.string().min(1).max(100),
  category: z.nativeEnum(Category),
  websiteUrl: z.string().url(),
  username: z.string().optional(),
  password: z.string().optional(),
  notes: z.string().optional(),
  iconUrl: z.string().url().optional().or(z.literal("")),
  isFavorite: z.boolean().optional().default(false),
});

// GET /api/cards
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Rate limit: 120 req/min
  if (!rateLimit(getRateLimitKey(req, "cards:get"), 120)) {
    return err("Too many requests", 429);
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category") as Category | null;
  const favorites = searchParams.get("favorites") === "true";

  const where: Record<string, unknown> = {
    createdById: session!.user.id,
  };

  if (category && Object.values(Category).includes(category)) {
    where.category = category;
  }

  if (favorites) {
    where.isFavorite = true;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { websiteUrl: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  const cards = await prisma.accountCard.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      websiteUrl: true,
      username: true,
      notes: true,
      iconUrl: true,
      isFavorite: true,
      lastOpenedAt: true,
      openCount: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      // Never return encryptedPassword
    },
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
  });

  return ok(cards);
}

// POST /api/cards
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!rateLimit(getRateLimitKey(req, "cards:post"), 30)) {
    return err("Too many requests", 429);
  }

  const body = await req.json();
  const parsed = createCardSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors[0]?.message || "Invalid input", 422);
  }

  const { password, iconUrl, ...rest } = parsed.data;

  const card = await prisma.accountCard.create({
    data: {
      ...rest,
      iconUrl: iconUrl || null,
      encryptedPassword: password ? encrypt(password) : null,
      createdById: session!.user.id,
    },
    select: {
      id: true,
      title: true,
      category: true,
      websiteUrl: true,
      username: true,
      notes: true,
      iconUrl: true,
      isFavorite: true,
      lastOpenedAt: true,
      openCount: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
    },
  });

  await logAudit(session!.user.id, "CARD_CREATED", "account_card", card.id, { title: card.title }, req);

  return ok(card, 201);
}
