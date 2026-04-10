import { prisma } from "@/lib/prisma";

export const jobRepository = {
  // Owner: all jobs with full details for job management page (REMOVED jobs hidden)
  getOwnerJobs(ownerId: string) {
    return prisma.jobPost.findMany({
      where: { ownerId, status: { not: "REMOVED" } },
      include: {
        pet: true,
        applications: {
          include: { sitter: { include: { sitterProfile: true } } },
          orderBy: { createdAt: "desc" },
        },
        workProofs: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Sitter job board: OPEN jobs only, with owner + applications (to detect if already applied)
  getOpenJobs() {
    return prisma.jobPost.findMany({
      where: { status: "OPEN" },
      include: { pet: true, owner: true, applications: true },
      orderBy: { createdAt: "desc" },
    });
  },

  // Sitter: active assignments split by status
  getAssignmentsBySitter(sitterId: string) {
    return prisma.jobPost.findMany({
      where: {
        selectedSitterId: sitterId,
        status: { in: ["FUNDED", "IN_PROGRESS"] },
      },
      include: { pet: true, owner: true, workProofs: true },
      orderBy: { createdAt: "desc" },
    });
  },

  // Sitter: completed job history with ratings
  getJobHistoryBySitter(sitterId: string) {
    return prisma.jobPost.findMany({
      where: { selectedSitterId: sitterId, status: "COMPLETED" },
      include: { pet: true, owner: true },
      orderBy: { updatedAt: "desc" },
    });
  },

  // Sitter: all applications with job details (REMOVED jobs hidden)
  getApplicationsBySitter(sitterId: string) {
    return prisma.jobApplication.findMany({
      where: { sitterId, jobPost: { status: { not: "REMOVED" } } },
      include: { jobPost: { include: { pet: true, owner: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  // Owner: aggregate sitter rating stats (for profile modal)
  async getSitterStats(sitterId: string) {
    const completedJobs = await prisma.jobPost.findMany({
      where: { selectedSitterId: sitterId, status: "COMPLETED" },
      select: { rating: true },
    });
    const rated = completedJobs.filter((j) => j.rating !== null);
    const avgRating = rated.length > 0 ? rated.reduce((sum, j) => sum + (j.rating ?? 0), 0) / rated.length : null;
    return { completedJobs: completedJobs.length, avgRating };
  },

  // Admin: all jobs for moderation
  getModerationJobs() {
    return prisma.jobPost.findMany({
      include: { owner: true, pet: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
