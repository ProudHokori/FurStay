"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input name="email" type="email" placeholder="owner@furstay.local" required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <Input name="password" type="password" required />
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Login"}
      </Button>
    </form>
  );
}