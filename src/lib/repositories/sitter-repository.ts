import { prisma } from "@/lib/prisma";

export const sitterRepository = {
  getProfile(userId: string) {
    return prisma.sitterProfile.findUnique({ where: { userId } });
  },

  upsertProfile(userId: string, data: { bio?: string; experience?: string; resumeUrl?: string }) {
    return prisma.sitterProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },

  setVerificationStatus(userId: string, status: "APPROVED" | "REJECTED", resumeUrl?: string) {
    return prisma.sitterProfile.upsert({
      where: { userId },
      update: { verificationStatus: status, ...(resumeUrl ? { resumeUrl } : {}) },
      create: { userId, verificationStatus: status, ...(resumeUrl ? { resumeUrl } : {}) },
    });
  },

  setBanned(userId: string, isBanned: boolean) {
    return prisma.sitterProfile.upsert({
      where: { userId },
      update: { isBanned },
      create: { userId, isBanned },
    });
  },

  // Admin: all sitters with their profiles
  getAllSitters() {
    return prisma.user.findMany({
      where: { role: "SITTER" },
      include: { sitterProfile: true },
      orderBy: { createdAt: "desc" },
    });
  },

  // Admin: pending verification requests only
  getPendingVerifications() {
    return prisma.verificationRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
