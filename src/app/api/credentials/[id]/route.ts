// src/app/api/credentials/[id]/route.ts
// GET /api/credentials/:id
// Returns decrypted credentials for a card.
// Requires authentication. Only ADMIN can access credentials.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { ok, err, requireAdmin, rateLimit, getRateLimitKey, logAudit } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  // Stricter rate limit for credential access: 20/min
  if (!rateLimit(getRateLimitKey(req, "creds"), 20)) {
    return err("Too many requests", 429);
  }

  const { id } = await params;

  // Validate the ?token= matches a session-bound extension token (optional layer)
  // For now we rely on server-side session validation

  const card = await prisma.accountCard.findFirst({
    where: {
      id,
      createdById: session!.user.id,
    },
    select: {
      id: true,
      username: true,
      encryptedPassword: true,
      websiteUrl: true,
      title: true,
    },
  });

  if (!card) return err("Card not found", 404);

  await logAudit(
    session!.user.id,
    "CREDENTIAL_VIEWED",
    "account_card",
    card.id,
    { title: card.title },
    req
  );

  return ok({
    id: card.id,
    username: card.username,
    password: card.encryptedPassword ? decrypt(card.encryptedPassword) : null,
    websiteUrl: card.websiteUrl,
  });
}
