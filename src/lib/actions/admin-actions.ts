"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { sitterRepository } from "@/lib/repositories/sitter-repository";
import { prisma } from "@/lib/prisma";

export async function reviewVerificationAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const requestId = String(formData.get("requestId"));
  const decision = String(formData.get("decision"));

  const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("Verification request not found.");

  if (decision === "APPROVE") {
    await prisma.verificationRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });
    await sitterRepository.setVerificationStatus(request.userId, "APPROVED", request.documentUrl ?? undefined);
  } else {
    // On rejection: delete the request immediately and mark profile REJECTED
    await prisma.verificationRequest.delete({ where: { id: requestId } });
    await sitterRepository.setVerificationStatus(request.userId, "REJECTED");
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/sitter/profile");
  revalidatePath("/sitter");
}

export async function removeJobAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const jobPostId = String(formData.get("jobPostId"));
  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "REMOVED" } });
  revalidatePath("/admin/jobs");
  revalidatePath("/sitter/jobs");
  revalidatePath("/owner/jobs");
}

export async function adminCancelJobAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const jobPostId = String(formData.get("jobPostId"));
  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "CANCELLED" } });
  await prisma.jobApplication.updateMany({ where: { jobPostId }, data: { status: "REJECTED" } });
  revalidatePath("/admin/jobs");
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/jobs");
}

export async function banSitterAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId"));
  await sitterRepository.setBanned(userId, true);
  revalidatePath("/admin/sitters");
  revalidatePath("/sitter/jobs");
}

export async function unbanSitterAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId"));
  await sitterRepository.setBanned(userId, false);
  revalidatePath("/admin/sitters");
}
