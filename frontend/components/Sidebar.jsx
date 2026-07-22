"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    DollarSign,
    FolderKanban,
    CalendarDays,
    MessageSquare,
    Building2,
    Settings,
    LogOut,
    Plus
} from "lucide-react";

export default function Sidebar({ active = "employees" }) {
    return (
        <aside className="sidebar">
            <div className="logo">
                <h2>AdminPanel</h2>
                <p>Management Suite</p>
            </div>

            <nav className="menu">
                <Link href="/dashboard" className={active === "dashboard" ? "active" : ""}>
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                <Link href="/employees" className={active === "employees" ? "active" : ""}>
                    <Users size={20} />
                    Employees
                </Link>

                <a href="#" className={active === "revenue" ? "active" : ""}>
                    <DollarSign size={20} />
                    Revenue
                </a>

                <Link href="/projects" className={active === "projects" ? "active" : ""}>
                    <FolderKanban size={20} />
                    Projects
                </Link>

                <Link href="/attendance" className={active === "attendance" ? "active" : ""}>
                    <CalendarDays size={20} />
                    Attendance
                </Link>

                <a href="#" className={active === "chat" ? "active" : ""}>
                    <MessageSquare size={20} />
                    Chat
                </a>

                <Link href="/clients" className={active === "clients" ? "active" : ""}>
                    <Building2 size={20} />
                    Clients
                </Link>
            </nav>

            <div className="sidebar-bottom">
                <Link href="/employees/add" className="project-btn" style={{ textDecoration: "none" }}>
                    <Plus size={18} />
                    Add Employee
                </Link>

                <a href="#">
                    <Settings size={18} />
                    Settings
                </a>

                <a href="/login" style={{ color: "#ef4444" }}>
                    <LogOut size={18} />
                    Logout
                </a>
            </div>
        </aside>
    );
}
