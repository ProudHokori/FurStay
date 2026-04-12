"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { sitterRepository } from "@/lib/repositories/sitter-repository";
import { applyForJob, withdrawApplication, submitWorkProof } from "@/lib/services/sitter-service";
import { submitVerification } from "@/lib/services/verification-service";

export async function saveSitterProfileAction(_prev: unknown, formData: FormData) {
  const session = await requireRole(["SITTER"]);
  await sitterRepository.upsertProfile(session.sub, {
    bio: String(formData.get("bio") || ""),
    experience: String(formData.get("experience") || ""),
    resumeUrl: String(formData.get("resumeUrl") || "") || undefined,
  });
  revalidatePath("/sitter/profile");
  return { success: true };
}

export async function submitVerificationAction(_prev: unknown, formData: FormData) {
  const session = await requireRole(["SITTER"]);
  try {
    await submitVerification(
      session.sub,
      String(formData.get("resumeUrl") || ""),
      String(formData.get("note") || "")
    );
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/sitter/profile");
  revalidatePath("/admin/verifications");
  return { success: true };
}

export async function applyJobAction(_prev: unknown, formData: FormData) {
  const session = await requireRole(["SITTER"]);
  try {
    await applyForJob(session.sub, String(formData.get("jobPostId")), String(formData.get("message") || ""));
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/sitter/jobs");
  revalidatePath("/owner/jobs");
  return { success: true };
}

export async function withdrawApplicationAction(formData: FormData) {
  const session = await requireRole(["SITTER"]);
  await withdrawApplication(session.sub, String(formData.get("applicationId")));
  revalidatePath("/sitter/jobs");
  revalidatePath("/owner/jobs");
}

export async function submitWorkProofAction(formData: FormData) {
  const session = await requireRole(["SITTER"]);
  await submitWorkProof(
    session.sub,
    String(formData.get("jobPostId")),
    String(formData.get("proofText") || ""),
    String(formData.get("imageUrl") || "")
  );
  revalidatePath("/sitter/assignments");
  revalidatePath("/owner/jobs");
}
