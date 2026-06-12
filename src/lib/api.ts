// src/lib/api.ts
// Shared API utilities: response helpers, auth guards, rate limiting, audit logging

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── Response Helpers ──────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// ─── Auth Guard ────────────────────────────────────────────────────────────────

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: err("Unauthorized", 401) };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: err("Unauthorized", 401) };
  }
  if (session.user.role !== "ADMIN") {
    return { session: null, error: err("Forbidden: Admin access required", 403) };
  }
  return { session, error: null };
}

// ─── Simple In-Memory Rate Limiter ────────────────────────────────────────────
// For production, replace with Redis-backed rate limiting

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= limit) return false; // blocked

  entry.count++;
  return true; // allowed
}

export function getRateLimitKey(req: NextRequest, prefix = "api"): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}

// ─── Audit Logger ─────────────────────────────────────────────────────────────

export async function logAudit(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
  req?: NextRequest
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        metadata,
        ipAddress:
          req?.headers.get("x-forwarded-for")?.split(",")[0] ||
          req?.headers.get("x-real-ip") ||
          null,
        userAgent: req?.headers.get("user-agent") || null,
      },
    });
  } catch {
    // Audit failures should not break the main flow
    console.error("Audit log failed");
  }
}
