"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { petSchema } from "@/lib/validations/pet";
import { jobSchema } from "@/lib/validations/job";
import { prisma } from "@/lib/prisma";

export async function createPetAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const parsed = petSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    breed: formData.get("breed") || undefined,
    age: formData.get("age") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await prisma.pet.create({ data: { ownerId: session.sub, ...parsed.data } });
  revalidatePath("/owner/pets");
  revalidatePath("/owner");
  return { success: true };
}

export async function deletePetAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const id = String(formData.get("id"));
  await prisma.pet.deleteMany({ where: { id, ownerId: session.sub } });
  revalidatePath("/owner/pets");
}

export async function createJobAction(formData: FormData) {
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
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
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
  return { success: true };
}

export async function selectSitterAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const jobPostId = String(formData.get("jobPostId"));
  const sitterId = String(formData.get("sitterId"));
  await prisma.jobPost.updateMany({
    where: { id: jobPostId, ownerId: session.sub },
    data: { selectedSitterId: sitterId, status: "FUNDED" },
  });
  await prisma.jobApplication.updateMany({
    where: { jobPostId },
    data: { status: "REJECTED" },
  });
  await prisma.jobApplication.updateMany({
    where: { jobPostId, sitterId },
    data: { status: "ACCEPTED" },
  });
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/jobs");
}

export async function confirmCompletionAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);
  const jobPostId = String(formData.get("jobPostId"));
  await prisma.jobPost.updateMany({ where: { id: jobPostId, ownerId: session.sub }, data: { status: "COMPLETED" } });
  revalidatePath("/owner/jobs");
  revalidatePath("/sitter/assignments");
}
