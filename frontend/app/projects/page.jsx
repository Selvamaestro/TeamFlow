"use client";

import { useState } from "react";
import Link from "next/link";
import "../dashboard/dashboard.css";
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
    Search,
    Bell,
    Mail,
    Plus,
    Calendar,
    Star,
    Folder,
    Archive
} from "lucide-react";

export default function ProjectsPage() {
    const [selectedCategory, setSelectedCategory] = useState("active");
    const [searchQuery, setSearchQuery] = useState("");

    // Main Projects List matching admin_project.html
    const [projects] = useState([
        {
            id: 1,
            title: "Q4 Logistics Revamp",
            client: "SwiftShip Logistics",
            lead: "Marcus J.",
            leadAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            status: "In Progress",
            statusType: "blue",
            progress: 65,
            dueDate: "Dec 15, 2023",
            actionLabel: "View Details",
            category: "active",
            starred: true
        },
        {
            id: 2,
            title: "Global ERP Integration",
            client: "TerraCorp Industries",
            lead: "Sarah Chen",
            leadAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
            status: "Completed",
            statusType: "green",
            progress: 100,
            dueDate: "Oct 28, 2023",
            actionLabel: "View Archive",
            category: "active",
            starred: true
        },
        {
            id: 3,
            title: "Mobile Banking UX",
            client: "Apex Bank",
            lead: "Elena Rodriguez",
            leadAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
            status: "Delayed",
            statusType: "red",
            progress: 42,
            dueDate: "Nov 10, 2023",
            actionLabel: "Review Blockers",
            category: "active",
            starred: false
        },
        {
            id: 4,
            title: "Hiring Dashboard V2",
            client: "Internal Operations",
            lead: "Alex Mercer",
            leadAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80",
            status: "In Progress",
            statusType: "blue",
            progress: 80,
            dueDate: "Jan 15, 2024",
            actionLabel: "View Details",
            category: "active",
            starred: true
        },
        {
            id: 5,
            title: "Legacy System Migration",
            client: "OldGuard Inc.",
            lead: "David Miller",
            leadAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            status: "Archived",
            statusType: "gray",
            progress: 100,
            dueDate: "Jun 20, 2023",
            actionLabel: "View Details",
            category: "archived",
            starred: false
        }
    ]);

    const filteredProjects = projects.filter(p => {
        const matchesCategory =
            selectedCategory === "active" ? p.category === "active" :
            selectedCategory === "archived" ? p.category === "archived" : true;
        const matchesSearch =
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.lead.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const starredProjects = projects.filter(p => p.starred);

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">
                    <h2>AdminSuite</h2>
                    <p>Enterprise Management</p>
                </div>

                <nav className="menu">
                    <Link href="/dashboard">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <a href="#">
                        <Users size={20} />
                        Employees
                    </a>

                    <a href="#">
                        <DollarSign size={20} />
                        Revenue
                    </a>

                    <Link href="/projects" className="active">
                        <FolderKanban size={20} />
                        Projects
                    </Link>

                    <Link href="/attendance">
                        <CalendarDays size={20} />
                        Attendance
                    </Link>

                    <a href="#">
                        <MessageSquare size={20} />
                        Chat
                    </a>

                    <Link href="/clients">
                        <Building2 size={20} />
                        Clients
                    </Link>
                </nav>

                <div className="sidebar-bottom">
                    <Link href="/projects/create" className="project-btn" style={{ textDecoration: "none" }}>
                        <Plus size={18} />
                        New Project
                    </Link>

                    <a href="#">
                        <Settings size={18} />
                        System Settings
                    </a>
                    <a href="#">
                        <LogOut size={18} />
                        Logout
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects, clients..."
                        />
                    </div>

                    <div className="header-right">
                        <Bell className="icons" />
                        <Mail className="icons" />

                        <div className="profile">
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80"
                                alt="Alex Mercer"
                            />
                            <div>
                                <h4>Alex Mercer</h4>
                                <span>CEO &amp; Product Head</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Body Layout with Secondary Nested Panel */}
                <div style={{ display: "flex", paddingTop: "80px", minHeight: "100vh" }}>
                    {/* SECONDARY NESTED PANEL */}
                    <aside className="secondary-panel">
                        <Link
                            href="/projects/create"
                            className="dashboard-btn-primary"
                            style={{ width: "100%", justifyCenter: "center", padding: "14px", textDecoration: "none" }}
                        >
                            <Plus size={18} /> Create Project
                        </Link>

                        <div>
                            <h3>All Projects</h3>
                            <ul className="secondary-nav-list">
                                <li>
                                    <div
                                        onClick={() => setSelectedCategory("active")}
                                        className={`secondary-nav-item ${selectedCategory === "active" ? "active" : ""}`}
                                    >
                                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Folder size={18} /> Active Initiatives
                                        </span>
                                        <span className="badge green" style={{ fontSize: "11px", padding: "2px 8px" }}>
                                            {projects.filter(p => p.category === "active").length}
                                        </span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        onClick={() => setSelectedCategory("archived")}
                                        className={`secondary-nav-item ${selectedCategory === "archived" ? "active" : ""}`}
                                    >
                                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Archive size={18} /> Archived
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3>Important Projects</h3>
                            <ul className="secondary-nav-list">
                                {starredProjects.map(p => (
                                    <li key={p.id}>
                                        <div className="secondary-nav-item">
                                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <Star size={16} fill="#f4c430" stroke="#f4c430" />
                                                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "160px" }}>
                                                    {p.title}
                                                </span>
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* CANVAS AREA */}
                    <div style={{ flex: 1, padding: "35px 40px", overflowY: "auto", background: "#f8fafc" }}>
                        {/* Detail View Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                    <h1 style={{ color: "#002045", fontSize: "36px", margin: 0 }}>
                                        {selectedCategory === "active" ? "Active Initiatives" : "Archived Projects"}
                                    </h1>
                                    <span className="badge green">In Progress</span>
                                </div>
                                <p style={{ color: "#666", fontSize: "16px" }}>
                                    Overview of all high-priority corporate projects currently in development phase.
                                </p>
                            </div>

                            {/* Avatars */}
                            <div className="avatars">
                                <span style={{ backgroundImage: "url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80)", backgroundSize: "cover" }}></span>
                                <span style={{ backgroundImage: "url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80)", backgroundSize: "cover" }}></span>
                                <span style={{ backgroundImage: "url(https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80)", backgroundSize: "cover" }}></span>
                                <div className="more">+8</div>
                            </div>
                        </div>

                        {/* PROJECTS GRID */}
                        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                            {filteredProjects.map((p) => (
                                <div key={p.id} className="kpi-card">
                                    <div className="card-top">
                                        <div>
                                            <h3 style={{ color: "#002045", fontSize: "20px", marginBottom: "4px" }}>{p.title}</h3>
                                            <span style={{ fontSize: "13px", color: "#777" }}>Client: {p.client}</span>
                                        </div>
                                        <span className={`badge ${p.statusType === "green" ? "green" : p.statusType === "red" ? "yellow" : "badge"}`} style={{ background: p.statusType === "red" ? "#ffeaea" : undefined, color: p.statusType === "red" ? "#d63031" : undefined }}>
                                            {p.status}
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                                        <img src={p.leadAvatar} alt={p.lead} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                                        <span style={{ fontSize: "14px", color: "#333", fontWeight: 500 }}>Lead: {p.lead}</span>
                                    </div>

                                    <div style={{ marginBottom: "20px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#666", marginBottom: "6px" }}>
                                            <span>Progress</span>
                                            <strong style={{ color: p.statusType === "red" ? "#d63031" : "#002045" }}>{p.progress}%</strong>
                                        </div>
                                        <div className="progress">
                                            <div
                                                className="progress-fill employee-progress"
                                                style={{
                                                    width: `${p.progress}%`,
                                                    background: p.statusType === "green" ? "#169c52" : p.statusType === "red" ? "#d63031" : "#002045"
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", paddingTop: "15px", borderTop: "1px solid #eee" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#777" }}>
                                            <Calendar size={15} /> {p.dueDate}
                                        </div>
                                        <button style={{ background: "none", border: "none", color: p.statusType === "red" ? "#d63031" : "#002045", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
                                            {p.actionLabel}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Dashed New Initiative Card Slot */}
                            <Link
                                href="/projects/create"
                                className="kpi-card"
                                style={{
                                    border: "2px dashed #cbd5e1",
                                    boxShadow: "none",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    minHeight: "240px",
                                    background: "#fff",
                                    textDecoration: "none"
                                }}
                            >
                                <div className="icon-box project-icon" style={{ marginBottom: "15px" }}>
                                    <Plus size={28} color="#002045" />
                                </div>
                                <h3 style={{ color: "#002045", fontSize: "18px", marginBottom: "4px" }}>New Initiative</h3>
                                <p style={{ color: "#777", fontSize: "13px" }}>Start a new project workflow</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
