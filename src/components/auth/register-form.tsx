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
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input name="name" required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <Input name="password" type="password" required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Role</label>
        <Select name="role" defaultValue="OWNER">
          <option value="OWNER">Pet Owner</option>
          <option value="SITTER">Pet Sitter</option>
        </Select>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}