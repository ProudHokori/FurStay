import { prisma } from "@/lib/prisma";

export const jobRepository = {
  getOwnerJobs(ownerId: string) {
    return prisma.jobPost.findMany({
      where: { ownerId },
      include: { pet: true, applications: { include: { sitter: true } }, workProofs: true },
      orderBy: { createdAt: "desc" },
    });
  },
  getOpenJobs() {
    return prisma.jobPost.findMany({
      where: { status: { in: ["OPEN", "FUNDED"] } },
      include: { pet: true, owner: true, applications: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
