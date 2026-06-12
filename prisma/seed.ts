// prisma/seed.ts
// Seeds the database with an initial admin user and sample cards

import { PrismaClient, Category, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@formiumhub.com" },
    update: {},
    create: {
      email: "admin@formiumhub.com",
      name: "Admin User",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Sample cards (no real credentials)
  const sampleCards = [
    {
      title: "Instagram",
      category: Category.MARKETING,
      websiteUrl: "https://instagram.com",
      iconUrl: "https://www.instagram.com/favicon.ico",
      notes: "Company Instagram account",
      isFavorite: true,
    },
    {
      title: "Canva",
      category: Category.MARKETING,
      websiteUrl: "https://canva.com",
      iconUrl: "https://www.canva.com/favicon.ico",
      notes: "Design tool",
      isFavorite: true,
    },
    {
      title: "Meta Ads",
      category: Category.MARKETING,
      websiteUrl: "https://business.facebook.com",
      iconUrl: "https://business.facebook.com/favicon.ico",
      notes: "Facebook & Instagram advertising",
    },
    {
      title: "Cloudflare",
      category: Category.HOSTING,
      websiteUrl: "https://cloudflare.com",
      iconUrl: "https://www.cloudflare.com/favicon.ico",
      notes: "DNS and CDN management",
    },
    {
      title: "Dynadot",
      category: Category.HOSTING,
      websiteUrl: "https://dynadot.com",
      iconUrl: "https://www.dynadot.com/favicon.ico",
      notes: "Domain registrar",
    },
    {
      title: "ChatGPT",
      category: Category.TECHNOLOGY,
      websiteUrl: "https://chat.openai.com",
      iconUrl: "https://chat.openai.com/favicon.ico",
      notes: "AI assistant",
      isFavorite: true,
    },
  ];

  for (const card of sampleCards) {
    await prisma.accountCard.create({
      data: { ...card, createdById: admin.id },
    });
  }

  console.log(`✅ Created ${sampleCards.length} sample cards`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
