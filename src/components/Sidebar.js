"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Briefcase,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  LogOut,
  User,
  ChevronRight,
  Star,
  DollarSign,
  Menu,
  X,
} from "lucide-react";

const clientNav = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/post-task", label: "Post a Task", icon: PlusCircle },
  { href: "/client/tasks", label: "My Tasks", icon: ClipboardList },
];

const taskerNav = [
  { href: "/tasker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Browse Tasks", icon: ClipboardList },
  { href: "/tasker/proposals", label: "My Proposals", icon: Star },
  { href: "/tasker/tasks", label: "Assigned Tasks", icon: Briefcase },
  { href: "/tasker/earnings", label: "Earnings", icon: DollarSign },
];

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: User },
  { href: "/admin/tasks", label: "All Tasks", icon: ClipboardList },
  { href: "/admin/transactions", label: "Transactions", icon: DollarSign },
];

export default function Sidebar({ role }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems =
    role === "CLIENT"
      ? clientNav
      : role === "TASKER"
      ? taskerNav
      : adminNav;

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0f172a] border-b border-white/10 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-extrabold text-white">Task<span className="text-[#60a5fa]">Bridge</span></span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="text-blue-300 hover:text-white p-1"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-screen bg-[#0f172a] flex flex-col border-r border-white/10
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white">Task<span className="text-[#60a5fa]">Bridge</span></span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-blue-300 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-6 py-3 border-b border-white/10">
          <span className="text-xs font-semibold text-[#60a5fa] uppercase tracking-wider">
            {role}
          </span>
          <p className="text-white font-medium text-sm mt-0.5 truncate">
            {session?.user?.name}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#2563eb]/20 text-white border border-[#2563eb]/40"
                    : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User / logout */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#94a3b8] hover:bg-white/5 hover:text-white transition-all"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#94a3b8] hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
