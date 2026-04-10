"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { petSchema } from "@/lib/validations/pet";
import { jobSchema } from "@/lib/validations/job";
import { petRepository } from "@/lib/repositories/pet-repository";
import { prisma } from "@/lib/prisma";

// ─── Pets ────────────────────────────────────────────────────────────────────

export async function createPetAction(_prevState: unknown, formData: FormData) {
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

export async function updatePetAction(_prevState: unknown, formData: FormData) {
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
  const id = String(formData.get("id"));
  await petRepository.delete(id, session.sub);
  revalidatePath("/owner/pets");
  revalidatePath("/owner");
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export async function createJobAction(_prevState: unknown, formData: FormData) {
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
  const jobPostId = String(formData.get("jobPostId"));
  const sitterId = String(formData.get("sitterId"));

  const job = await prisma.jobPost.findFirst({ where: { id: jobPostId, ownerId: session.sub } });
  if (!job || job.status !== "OPEN") throw new Error("Job is no longer open.");

  await prisma.jobPost.update({
    where: { id: jobPostId },
    data: { selectedSitterId: sitterId, status: "WAITING" },
  });
  // Accept selected application; leave others PENDING until payment confirmed
  await prisma.jobApplication.updateMany({
    where: { jobPostId, sitterId },
    data: { status: "ACCEPTED" },
  });
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/jobs");
  revalidatePath("/sitter/assignments");
}

export async function confirmPaymentAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const jobPostId = String(formData.get("jobPostId"));

  const job = await prisma.jobPost.findFirst({ where: { id: jobPostId, ownerId: session.sub } });
  if (!job || job.status !== "WAITING") throw new Error("Job is not awaiting payment.");

  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "FUNDED" } });
  // Reject all remaining PENDING applications now that payment is confirmed
  await prisma.jobApplication.updateMany({
    where: { jobPostId, status: "PENDING" },
    data: { status: "REJECTED" },
  });
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/jobs");
  revalidatePath("/sitter/assignments");
}

export async function cancelJobAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const jobPostId = String(formData.get("jobPostId"));

  const job = await prisma.jobPost.findFirst({ where: { id: jobPostId, ownerId: session.sub } });
  if (!job) throw new Error("Job not found.");
  if (job.status !== "OPEN") throw new Error("No refunds after payment has been initiated.");

  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "CANCELLED" } });
  await prisma.jobApplication.updateMany({ where: { jobPostId }, data: { status: "REJECTED" } });
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/jobs");
}

export async function confirmCompletionAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const jobPostId = String(formData.get("jobPostId"));
  await prisma.jobPost.updateMany({
    where: { id: jobPostId, ownerId: session.sub, status: "IN_PROGRESS" },
    data: { status: "COMPLETED" },
  });
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/assignments");
}

export async function rateJobAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const jobPostId = String(formData.get("jobPostId"));
  const rating = Number(formData.get("rating"));

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be 1–5.");

  const job = await prisma.jobPost.findFirst({ where: { id: jobPostId, ownerId: session.sub } });
  if (!job || job.status !== "COMPLETED") throw new Error("Can only rate a completed job.");
  if (job.rating !== null) throw new Error("Job already rated.");

  await prisma.jobPost.update({ where: { id: jobPostId }, data: { rating } });
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/assignments");
}
