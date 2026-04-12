import { prisma } from "@/lib/prisma";

// ── Guards ────────────────────────────────────────────────────────────────────

async function requireOwnedJob(jobPostId: string, ownerId: string) {
  const job = await prisma.jobPost.findFirst({ where: { id: jobPostId, ownerId } });
  if (!job) throw new Error("Job not found.");
  return job;
}

// ── State transitions ─────────────────────────────────────────────────────────

export async function selectSitter(ownerId: string, jobPostId: string, sitterId: string) {
  const job = await requireOwnedJob(jobPostId, ownerId);
  if (job.status !== "OPEN") throw new Error("Job is no longer open.");

  await prisma.jobPost.update({
    where: { id: jobPostId },
    data: { selectedSitterId: sitterId, status: "WAITING" },
  });
  await prisma.jobApplication.updateMany({
    where: { jobPostId, sitterId },
    data: { status: "ACCEPTED" },
  });
}

export async function confirmPayment(ownerId: string, jobPostId: string) {
  const job = await requireOwnedJob(jobPostId, ownerId);
  if (job.status !== "WAITING") throw new Error("Job is not awaiting payment.");

  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "FUNDED" } });
  await prisma.jobApplication.updateMany({
    where: { jobPostId, status: "PENDING" },
    data: { status: "REJECTED" },
  });
}

export async function cancelJob(ownerId: string, jobPostId: string) {
  const job = await requireOwnedJob(jobPostId, ownerId);
  if (job.status !== "OPEN") throw new Error("No refunds after payment has been initiated.");

  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "CANCELLED" } });
  await prisma.jobApplication.updateMany({ where: { jobPostId }, data: { status: "REJECTED" } });
}

export async function confirmCompletion(ownerId: string, jobPostId: string) {
  const job = await requireOwnedJob(jobPostId, ownerId);
  if (job.status !== "IN_PROGRESS") throw new Error("Job is not in progress.");

  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "COMPLETED" } });
}

export async function rateJob(ownerId: string, jobPostId: string, rating: number) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be 1–5.");

  const job = await requireOwnedJob(jobPostId, ownerId);
  if (job.status !== "COMPLETED") throw new Error("Can only rate a completed job.");
  if (job.rating !== null) throw new Error("Job already rated.");

  await prisma.jobPost.update({ where: { id: jobPostId }, data: { rating } });
}
