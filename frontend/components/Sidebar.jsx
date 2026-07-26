"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    IndianRupee,
    FolderKanban,
    CalendarDays,
    MessageSquare,
    Building2,
    LogOut,
    Plus
} from "lucide-react";
import api from "@/lib/api";

export default function Sidebar({ active = "employees" }) {
    // Seed from the cached user (set at login) so the menu doesn't flash the
    // full set before we can confirm the role, then re-verify against the API.
    const [role, setRole] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const cachedUser = JSON.parse(localStorage.getItem("user") || "null");
                if (cachedUser?.role) {
                    setRole(cachedUser.role);
                }
            } catch (err) {
                console.warn("Failed to read cached user role:", err);
            }
        }

        api.get("/auth/me")
            .then((res) => setRole(res.data?.user?.role || null))
            .catch(() => {});
    }, []);

    const isCeo = role === "ceo";
    const isManager = role === "manager";
    const isHr = role === "hr";
    // HR's admin-panel access is intentionally scoped to attendance, employee
    // management, and creating projects — not general project oversight,
    // revenue, chat, or the client list.
    const isRestrictedToHrScope = isHr;

    const handleLogout = (e) => {
        e.preventDefault();
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("teamflow_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
    };

    return (
        <aside className="sidebar">
            <div className="logo">
                <h2>AdminPanel</h2>
                <p>Management Suite</p>
            </div>

            <nav className="menu">
                {!isRestrictedToHrScope && (
                    <Link href="/dashboard" className={active === "dashboard" ? "active" : ""}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                )}

                <Link href="/employees" className={active === "employees" ? "active" : ""}>
                    <Users size={20} />
                    Employees
                </Link>

                {/* Revenue: CEO only — hidden for Manager and everyone else */}
                {isCeo && (
                    <Link href="/revenue" className={active === "revenue" ? "active" : ""}>
                        <IndianRupee size={20} />
                        Revenue
                    </Link>
                )}

                {isRestrictedToHrScope ? (
                    <Link href="/projects/create" className={active === "projects" ? "active" : ""}>
                        <FolderKanban size={20} />
                        Create Project
                    </Link>
                ) : (
                    <Link href="/projects" className={active === "projects" ? "active" : ""}>
                        <FolderKanban size={20} />
                        Projects
                    </Link>
                )}

                <Link href="/attendance" className={active === "attendance" ? "active" : ""}>
                    <CalendarDays size={20} />
                    Attendance
                </Link>

                {!isRestrictedToHrScope && (
                    <Link href="/chat" className={active === "chat" ? "active" : ""}>
                        <MessageSquare size={20} />
                        Chat
                    </Link>
                )}

                {!isRestrictedToHrScope && (
                    <Link href="/clients" className={active === "clients" ? "active" : ""}>
                        <Building2 size={20} />
                        Clients
                    </Link>
                )}
            </nav>

            <div className="sidebar-bottom">
                <Link href="/employees/add" className="project-btn" style={{ textDecoration: "none", color: "#ffffff", fontWeight: 600 }}>
                    <Plus size={18} color="#ffffff" />
                    Add Employee
                </Link>

                <a href="/login" onClick={handleLogout} style={{ color: "#ef4444", cursor: "pointer" }}>
                    <LogOut size={18} />
                    Logout
                </a>
            </div>
        </aside>
    );
}
