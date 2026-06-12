// src/types/index.ts
// Shared TypeScript types for Formium Hub

export type Role = "ADMIN" | "MANAGER" | "USER";

export type Category =
  | "MARKETING"
  | "TECHNOLOGY"
  | "HOSTING"
  | "FINANCE"
  | "CLIENTS"
  | "OPERATIONS"
  | "INTERNAL";

export interface AccountCard {
  id: string;
  title: string;
  category: Category;
  websiteUrl: string;
  username?: string | null;
  notes?: string | null;
  iconUrl?: string | null;
  isFavorite: boolean;
  lastOpenedAt?: Date | string | null;
  openCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdById: string;
  // encryptedPassword is never sent to the client
}

export interface AccountCardFormData {
  title: string;
  category: Category;
  websiteUrl: string;
  username?: string;
  password?: string;
  notes?: string;
  iconUrl?: string;
  isFavorite?: boolean;
}

export interface DashboardStats {
  totalCards: number;
  favorites: number;
  recentlyUsed: number;
  categoryCounts: Record<Category, number>;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
  user?: {
    name?: string | null;
    email: string;
  };
}

export const CATEGORIES: Category[] = [
  "MARKETING",
  "TECHNOLOGY",
  "HOSTING",
  "FINANCE",
  "CLIENTS",
  "OPERATIONS",
  "INTERNAL",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  MARKETING: "Marketing",
  TECHNOLOGY: "Technology",
  HOSTING: "Hosting",
  FINANCE: "Finance",
  CLIENTS: "Clients",
  OPERATIONS: "Operations",
  INTERNAL: "Internal",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  MARKETING: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  TECHNOLOGY: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HOSTING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  FINANCE: "bg-green-500/10 text-green-400 border-green-500/20",
  CLIENTS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  OPERATIONS: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  INTERNAL: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};
