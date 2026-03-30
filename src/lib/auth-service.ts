import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export async function loginUser(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials" };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { error: "Invalid email or password" };

  const matches = await bcrypt.compare(parsed.data.password, user.password);
  if (!matches) return { error: "Invalid email or password" };

  await createSession({ sub: user.id, role: user.role, email: user.email, name: user.name });
  return { role: user.role };
}

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid registration data" };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email is already registered" };

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
    },
  });

  if (user.role === "SITTER") {
    await prisma.sitterProfile.create({ data: { userId: user.id } });
  }

  await createSession({ sub: user.id, role: user.role, email: user.email, name: user.name });
  return { role: user.role };
}

export async function logoutUser() {
  await clearSession();
}
