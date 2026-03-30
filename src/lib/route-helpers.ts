import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";

export function homeForRole(role: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "SITTER") return "/sitter";
  return "/owner";
}

export function redirectToRoleHome(role: Role) {
  redirect(homeForRole(role));
}
