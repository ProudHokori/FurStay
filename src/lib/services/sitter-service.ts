import { prisma } from "@/lib/prisma";
import { sitterRepository } from "@/lib/repositories/sitter-repository";

// ── Guards ────────────────────────────────────────────────────────────────────

async function requireEligibleSitter(sitterId: string) {
  const profile = await sitterRepository.getProfile(sitterId);
  if (!profile || profile.verificationStatus !== "APPROVED")
    throw new Error("You must be verified to apply for jobs.");
  if (profile.isBanned)
    throw new Error("Your account has been suspended.");
}

async function requireOpenJob(jobPostId: string) {
  const job = await prisma.jobPost.findUnique({ where: { id: jobPostId }, select: { status: true } });
  if (!job || job.status !== "OPEN")
    throw new Error("This job is no longer accepting applications.");
}

// ── Application ───────────────────────────────────────────────────────────────

export async function applyForJob(sitterId: string, jobPostId: string, message: string) {
  await requireEligibleSitter(sitterId);
  await requireOpenJob(jobPostId);

  await prisma.jobApplication.upsert({
    where: { jobPostId_sitterId: { jobPostId, sitterId } },
    update: { status: "PENDING", message },
    create: { jobPostId, sitterId, message },
  });
}

export async function withdrawApplication(sitterId: string, applicationId: string) {
  const application = await prisma.jobApplication.findFirst({
    where: { id: applicationId, sitterId },
  });
  if (!application || application.status !== "PENDING")
    throw new Error("Can only withdraw a pending application.");

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN" },
  });
}

// ── Work proof ────────────────────────────────────────────────────────────────

export async function submitWorkProof(
  sitterId: string,
  jobPostId: string,
  proofText: string,
  imageUrl: string
) {
  const job = await prisma.jobPost.findFirst({
    where: { id: jobPostId, selectedSitterId: sitterId, status: "FUNDED" },
  });
  if (!job) throw new Error("Assignment not found or not in FUNDED state.");

  await prisma.workProof.create({ data: { jobPostId, sitterId, proofText, imageUrl } });
  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "IN_PROGRESS" } });
}
