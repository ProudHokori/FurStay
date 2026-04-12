"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { sitterRepository } from "@/lib/repositories/sitter-repository";
import { reviewVerification } from "@/lib/services/verification-service";
import { prisma } from "@/lib/prisma";

export async function reviewVerificationAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  await reviewVerification(
    String(formData.get("requestId")),
    String(formData.get("decision")) === "APPROVE" ? "APPROVE" : "REJECT"
  );
  revalidatePath("/admin/verifications");
  revalidatePath("/sitter/profile");
  revalidatePath("/sitter");
}

export async function removeJobAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  await prisma.jobPost.update({
    where: { id: String(formData.get("jobPostId")) },
    data: { status: "REMOVED" },
  });
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
  await sitterRepository.setBanned(String(formData.get("userId")), true);
  revalidatePath("/admin/sitters");
  revalidatePath("/sitter/jobs");
}

export async function unbanSitterAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  await sitterRepository.setBanned(String(formData.get("userId")), false);
  revalidatePath("/admin/sitters");
}
