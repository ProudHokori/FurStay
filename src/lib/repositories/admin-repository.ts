import { prisma } from "@/lib/prisma";

export const adminRepository = {
  getDashboardStats() {
    return Promise.all([
      prisma.user.count(),
      prisma.jobPost.count(),
      prisma.verificationRequest.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "SITTER" } }),
    ]).then(([users, jobs, pendingVerifications, sitters]) => ({
      users,
      jobs,
      pendingVerifications,
      sitters,
    }));
  },

  // PENDING only — REJECTED requests are deleted immediately on rejection
  getPendingVerifications() {
    return prisma.verificationRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  },

  getModerationJobs() {
    return prisma.jobPost.findMany({
      include: { owner: true, pet: true },
      orderBy: { createdAt: "desc" },
    });
  },

  getAllSitters() {
    return prisma.user.findMany({
      where: { role: "SITTER" },
      include: { sitterProfile: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
