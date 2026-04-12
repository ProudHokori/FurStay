/**
 * FurStay – Business Logic Integration Tests
 *
 * Layer under test: lib/services  (Service layer — pure business logic)
 * Mocked:          lib/prisma, lib/repositories/sitter-repository
 *
 * Scenarios
 * ─────────
 * 1. Sitter Verification Gate   (sitter-service → applyForJob)
 * 2. Job State Machine          (job-service: select → payment → completion)
 * 3. Rating System              (job-service → rateJob)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("@/lib/repositories/sitter-repository", () => ({
  sitterRepository: { getProfile: vi.fn(), upsertProfile: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    jobPost: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    jobApplication: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

// ── Subject under test ────────────────────────────────────────────────────────

import { applyForJob } from "@/lib/services/sitter-service";
import { selectSitter, confirmPayment, confirmCompletion, rateJob } from "@/lib/services/job-service";
import {
  makeJob, makeApprovedSitter, makePendingSitter, makeRejectedSitter,
  mockJobPost, mockApplication, mockSitterRepo, resetMocks,
} from "./helpers/mocks";

// ─────────────────────────────────────────────────────────────────────────────

describe("1. Sitter Verification Gate — applyForJob", () => {
  beforeEach(resetMocks);

  it("BLOCKS: no sitter profile", async () => {
    mockSitterRepo.getProfile().mockResolvedValue(null);
    await expect(applyForJob("sitter-1", "job-1", "")).rejects.toThrow("You must be verified to apply for jobs.");
    expect(mockApplication.upsert()).not.toHaveBeenCalled();
  });

  it("BLOCKS: status PENDING", async () => {
    mockSitterRepo.getProfile().mockResolvedValue(makePendingSitter());
    await expect(applyForJob("sitter-1", "job-1", "")).rejects.toThrow("You must be verified to apply for jobs.");
  });

  it("BLOCKS: status REJECTED", async () => {
    mockSitterRepo.getProfile().mockResolvedValue(makeRejectedSitter());
    await expect(applyForJob("sitter-1", "job-1", "")).rejects.toThrow("You must be verified to apply for jobs.");
  });

  it("BLOCKS: APPROVED but banned", async () => {
    mockSitterRepo.getProfile().mockResolvedValue(makeApprovedSitter({ isBanned: true }));
    await expect(applyForJob("sitter-1", "job-1", "")).rejects.toThrow("Your account has been suspended.");
    expect(mockApplication.upsert()).not.toHaveBeenCalled();
  });

  it("BLOCKS: job is not OPEN", async () => {
    mockSitterRepo.getProfile().mockResolvedValue(makeApprovedSitter());
    mockJobPost.findUnique().mockResolvedValue(makeJob({ status: "FUNDED" }));
    await expect(applyForJob("sitter-1", "job-1", "")).rejects.toThrow("This job is no longer accepting applications.");
    expect(mockApplication.upsert()).not.toHaveBeenCalled();
  });

  it("ALLOWS: APPROVED + not banned + OPEN job", async () => {
    mockSitterRepo.getProfile().mockResolvedValue(makeApprovedSitter());
    mockJobPost.findUnique().mockResolvedValue(makeJob({ status: "OPEN" }));

    await applyForJob("sitter-1", "job-1", "I can help!");

    expect(mockApplication.upsert()).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobPostId_sitterId: { jobPostId: "job-1", sitterId: "sitter-1" } },
        create: expect.objectContaining({ jobPostId: "job-1", sitterId: "sitter-1" }),
      })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("2. Job State Machine", () => {
  beforeEach(resetMocks);

  describe("2a. OPEN → WAITING (selectSitter)", () => {
    it("transitions to WAITING and marks selected application ACCEPTED", async () => {
      mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "OPEN" }));

      await selectSitter("owner-1", "job-1", "sitter-1");

      expect(mockJobPost.update()).toHaveBeenCalledWith(
        expect.objectContaining({ data: { selectedSitterId: "sitter-1", status: "WAITING" } })
      );
      expect(mockApplication.updateMany()).toHaveBeenCalledWith(
        expect.objectContaining({ where: { jobPostId: "job-1", sitterId: "sitter-1" }, data: { status: "ACCEPTED" } })
      );
    });

    it("THROWS if job is not OPEN", async () => {
      mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "WAITING" }));
      await expect(selectSitter("owner-1", "job-1", "sitter-1")).rejects.toThrow("Job is no longer open.");
    });

    it("does NOT reject other applications yet — only after payment (FUNDED)", async () => {
      mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "OPEN" }));

      await selectSitter("owner-1", "job-1", "sitter-1");

      // updateMany called exactly once — ACCEPTED only, never REJECTED at this stage
      expect(mockApplication.updateMany()).toHaveBeenCalledOnce();
      expect(mockApplication.updateMany()).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "REJECTED" } })
      );
    });
  });

  describe("2b. WAITING → FUNDED (confirmPayment)", () => {
    it("transitions to FUNDED and rejects all remaining PENDING applications", async () => {
      mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "WAITING" }));

      await confirmPayment("owner-1", "job-1");

      expect(mockJobPost.update()).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "FUNDED" } })
      );
      expect(mockApplication.updateMany()).toHaveBeenCalledWith(
        expect.objectContaining({ where: { jobPostId: "job-1", status: "PENDING" }, data: { status: "REJECTED" } })
      );
    });

    it("THROWS if job is not WAITING", async () => {
      mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "OPEN" }));
      await expect(confirmPayment("owner-1", "job-1")).rejects.toThrow("Job is not awaiting payment.");
    });
  });

  describe("2c. IN_PROGRESS → COMPLETED (confirmCompletion)", () => {
    it("transitions to COMPLETED", async () => {
      mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "IN_PROGRESS" }));

      await confirmCompletion("owner-1", "job-1");

      expect(mockJobPost.update()).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "job-1" }, data: { status: "COMPLETED" } })
      );
    });

    it("THROWS if job is not IN_PROGRESS (bug fixed — was silent fail)", async () => {
      mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "FUNDED" }));
      await expect(confirmCompletion("owner-1", "job-1")).rejects.toThrow("Job is not in progress.");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("3. Rating System — rateJob", () => {
  beforeEach(resetMocks);

  it("ALLOWS: rating 1–5 on a COMPLETED unrated job", async () => {
    mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "COMPLETED", rating: null }));

    await rateJob("owner-1", "job-1", 5);

    expect(mockJobPost.update()).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "job-1" }, data: { rating: 5 } })
    );
  });

  it.each([
    ["below range", 0],
    ["above range", 6],
    ["decimal", 3.5],
  ])("BLOCKS: %s (%d)", async (_label, value) => {
    await expect(rateJob("owner-1", "job-1", value)).rejects.toThrow("Rating must be 1–5.");
    expect(mockJobPost.update()).not.toHaveBeenCalled();
  });

  it("BLOCKS: job is not COMPLETED", async () => {
    mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "IN_PROGRESS", rating: null }));
    await expect(rateJob("owner-1", "job-1", 4)).rejects.toThrow("Can only rate a completed job.");
  });

  it("BLOCKS: job not found / owner mismatch", async () => {
    mockJobPost.findFirst().mockResolvedValue(null);
    await expect(rateJob("owner-1", "job-1", 4)).rejects.toThrow("Job not found.");
  });

  it("BLOCKS: job already rated", async () => {
    mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "COMPLETED", rating: 3 }));
    await expect(rateJob("owner-1", "job-1", 5)).rejects.toThrow("Job already rated.");
  });

  it("accepts all boundary values 1–5", async () => {
    for (const score of [1, 2, 3, 4, 5]) {
      mockJobPost.findFirst().mockResolvedValue(makeJob({ status: "COMPLETED", rating: null }));
      await expect(rateJob("owner-1", "job-1", score)).resolves.toBeUndefined();
    }
    expect(mockJobPost.update()).toHaveBeenCalledTimes(5);
  });
});
