"use server";

import { redirect } from "next/navigation";
import { loginUser, logoutUser, registerUser } from "@/lib/auth-service";
import { homeForRole } from "@/lib/route-helpers";

export type AuthActionState = {
  error: string;
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const result = await loginUser(formData);

  if (result.error) {
    return { error: result.error ?? "Authentication failed"};
  }

  if (!result.role) {
    return { error: "Authentication failed" };
  }

  redirect(homeForRole(result.role));
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const result = await registerUser(formData);

  if (result.error) {
    return { error: result.error ?? "Registration failed"};
  }

  if (!result.role) {
    return { error: "Registration failed" };
  }

  redirect(homeForRole(result.role));
}

export async function logoutAction() {
  await logoutUser();
  redirect("/login");
}