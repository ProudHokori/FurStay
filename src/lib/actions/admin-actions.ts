"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function reviewVerificationAction(formData: FormData) {
  const session = await requireRole(["ADMIN"]);
  const requestId = String(formData.get("requestId"));
  const decision = String(formData.get("decision"));
  const request = await prisma.verificationRequest.update({
    where: { id: requestId },
    data: { status: decision === "APPROVE" ? "APPROVED" : "REJECTED", reviewedById: session.sub },
  });
  if (request.status === "APPROVED") {
    await prisma.sitterProfile.upsert({
      where: { userId: request.userId },
      update: { isVerified: true },
      create: { userId: request.userId, isVerified: true },
    });
  }
  revalidatePath("/admin/verifications");
  revalidatePath("/sitter/profile");
}

export async function removeJobAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const jobPostId = String(formData.get("jobPostId"));
  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "REMOVED" } });
  revalidatePath("/admin/jobs");
  revalidatePath("/sitter/jobs");
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
