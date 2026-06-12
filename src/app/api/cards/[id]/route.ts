// src/app/api/cards/[id]/route.ts
// GET /api/cards/:id
// PUT /api/cards/:id
// DELETE /api/cards/:id

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { ok, err, requireAuth, logAudit } from "@/lib/api";
import { Category } from "@prisma/client";

const updateCardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  category: z.nativeEnum(Category).optional(),
  websiteUrl: z.string().url().optional(),
  username: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  iconUrl: z.string().url().optional().nullable().or(z.literal("")),
  isFavorite: z.boolean().optional(),
});

async function getCard(id: string, userId: string) {
  return prisma.accountCard.findFirst({
    where: { id, createdById: userId },
  });
}

// GET /api/cards/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const card = await getCard(id, session!.user.id);
  if (!card) return err("Card not found", 404);

  // Update last opened
  await prisma.accountCard.update({
    where: { id },
    data: { lastOpenedAt: new Date(), openCount: { increment: 1 } },
  });

  return ok({
    id: card.id,
    title: card.title,
    category: card.category,
    websiteUrl: card.websiteUrl,
    username: card.username,
    notes: card.notes,
    iconUrl: card.iconUrl,
    isFavorite: card.isFavorite,
    lastOpenedAt: card.lastOpenedAt,
    openCount: card.openCount,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    createdById: card.createdById,
  });
}

// PUT /api/cards/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await getCard(id, session!.user.id);
  if (!existing) return err("Card not found", 404);

  const body = await req.json();
  const parsed = updateCardSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors[0]?.message || "Invalid input", 422);
  }

  const { password, iconUrl, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };
  if (iconUrl !== undefined) updateData.iconUrl = iconUrl || null;
  if (password !== undefined) {
    updateData.encryptedPassword = password ? encrypt(password) : null;
  }

  const updated = await prisma.accountCard.update({
    where: { id },
    data: updateData,
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

  await logAudit(session!.user.id, "CARD_UPDATED", "account_card", id, { title: updated.title }, req);

  return ok(updated);
}

// DELETE /api/cards/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await getCard(id, session!.user.id);
  if (!existing) return err("Card not found", 404);

  await prisma.accountCard.delete({ where: { id } });
  await logAudit(session!.user.id, "CARD_DELETED", "account_card", id, { title: existing.title }, req);

  return ok({ deleted: true });
}
