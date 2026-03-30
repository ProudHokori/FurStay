import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const ownerPassword = await bcrypt.hash("owner123", 10);
  const sitterPassword = await bcrypt.hash("sitter123", 10);

  const [admin, owner, sitter] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@furstay.local" },
      update: {},
      create: { email: "admin@furstay.local", name: "Admin", password: adminPassword, role: "ADMIN" }
    }),
    prisma.user.upsert({
      where: { email: "owner@furstay.local" },
      update: {},
      create: { email: "owner@furstay.local", name: "Owner Demo", password: ownerPassword, role: "OWNER" }
    }),
    prisma.user.upsert({
      where: { email: "sitter@furstay.local" },
      update: {},
      create: { email: "sitter@furstay.local", name: "Sitter Demo", password: sitterPassword, role: "SITTER" }
    })
  ]);

  await prisma.sitterProfile.upsert({
    where: { userId: sitter.id },
    update: { bio: "Experienced cat and dog sitter", experience: "3 years", isVerified: true },
    create: { userId: sitter.id, bio: "Experienced cat and dog sitter", experience: "3 years", isVerified: true },
  });

  const pet = await prisma.pet.upsert({
    where: { id: "demo-pet" },
    update: {},
    create: {
      id: "demo-pet",
      ownerId: owner.id,
      name: "Mochi",
      type: "Dog",
      breed: "Shiba",
      age: 3,
      notes: "Friendly and energetic"
    }
  });

  const job = await prisma.jobPost.upsert({
    where: { id: "demo-job" },
    update: {},
    create: {
      id: "demo-job",
      ownerId: owner.id,
      petId: pet.id,
      title: "Need a weekend dog sitter.",
      description: "Take care of Mochi from Saturday morning to Sunday evening.",
      location: "Bangkok",
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      paymentAmount: 1200
    }
  });

  await prisma.jobApplication.upsert({
    where: { jobPostId_sitterId: { jobPostId: job.id, sitterId: sitter.id } },
    update: {},
    create: { jobPostId: job.id, sitterId: sitter.id, message: "I can help this weekend." }
  });

  console.log("Seed complete");
}

main().finally(async () => prisma.$disconnect());
