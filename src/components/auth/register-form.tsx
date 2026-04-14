"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const initialState = { error: "" };

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label
          className="block text-sm font-semibold"
          style={{ color: "var(--fur-dark)" }}
        >
          Full name
        </label>
        <Input name="name" placeholder="Your name" required />
      </div>

      <div className="space-y-1.5">
        <label
          className="block text-sm font-semibold"
          style={{ color: "var(--fur-dark)" }}
        >
          Email
        </label>
        <Input name="email" type="email" placeholder="you@example.com" required />
      </div>

      <div className="space-y-1.5">
        <label
          className="block text-sm font-semibold"
          style={{ color: "var(--fur-dark)" }}
        >
          Password
        </label>
        <Input name="password" type="password" placeholder="••••••••" required />
      </div>

      <div className="space-y-1.5">
        <label
          className="block text-sm font-semibold"
          style={{ color: "var(--fur-dark)" }}
        >
          I am a…
        </label>
        <Select name="role" defaultValue="OWNER">
          <option value="OWNER">Pet Owner — I want to find a sitter</option>
          <option value="SITTER">Pet Sitter — I want to find work</option>
        </Select>
      </div>

      {state?.error ? (
        <div
          className="rounded-[var(--radius-sm)] px-3 py-2 text-sm"
          style={{
            backgroundColor: "color-mix(in srgb, var(--danger) 10%, var(--surface-2))",
            color: "color-mix(in srgb, var(--danger) 70%, #000)",
            border: "1px solid color-mix(in srgb, var(--danger) 30%, transparent)",
          }}
        >
          {state.error}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 font-semibold"
      >
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
