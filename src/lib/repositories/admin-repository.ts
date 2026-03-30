import { prisma } from "@/lib/prisma";

export const adminRepository = {
  getVerificationRequests() {
    return prisma.verificationRequest.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  },
  getModerationJobs() {
    return prisma.jobPost.findMany({ include: { owner: true, pet: true }, orderBy: { createdAt: "desc" } });
  },
};
