/**
 * FurStay – Business Logic Integration Tests
 * Layer under test: lib/actions  (Logic layer)
 * Mocked:          lib/prisma, lib/repositories/sitter-repository, lib/session,
 *                  next/cache, next/navigation
 *
 * Scenarios
 * ─────────
 * 1. Sitter Verification Gate   (applyJobAction)
 * 2. Job State Machine          (select → payment → completion)
 * 3. Rating System              (rateJobAction)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Module mocks (hoisted by Vitest before any import) ──────────────────────
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("@/lib/session", () => ({
  requireRole: vi.fn(),
}));

vi.mock("@/lib/repositories/sitter-repository", () => ({
  sitterRepository: {
    getProfile: vi.fn(),
    upsertProfile: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    jobPost: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    jobApplication: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

// ── Imports (after mocks are registered) ────────────────────────────────────
import { applyJobAction } from "@/lib/actions/sitter-actions";
import {
  selectSitterAction,
  confirmPaymentAction,
  confirmCompletionAction,
  rateJobAction,
} from "@/lib/actions/owner-actions";
import { requireRole } from "@/lib/session";
import { sitterRepository } from "@/lib/repositories/sitter-repository";
import { prisma } from "@/lib/prisma";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fd(data: Record<string, string>): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, v));
  return form;
}

const OWNER_SESSION = { sub: "owner-1", name: "Test Owner", role: "OWNER" };
const SITTER_SESSION = { sub: "sitter-1", name: "Test Sitter", role: "SITTER" };

// ── Test suites ──────────────────────────────────────────────────────────────

describe("1. Sitter Verification Gate — applyJobAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue(SITTER_SESSION as never);
  });

  it("BLOCKS: sitter has no profile", async () => {
    vi.mocked(sitterRepository.getProfile).mockResolvedValue(null);

    const result = await applyJobAction(null, fd({ jobPostId: "job-1" }));

    expect(result).toEqual({ error: "You must be verified to apply for jobs." });
    expect(prisma.jobApplication.upsert).not.toHaveBeenCalled();
  });

  it("BLOCKS: sitter status is PENDING", async () => {
    vi.mocked(sitterRepository.getProfile).mockResolvedValue({
      verificationStatus: "PENDING",
      isBanned: false,
    } as never);

    const result = await applyJobAction(null, fd({ jobPostId: "job-1" }));

    expect(result).toEqual({ error: "You must be verified to apply for jobs." });
    expect(prisma.jobApplication.upsert).not.toHaveBeenCalled();
  });

  it("BLOCKS: sitter status is REJECTED", async () => {
    vi.mocked(sitterRepository.getProfile).mockResolvedValue({
      verificationStatus: "REJECTED",
      isBanned: false,
    } as never);

    const result = await applyJobAction(null, fd({ jobPostId: "job-1" }));

    expect(result).toEqual({ error: "You must be verified to apply for jobs." });
    expect(prisma.jobApplication.upsert).not.toHaveBeenCalled();
  });

  it("BLOCKS: sitter is APPROVED but BANNED", async () => {
    vi.mocked(sitterRepository.getProfile).mockResolvedValue({
      verificationStatus: "APPROVED",
      isBanned: true,
    } as never);

    const result = await applyJobAction(null, fd({ jobPostId: "job-1" }));

    expect(result).toEqual({ error: "Your account has been suspended." });
    expect(prisma.jobApplication.upsert).not.toHaveBeenCalled();
  });

  it("BLOCKS: job is no longer OPEN", async () => {
    vi.mocked(sitterRepository.getProfile).mockResolvedValue({
      verificationStatus: "APPROVED",
      isBanned: false,
    } as never);
    vi.mocked(prisma.jobPost.findUnique).mockResolvedValue({
      status: "FUNDED",
    } as never);

    const result = await applyJobAction(null, fd({ jobPostId: "job-1" }));

    expect(result).toEqual({ error: "This job is no longer accepting applications." });
    expect(prisma.jobApplication.upsert).not.toHaveBeenCalled();
  });

  it("ALLOWS: APPROVED, not banned, job OPEN → creates application", async () => {
    vi.mocked(sitterRepository.getProfile).mockResolvedValue({
      verificationStatus: "APPROVED",
      isBanned: false,
    } as never);
    vi.mocked(prisma.jobPost.findUnique).mockResolvedValue({
      status: "OPEN",
    } as never);
    vi.mocked(prisma.jobApplication.upsert).mockResolvedValue({} as never);

    const result = await applyJobAction(null, fd({ jobPostId: "job-1", message: "I can help!" }));

    expect(result).toEqual({ success: true });
    expect(prisma.jobApplication.upsert).toHaveBeenCalledOnce();
    expect(prisma.jobApplication.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobPostId_sitterId: { jobPostId: "job-1", sitterId: "sitter-1" } },
        create: expect.objectContaining({ jobPostId: "job-1", sitterId: "sitter-1" }),
      })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("2. Job State Machine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue(OWNER_SESSION as never);
  });

  describe("2a. OPEN → WAITING  (selectSitterAction)", () => {
    it("transitions job to WAITING and marks selected application ACCEPTED", async () => {
      vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
        id: "job-1",
        status: "OPEN",
        ownerId: "owner-1",
      } as never);
      vi.mocked(prisma.jobPost.update).mockResolvedValue({} as never);
      vi.mocked(prisma.jobApplication.updateMany).mockResolvedValue({ count: 1 } as never);

      await selectSitterAction(fd({ jobPostId: "job-1", sitterId: "sitter-1" }));

      // Job must move to WAITING with selectedSitterId set
      expect(prisma.jobPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "job-1" },
          data: { selectedSitterId: "sitter-1", status: "WAITING" },
        })
      );

      // Selected sitter's application → ACCEPTED
      expect(prisma.jobApplication.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { jobPostId: "job-1", sitterId: "sitter-1" },
          data: { status: "ACCEPTED" },
        })
      );
    });

    it("THROWS if job is not OPEN", async () => {
      vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
        id: "job-1",
        status: "WAITING",
        ownerId: "owner-1",
      } as never);

      await expect(
        selectSitterAction(fd({ jobPostId: "job-1", sitterId: "sitter-1" }))
      ).rejects.toThrow("Job is no longer open.");
    });

    it("DOES NOT reject other applications yet — only after payment", async () => {
      vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
        id: "job-1",
        status: "OPEN",
        ownerId: "owner-1",
      } as never);
      vi.mocked(prisma.jobPost.update).mockResolvedValue({} as never);
      vi.mocked(prisma.jobApplication.updateMany).mockResolvedValue({ count: 1 } as never);

      await selectSitterAction(fd({ jobPostId: "job-1", sitterId: "sitter-1" }));

      // updateMany should only be called once — for ACCEPTED, not for REJECTED
      expect(prisma.jobApplication.updateMany).toHaveBeenCalledOnce();
      expect(prisma.jobApplication.updateMany).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "REJECTED" } })
      );
    });
  });

  describe("2b. WAITING → FUNDED  (confirmPaymentAction)", () => {
    it("transitions job to FUNDED and rejects all remaining PENDING applications", async () => {
      vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
        id: "job-1",
        status: "WAITING",
        ownerId: "owner-1",
      } as never);
      vi.mocked(prisma.jobPost.update).mockResolvedValue({} as never);
      vi.mocked(prisma.jobApplication.updateMany).mockResolvedValue({ count: 2 } as never);

      await confirmPaymentAction(fd({ jobPostId: "job-1" }));

      // Job status → FUNDED
      expect(prisma.jobPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "job-1" },
          data: { status: "FUNDED" },
        })
      );

      // Remaining PENDING applications → REJECTED
      expect(prisma.jobApplication.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { jobPostId: "job-1", status: "PENDING" },
          data: { status: "REJECTED" },
        })
      );
    });

    it("THROWS if job is not in WAITING state", async () => {
      vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
        id: "job-1",
        status: "OPEN",
        ownerId: "owner-1",
      } as never);

      await expect(
        confirmPaymentAction(fd({ jobPostId: "job-1" }))
      ).rejects.toThrow("Job is not awaiting payment.");
    });
  });

  describe("2c. IN_PROGRESS → COMPLETED  (confirmCompletionAction)", () => {
    it("transitions job to COMPLETED", async () => {
      vi.mocked(prisma.jobPost.updateMany).mockResolvedValue({ count: 1 } as never);

      await confirmCompletionAction(fd({ jobPostId: "job-1" }));

      expect(prisma.jobPost.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "job-1", ownerId: "owner-1", status: "IN_PROGRESS" },
          data: { status: "COMPLETED" },
        })
      );
    });

    /**
     * ⚠️  KNOWN BEHAVIOR: confirmCompletionAction uses updateMany with a WHERE
     * clause that includes status: "IN_PROGRESS". If the job is not IN_PROGRESS,
     * Prisma silently updates 0 rows — no error is thrown to the caller.
     * This means invalid state transitions fail silently.
     *
     * Recommendation: add a findFirst guard (like selectSitterAction does) and
     * throw an explicit error if the job is not IN_PROGRESS.
     */
    it("SILENT FAIL (known behavior): does NOT throw when job is not IN_PROGRESS", async () => {
      vi.mocked(prisma.jobPost.updateMany).mockResolvedValue({ count: 0 } as never);

      // Should not throw — this documents the silent-fail behaviour
      await expect(
        confirmCompletionAction(fd({ jobPostId: "job-1" }))
      ).resolves.toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("3. Rating System — rateJobAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue(OWNER_SESSION as never);
  });

  it("ALLOWS: submits rating for a COMPLETED, unrated job", async () => {
    vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
      id: "job-1",
      status: "COMPLETED",
      ownerId: "owner-1",
      rating: null,
    } as never);
    vi.mocked(prisma.jobPost.update).mockResolvedValue({} as never);

    await rateJobAction(fd({ jobPostId: "job-1", rating: "5" }));

    expect(prisma.jobPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "job-1" },
        data: { rating: 5 },
      })
    );
  });

  it("BLOCKS: rating < 1 (value 0)", async () => {
    await expect(
      rateJobAction(fd({ jobPostId: "job-1", rating: "0" }))
    ).rejects.toThrow("Rating must be 1–5.");
    expect(prisma.jobPost.update).not.toHaveBeenCalled();
  });

  it("BLOCKS: rating > 5 (value 6)", async () => {
    await expect(
      rateJobAction(fd({ jobPostId: "job-1", rating: "6" }))
    ).rejects.toThrow("Rating must be 1–5.");
    expect(prisma.jobPost.update).not.toHaveBeenCalled();
  });

  it("BLOCKS: non-integer rating (decimal)", async () => {
    await expect(
      rateJobAction(fd({ jobPostId: "job-1", rating: "3.5" }))
    ).rejects.toThrow("Rating must be 1–5.");
    expect(prisma.jobPost.update).not.toHaveBeenCalled();
  });

  it("BLOCKS: job is not COMPLETED", async () => {
    vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
      id: "job-1",
      status: "IN_PROGRESS",
      ownerId: "owner-1",
      rating: null,
    } as never);

    await expect(
      rateJobAction(fd({ jobPostId: "job-1", rating: "4" }))
    ).rejects.toThrow("Can only rate a completed job.");
    expect(prisma.jobPost.update).not.toHaveBeenCalled();
  });

  it("BLOCKS: job not found (owner mismatch)", async () => {
    vi.mocked(prisma.jobPost.findFirst).mockResolvedValue(null);

    await expect(
      rateJobAction(fd({ jobPostId: "job-1", rating: "4" }))
    ).rejects.toThrow("Can only rate a completed job.");
    expect(prisma.jobPost.update).not.toHaveBeenCalled();
  });

  it("BLOCKS: job is already rated", async () => {
    vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
      id: "job-1",
      status: "COMPLETED",
      ownerId: "owner-1",
      rating: 3,
    } as never);

    await expect(
      rateJobAction(fd({ jobPostId: "job-1", rating: "5" }))
    ).rejects.toThrow("Job already rated.");
    expect(prisma.jobPost.update).not.toHaveBeenCalled();
  });

  it("accepts all boundary values 1–5", async () => {
    vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
      id: "job-1",
      status: "COMPLETED",
      ownerId: "owner-1",
      rating: null,
    } as never);
    vi.mocked(prisma.jobPost.update).mockResolvedValue({} as never);

    for (const score of [1, 2, 3, 4, 5]) {
      vi.mocked(prisma.jobPost.findFirst).mockResolvedValue({
        id: "job-1",
        status: "COMPLETED",
        ownerId: "owner-1",
        rating: null,
      } as never);
      await expect(
        rateJobAction(fd({ jobPostId: "job-1", rating: String(score) }))
      ).resolves.toBeUndefined();
    }

    expect(prisma.jobPost.update).toHaveBeenCalledTimes(5);
  });
});
