"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/profile", icon: "person", label: "Profile" },
  { to: "/chat", icon: "chat", label: "Chat" },
  { to: "/projects", icon: "assignment", label: "Projects" },
  { to: "/attendance", icon: "calendar_today", label: "Attendance" },
  { to: "/rewards", icon: "military_tech", label: "Reward" },
];

function NavItem({ to, icon, label, isActive }) {
  return (
    <Link
      href={to}
      className={[
        "px-4 py-3 flex items-center gap-3 transition-all active:scale-95 rounded-r-lg",
        isActive
          ? "bg-secondary-container text-on-secondary-container border-l-4 border-primary"
          : "text-on-surface-variant hover:bg-surface-container-high border-l-4 border-transparent",
      ].join(" ")}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-label-md text-label-md">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 border-r border-outline-variant bg-surface-container-low w-sidebar-width shrink-0">
      <div className="p-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined">corporate_fare</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">ESS Portal</h1>
            <p className="text-label-sm text-on-surface-variant">Employee Workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} isActive={pathname === item.to} />
        ))}
      </nav>

      <div className="p-4">
        <Link
          href="/attendance"
          className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          New Request
        </Link>
      </div>

      <div className="px-4 py-6 border-t border-outline-variant space-y-2">
        <a
          href="mailto:it-support@workforceconnect.com"
          className="text-on-surface-variant hover:bg-surface-container-high px-4 py-2 flex items-center gap-3 rounded-lg"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-label-md">Help</span>
        </a>
        <button
          onClick={handleLogout}
          className="w-full text-left text-on-surface-variant hover:bg-surface-container-high px-4 py-2 flex items-center gap-3 rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md">Logout</span>
        </button>
      </div>
    </aside>
  );
}
