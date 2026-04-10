"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { sitterRepository } from "@/lib/repositories/sitter-repository";
import { prisma } from "@/lib/prisma";

export async function saveSitterProfileAction(_prevState: unknown, formData: FormData) {
  const session = await requireRole(["SITTER"]);
  const bio = String(formData.get("bio") || "");
  const experience = String(formData.get("experience") || "");
  const resumeUrl = String(formData.get("resumeUrl") || "");
  await sitterRepository.upsertProfile(session.sub, { bio, experience, ...(resumeUrl ? { resumeUrl } : {}) });
  revalidatePath("/sitter/profile");
  return { success: true };
}

export async function submitVerificationAction(_prevState: unknown, formData: FormData) {
  const session = await requireRole(["SITTER"]);

  // Guard: already APPROVED sitters don't need to re-submit
  const profile = await sitterRepository.getProfile(session.sub);
  if (profile?.verificationStatus === "APPROVED") {
    return { error: "Your profile is already approved." };
  }

  const resumeUrl = String(formData.get("resumeUrl") || "");
  if (!resumeUrl) return { error: "Resume URL is required." };

  await prisma.verificationRequest.create({
    data: {
      userId: session.sub,
      documentUrl: resumeUrl,
      note: String(formData.get("note") || ""),
    },
  });
  // Update profile resumeUrl for reference
  await sitterRepository.upsertProfile(session.sub, { resumeUrl });

  revalidatePath("/sitter/profile");
  revalidatePath("/admin/verifications");
  return { success: true };
}

export async function applyJobAction(_prevState: unknown, formData: FormData) {
  const session = await requireRole(["SITTER"]);
  const jobPostId = String(formData.get("jobPostId"));

  // Gate 1: must be APPROVED
  const profile = await sitterRepository.getProfile(session.sub);
  if (!profile || profile.verificationStatus !== "APPROVED") {
    return { error: "You must be verified to apply for jobs." };
  }
  // Gate 2: must not be banned
  if (profile.isBanned) {
    return { error: "Your account has been suspended." };
  }
  // Gate 3: job must still be OPEN
  const job = await prisma.jobPost.findUnique({ where: { id: jobPostId }, select: { status: true } });
  if (!job || job.status !== "OPEN") {
    return { error: "This job is no longer accepting applications." };
  }

  await prisma.jobApplication.upsert({
    where: { jobPostId_sitterId: { jobPostId, sitterId: session.sub } },
    update: { status: "PENDING", message: String(formData.get("message") || "") },
    create: { jobPostId, sitterId: session.sub, message: String(formData.get("message") || "") },
  });
  revalidatePath("/sitter/jobs");
  revalidatePath("/owner/jobs");
  return { success: true };
}

export async function withdrawApplicationAction(formData: FormData) {
  const session = await requireRole(["SITTER"]);
  const applicationId = String(formData.get("applicationId"));

  const application = await prisma.jobApplication.findFirst({
    where: { id: applicationId, sitterId: session.sub },
  });
  if (!application || application.status !== "PENDING") {
    throw new Error("Can only withdraw a pending application.");
  }

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN" },
  });
  revalidatePath("/sitter/jobs");
  revalidatePath("/owner/jobs");
}

export async function submitWorkProofAction(formData: FormData) {
  const session = await requireRole(["SITTER"]);
  const jobPostId = String(formData.get("jobPostId"));

  const job = await prisma.jobPost.findFirst({
    where: { id: jobPostId, selectedSitterId: session.sub, status: "FUNDED" },
  });
  if (!job) throw new Error("Assignment not found or not in FUNDED state.");

  await prisma.workProof.create({
    data: {
      jobPostId,
      sitterId: session.sub,
      proofText: String(formData.get("proofText") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
    },
  });
  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "IN_PROGRESS" } });
  revalidatePath("/sitter/assignments");
  revalidatePath("/owner/jobs");
}
