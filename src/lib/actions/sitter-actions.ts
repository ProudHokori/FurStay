"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function saveSitterProfileAction(formData: FormData) {
  const session = await requireRole(["SITTER"]);
  await prisma.sitterProfile.upsert({
    where: { userId: session.sub },
    update: {
      bio: String(formData.get("bio") || ""),
      experience: String(formData.get("experience") || ""),
    },
    create: {
      userId: session.sub,
      bio: String(formData.get("bio") || ""),
      experience: String(formData.get("experience") || ""),
    },
  });
  revalidatePath("/sitter/profile");
}

export async function submitVerificationAction(formData: FormData) {
  const session = await requireRole(["SITTER"]);
  await prisma.verificationRequest.create({
    data: {
      userId: session.sub,
      documentUrl: String(formData.get("documentUrl") || ""),
      note: String(formData.get("note") || ""),
    },
  });
  revalidatePath("/sitter/profile");
  revalidatePath("/admin/verifications");
}

export async function applyJobAction(formData: FormData) {
  const session = await requireRole(["SITTER"]);
  const jobPostId = String(formData.get("jobPostId"));
  await prisma.jobApplication.upsert({
    where: { jobPostId_sitterId: { jobPostId, sitterId: session.sub } },
    update: { status: "PENDING", message: String(formData.get("message") || "") },
    create: { jobPostId, sitterId: session.sub, message: String(formData.get("message") || "") },
  });
  revalidatePath("/sitter/jobs");
  revalidatePath("/owner/jobs");
}

export async function submitWorkProofAction(formData: FormData) {
  const session = await requireRole(["SITTER"]);
  const jobPostId = String(formData.get("jobPostId"));
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
