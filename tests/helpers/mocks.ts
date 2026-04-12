/**
 * Shared mock factories for FurStay tests.
 * Import after vi.mock() declarations — these only create mock return values.
 */
import { vi } from "vitest";
import type { Mock } from "vitest";
import { prisma } from "@/lib/prisma";
import { sitterRepository } from "@/lib/repositories/sitter-repository";

// ── Type helpers ──────────────────────────────────────────────────────────────

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// ── Prisma mock accessors ─────────────────────────────────────────────────────

export const mockJobPost = {
  findFirst: () => prisma.jobPost.findFirst as Mock,
  findUnique: () => prisma.jobPost.findUnique as Mock,
  update: () => prisma.jobPost.update as Mock,
  updateMany: () => prisma.jobPost.updateMany as Mock,
};

export const mockApplication = {
  upsert: () => prisma.jobApplication.upsert as Mock,
  updateMany: () => prisma.jobApplication.updateMany as Mock,
};

export const mockSitterRepo = {
  getProfile: () => sitterRepository.getProfile as Mock,
};

// ── Job fixtures ──────────────────────────────────────────────────────────────

export function makeJob(overrides: DeepPartial<{ id: string; ownerId: string; status: string; rating: number | null }> = {}) {
  return {
    id: "job-1",
    ownerId: "owner-1",
    status: "OPEN",
    rating: null,
    ...overrides,
  };
}

// ── Sitter profile fixtures ───────────────────────────────────────────────────

export function makeApprovedSitter(overrides: { isBanned?: boolean } = {}) {
  return { verificationStatus: "APPROVED", isBanned: false, ...overrides };
}

export function makePendingSitter() {
  return { verificationStatus: "PENDING", isBanned: false };
}

export function makeRejectedSitter() {
  return { verificationStatus: "REJECTED", isBanned: false };
}

// ── Common mock reset ─────────────────────────────────────────────────────────

export function resetMocks() {
  vi.clearAllMocks();
  // Default no-op resolves for write operations
  mockJobPost.update().mockResolvedValue({});
  mockJobPost.updateMany().mockResolvedValue({ count: 0 });
  mockApplication.upsert().mockResolvedValue({});
  mockApplication.updateMany().mockResolvedValue({ count: 0 });
}
