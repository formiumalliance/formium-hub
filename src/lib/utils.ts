// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Category } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

/**
 * Returns a favicon URL for a given website URL.
 * Falls back to a Google favicon service.
 */
export function getFaviconUrl(websiteUrl: string, iconUrl?: string | null): string {
  if (iconUrl) return iconUrl;
  try {
    const url = new URL(websiteUrl);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return "/favicon.ico";
  }
}

/**
 * Opens a card URL in a new tab with the accountId appended for the Chrome Extension.
 */
export function openCardUrl(websiteUrl: string, cardId: string): void {
  try {
    const url = new URL(websiteUrl);
    url.searchParams.set("fhAccountId", cardId);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  } catch {
    window.open(websiteUrl, "_blank", "noopener,noreferrer");
  }
}

export function getCategoryFromUrl(url: string): Category {
  const lower = url.toLowerCase();
  if (lower.includes("instagram") || lower.includes("facebook") || lower.includes("twitter") || lower.includes("linkedin")) return "MARKETING";
  if (lower.includes("cloudflare") || lower.includes("cpanel") || lower.includes("hosting") || lower.includes("dynadot")) return "HOSTING";
  if (lower.includes("github") || lower.includes("vercel") || lower.includes("openai") || lower.includes("chatgpt")) return "TECHNOLOGY";
  return "OPERATIONS";
}
