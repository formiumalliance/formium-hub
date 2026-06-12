import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, Category } from "@prisma/client";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key || key !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: "admin@formiumhub.com" },
  });

  if (existing) {
    return NextResponse.json({ message: "Admin already exists. Setup already done." });
  }

  const hashedPassword = await bcrypt.hash("admin123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@formiumhub.com",
      name: "Admin User",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const sampleCards = [
    { title: "Instagram", category: Category.MARKETING, websiteUrl: "https://instagram.com", iconUrl: "https://www.instagram.com/favicon.ico", isFavorite: true },
    { title: "Canva", category: Category.MARKETING, websiteUrl: "https://canva.com", iconUrl: "https://www.canva.com/favicon.ico", isFavorite: true },
    { title: "Cloudflare", category: Category.HOSTING, websiteUrl: "https://cloudflare.com", iconUrl: "https://www.cloudflare.com/favicon.ico" },
    { title: "ChatGPT", category: Category.TECHNOLOGY, websiteUrl: "https://chat.openai.com", iconUrl: "https://chat.openai.com/favicon.ico", isFavorite: true },
  ];

  for (const card of sampleCards) {
    await prisma.accountCard.create({ data: { ...card, createdById: admin.id } });
  }

  return NextResponse.json({ message: "Setup complete! Admin account created.", email: admin.email });
}
