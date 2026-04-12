import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users ──────────────────────────────────────────────────────────────────
  const [adminPw, owner1Pw, owner2Pw, sitter1Pw, sitter2Pw] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("owner123", 10),
    bcrypt.hash("owner456", 10),
    bcrypt.hash("sitter123", 10),
    bcrypt.hash("sitter456", 10),
  ]);

  await prisma.user.upsert({
    where: { email: "admin@furstay.local" },
    update: {},
    create: { email: "admin@furstay.local", name: "Admin", password: adminPw, role: "ADMIN" },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: "owner1@furstay.local" },
    update: {},
    create: { email: "owner1@furstay.local", name: "Napat Somboon", password: owner1Pw, role: "OWNER" },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "owner2@furstay.local" },
    update: {},
    create: { email: "owner2@furstay.local", name: "Siriporn Kaewtip", password: owner2Pw, role: "OWNER" },
  });

  const sitter1 = await prisma.user.upsert({
    where: { email: "sitter1@furstay.local" },
    update: {},
    create: { email: "sitter1@furstay.local", name: "Chaiya Nakpan", password: sitter1Pw, role: "SITTER" },
  });

  const sitter2 = await prisma.user.upsert({
    where: { email: "sitter2@furstay.local" },
    update: {},
    create: { email: "sitter2@furstay.local", name: "Warisa Thongdee", password: sitter2Pw, role: "SITTER" },
  });

  // ── Sitter profiles ────────────────────────────────────────────────────────
  // sitter1: APPROVED (can apply for jobs)
  await prisma.sitterProfile.upsert({
    where: { userId: sitter1.id },
    update: {},
    create: {
      userId: sitter1.id,
      bio: "Passionate animal lover with 4 years of professional pet-sitting experience.",
      experience: "Cared for dogs, cats, and small animals. Comfortable with medication routines.",
      resumeUrl: "https://example.com/resume-chaiya",
      verificationStatus: "APPROVED",
      isBanned: false,
    },
  });

  // sitter2: PENDING (waiting for admin review — shows verification flow)
  await prisma.sitterProfile.upsert({
    where: { userId: sitter2.id },
    update: {},
    create: {
      userId: sitter2.id,
      bio: "Dog trainer with 2 years experience, specialising in large breeds.",
      experience: "Trained Labrador and Golden Retrievers. First aid certified.",
      resumeUrl: "https://example.com/resume-warisa",
      verificationStatus: "PENDING",
      isBanned: false,
    },
  });

  // Verification request for sitter2
  const existingReq = await prisma.verificationRequest.findFirst({ where: { userId: sitter2.id } });
  if (!existingReq) {
    await prisma.verificationRequest.create({
      data: {
        userId: sitter2.id,
        documentUrl: "https://example.com/resume-warisa",
        note: "Please review my training certificates.",
        status: "PENDING",
      },
    });
  }

  // ── Pets ───────────────────────────────────────────────────────────────────
  const mochi = await prisma.pet.upsert({
    where: { id: "seed-pet-mochi" },
    update: {},
    create: {
      id: "seed-pet-mochi",
      ownerId: owner1.id,
      name: "Mochi",
      type: "Dog",
      breed: "Shiba Inu",
      age: 3,
      description: "Friendly and energetic. Needs a walk twice a day. No special medication.",
    },
  });

  const luna = await prisma.pet.upsert({
    where: { id: "seed-pet-luna" },
    update: {},
    create: {
      id: "seed-pet-luna",
      ownerId: owner1.id,
      name: "Luna",
      type: "Cat",
      breed: "British Shorthair",
      age: 2,
      description: "Calm and independent. Needs dry food twice a day. Allergic to fish-based food.",
    },
  });

  const biscuit = await prisma.pet.upsert({
    where: { id: "seed-pet-biscuit" },
    update: {},
    create: {
      id: "seed-pet-biscuit",
      ownerId: owner2.id,
      name: "Biscuit",
      type: "Rabbit",
      breed: "Holland Lop",
      age: 1,
      description: "Very gentle. Eats pellets and fresh vegetables. Cage must be cleaned daily.",
    },
  });

  // ── Job posts ──────────────────────────────────────────────────────────────
  const now = new Date();
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Job 1: OPEN — sitter1 can apply to this
  const openJob = await prisma.jobPost.upsert({
    where: { id: "seed-job-open" },
    update: {},
    create: {
      id: "seed-job-open",
      ownerId: owner1.id,
      petId: mochi.id,
      title: "Weekend dog sitter needed for Shiba",
      description: "Looking for a reliable sitter for Mochi this weekend. Two walks per day required. Mochi is friendly and well-trained.",
      startDate: inTwoDays,
      endDate: inFiveDays,
      paymentAmount: 1200,
      status: "OPEN",
    },
  });

  // Job 2: OPEN — second listing for cat
  await prisma.jobPost.upsert({
    where: { id: "seed-job-open-2" },
    update: {},
    create: {
      id: "seed-job-open-2",
      ownerId: owner1.id,
      petId: luna.id,
      title: "Cat sitter for 5 days",
      description: "Need someone to visit and feed Luna twice a day while I travel for work. Dry food only — she is allergic to fish.",
      startDate: inTwoDays,
      endDate: inSevenDays,
      paymentAmount: 800,
      status: "OPEN",
    },
  });

  // Job 3: COMPLETED with rating — demonstrates full workflow
  const completedJob = await prisma.jobPost.upsert({
    where: { id: "seed-job-completed" },
    update: {},
    create: {
      id: "seed-job-completed",
      ownerId: owner2.id,
      petId: biscuit.id,
      title: "Rabbit care while on holiday",
      description: "Please take care of Biscuit for a week. Cleaning and feeding schedule will be provided.",
      startDate: lastWeek,
      endDate: yesterday,
      paymentAmount: 1500,
      status: "COMPLETED",
      selectedSitterId: sitter1.id,
      rating: 5,
    },
  });

  // Job 4: FUNDED — shows an in-progress assignment for sitter1
  const fundedJob = await prisma.jobPost.upsert({
    where: { id: "seed-job-funded" },
    update: {},
    create: {
      id: "seed-job-funded",
      ownerId: owner2.id,
      petId: biscuit.id,
      title: "Biscuit weekend stay",
      description: "Weekend care for Biscuit. Daily cage cleaning and vegetable feeding.",
      startDate: inTwoDays,
      endDate: inFiveDays,
      paymentAmount: 900,
      status: "FUNDED",
      selectedSitterId: sitter1.id,
    },
  });

  // ── Applications ───────────────────────────────────────────────────────────
  // sitter1 applied to the open job
  await prisma.jobApplication.upsert({
    where: { jobPostId_sitterId: { jobPostId: openJob.id, sitterId: sitter1.id } },
    update: {},
    create: {
      jobPostId: openJob.id,
      sitterId: sitter1.id,
      message: "Hi! I have experience with Shiba Inus. Happy to help this weekend.",
      status: "PENDING",
    },
  });

  // sitter1 ACCEPTED on the completed job
  await prisma.jobApplication.upsert({
    where: { jobPostId_sitterId: { jobPostId: completedJob.id, sitterId: sitter1.id } },
    update: {},
    create: {
      jobPostId: completedJob.id,
      sitterId: sitter1.id,
      message: "I love rabbits and have experience with Holland Lops.",
      status: "ACCEPTED",
    },
  });

  // sitter1 ACCEPTED on the funded job
  await prisma.jobApplication.upsert({
    where: { jobPostId_sitterId: { jobPostId: fundedJob.id, sitterId: sitter1.id } },
    update: {},
    create: {
      jobPostId: fundedJob.id,
      sitterId: sitter1.id,
      message: "Ready to take care of Biscuit!",
      status: "ACCEPTED",
    },
  });

  console.log("\n✅ Seed complete. Demo accounts:");
  console.log("─────────────────────────────────────────");
  console.log("  ADMIN   admin@furstay.local   / admin123");
  console.log("  OWNER   owner1@furstay.local  / owner123");
  console.log("  OWNER   owner2@furstay.local  / owner456");
  console.log("  SITTER  sitter1@furstay.local / sitter123  (APPROVED)");
  console.log("  SITTER  sitter2@furstay.local / sitter456  (PENDING)");
  console.log("─────────────────────────────────────────");
}

main().finally(async () => prisma.$disconnect());
