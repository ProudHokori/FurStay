import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../src/lib/validations/auth";

describe("auth validation", () => {
  it("accepts valid login data", () => {
    const parsed = loginSchema.safeParse({ email: "owner@test.com", password: "123456" });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const parsed = registerSchema.safeParse({ name: "A", email: "bad", password: "123", role: "OWNER" });
    expect(parsed.success).toBe(false);
  });
});
