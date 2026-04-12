"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { petSchema } from "@/lib/validations/pet";
import { jobSchema } from "@/lib/validations/job";
import { petRepository } from "@/lib/repositories/pet-repository";
import { prisma } from "@/lib/prisma";
import { selectSitter, confirmPayment, cancelJob, confirmCompletion, rateJob } from "@/lib/services/job-service";

// ── Pets ──────────────────────────────────────────────────────────────────────

export async function createPetAction(_prev: unknown, formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const parsed = petSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    breed: formData.get("breed") || undefined,
    age: formData.get("age") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await petRepository.create({ ownerId: session.sub, ...parsed.data });
  revalidatePath("/owner/pets");
  revalidatePath("/owner");
  return { success: true };
}

export async function updatePetAction(_prev: unknown, formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const id = String(formData.get("id"));
  const parsed = petSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    breed: formData.get("breed") || undefined,
    age: formData.get("age") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await petRepository.update(id, session.sub, parsed.data);
  revalidatePath("/owner/pets");
  return { success: true };
}

export async function deletePetAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  await petRepository.delete(String(formData.get("id")), session.sub);
  revalidatePath("/owner/pets");
  revalidatePath("/owner");
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export async function createJobAction(_prev: unknown, formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const parsed = jobSchema.safeParse({
    petId: formData.get("petId"),
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    paymentAmount: formData.get("paymentAmount"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await prisma.jobPost.create({
    data: {
      ownerId: session.sub,
      petId: parsed.data.petId,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      paymentAmount: parsed.data.paymentAmount,
    },
  });
  revalidatePath("/owner/jobs");
  revalidatePath("/owner");
  redirect("/owner/jobs");
}

export async function selectSitterAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  await selectSitter(session.sub, String(formData.get("jobPostId")), String(formData.get("sitterId")));
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/jobs");
  revalidatePath("/sitter/assignments");
}

export async function confirmPaymentAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  await confirmPayment(session.sub, String(formData.get("jobPostId")));
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/jobs");
  revalidatePath("/sitter/assignments");
}

export async function cancelJobAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  await cancelJob(session.sub, String(formData.get("jobPostId")));
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/jobs");
}

export async function confirmCompletionAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  await confirmCompletion(session.sub, String(formData.get("jobPostId")));
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/assignments");
}

export async function rateJobAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  await rateJob(session.sub, String(formData.get("jobPostId")), Number(formData.get("rating")));
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/assignments");
}
