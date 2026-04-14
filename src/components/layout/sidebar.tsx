"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  PawPrint,
  Briefcase,
  UserCircle,
  List,
  ClipboardList,
  ShieldCheck,
  Flag,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import type { Role } from "@/generated/prisma/enums";

type NavItem = { href: string; label: string; icon: React.ElementType };

const navByRole: Record<Role, NavItem[]> = {
  OWNER: [
    { href: "/owner", label: "Overview", icon: LayoutDashboard },
    { href: "/owner/pets", label: "Pets", icon: PawPrint },
    { href: "/owner/jobs", label: "Jobs", icon: Briefcase },
  ],
  SITTER: [
    { href: "/sitter", label: "Overview", icon: LayoutDashboard },
    { href: "/sitter/profile", label: "Profile", icon: UserCircle },
    { href: "/sitter/jobs", label: "Job Board", icon: List },
    { href: "/sitter/assignments", label: "Assignments", icon: ClipboardList },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/verifications", label: "Sitter Verifications", icon: ShieldCheck },
    { href: "/admin/jobs", label: "Jobs Moderation", icon: Flag },
    { href: "/admin/sitters", label: "Sitters Moderation", icon: Users },
  ],
};

const avatarByRole: Record<Role, string> = {
  OWNER: "/pet_owner_female.png",
  SITTER: "/pet_sitter_male.png",
  ADMIN: "/pet_admin_female.png",
};

const roleLabelByRole: Record<Role, string> = {
  OWNER: "Pet Owner",
  SITTER: "Pet Sitter",
  ADMIN: "Administrator",
};

export function Sidebar({ role, name }: { role: Role; name: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = navByRole[role];
  const avatar = avatarByRole[role];
  const roleLabel = roleLabelByRole[role];

  const activeHref = navItems
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <aside
      style={{
        backgroundColor: "var(--fur-dark)",
        borderRight: "1px solid var(--fur-brown)",
        width: collapsed ? "68px" : "240px",
      }}
      className="relative flex flex-col h-screen sticky top-0 flex-shrink-0 transition-all duration-300 ease-in-out"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          backgroundColor: "var(--fur-clay)",
          color: "var(--fur-ivory)",
        }}
        className="
          absolute -right-3 top-7 z-20
          flex h-6 w-6 items-center justify-center
          rounded-full shadow-lg
          hover:opacity-90 active:scale-95
          transition-all duration-150
        "
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Logo */}
      <div
        style={{ borderBottom: "1px solid color-mix(in srgb, var(--fur-beige) 15%, transparent)" }}
        className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center px-3" : ""}`}
      >
        <div className="relative flex-shrink-0 h-8 w-8">
          <Image src="/paw-symbol.png" alt="FurStay" fill className="object-contain" />
        </div>
        {!collapsed && (
          <span
            style={{ color: "var(--fur-beige)" }}
            className="font-bold text-lg tracking-wide whitespace-nowrap"
          >
            FurStay
          </span>
        )}
      </div>

      {/* User avatar + info */}
      <div
        style={{ borderBottom: "1px solid color-mix(in srgb, var(--fur-beige) 15%, transparent)" }}
        className={`flex items-center gap-3 px-3 py-4 ${collapsed ? "justify-center" : ""}`}
      >
        <div
          style={{ outline: "2px solid var(--fur-clay)", outlineOffset: "2px" }}
          className="relative flex-shrink-0 h-10 w-10 rounded-full overflow-hidden"
        >
          <Image src={avatar} alt={name} fill className="object-cover object-top scale-110" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p style={{ color: "var(--fur-cream)" }} className="font-semibold text-sm truncate leading-tight">
              {name}
            </p>
            <p style={{ color: "var(--fur-beige)", opacity: 0.7 }} className="text-xs mt-0.5 truncate">
              {roleLabel}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === activeHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--fur-clay)",
                      color: "var(--fur-ivory)",
                      boxShadow: "0 4px 12px rgba(79, 61, 51, 0.3)",
                    }
                  : { color: "var(--fur-beige)" }
              }
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                transition-all duration-150 group
                ${collapsed ? "justify-center" : ""}
                ${!isActive ? "hover:bg-[color-mix(in_srgb,var(--fur-beige)_12%,transparent)] hover:text-[var(--fur-cream)]" : ""}
              `}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 transition-transform duration-150 ${!isActive ? "group-hover:scale-110" : ""}`}
              />
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
              {!collapsed && isActive && (
                <span
                  style={{ backgroundColor: "var(--fur-cream)" }}
                  className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        style={{ borderTop: "1px solid color-mix(in srgb, var(--fur-beige) 15%, transparent)" }}
        className="p-2"
      >
        <form action={logoutAction}>
          <button
            suppressHydrationWarning
            title={collapsed ? "Logout" : undefined}
            style={{ color: "var(--fur-beige)", opacity: 0.6 }}
            className={`
              flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm
              transition-all duration-150 group
              hover:bg-[color-mix(in_srgb,var(--danger)_20%,transparent)]
              hover:!text-[var(--danger)] hover:!opacity-100
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut
              size={18}
              className="flex-shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5"
            />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
          <div className="pb-15"></div>
        </form>
      </div>
    </aside>
  );
}
