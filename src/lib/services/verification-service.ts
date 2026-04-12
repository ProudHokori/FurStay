import { prisma } from "@/lib/prisma";
import { sitterRepository } from "@/lib/repositories/sitter-repository";

export async function submitVerification(userId: string, resumeUrl: string, note: string) {
  const profile = await sitterRepository.getProfile(userId);
  if (profile?.verificationStatus === "APPROVED")
    throw new Error("Your profile is already approved.");
  if (!resumeUrl) throw new Error("Resume URL is required.");

  await prisma.verificationRequest.create({
    data: { userId, documentUrl: resumeUrl, note },
  });
  await sitterRepository.upsertProfile(userId, { resumeUrl });
}

export async function reviewVerification(requestId: string, decision: "APPROVE" | "REJECT") {
  const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("Verification request not found.");

  if (decision === "APPROVE") {
    await prisma.verificationRequest.update({ where: { id: requestId }, data: { status: "APPROVED" } });
    await sitterRepository.setVerificationStatus(request.userId, "APPROVED", request.documentUrl ?? undefined);
  } else {
    await prisma.verificationRequest.delete({ where: { id: requestId } });
    await sitterRepository.setVerificationStatus(request.userId, "REJECTED");
  }
}
