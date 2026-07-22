"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../dashboard/dashboard.css";
import Sidebar from "@/components/Sidebar";
import { projectService } from "../../services/projectService";
import { clientService } from "../../services/clientService";
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
    Archive,
    CheckCircle2,
    Trash2,
    Shield
} from "lucide-react";

export default function ProjectsPage() {
    const [selectedCategory, setSelectedCategory] = useState("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Live MongoDB Projects state
    const [projects, setProjects] = useState([]);

    // Fetch live projects and clients from MongoDB database
    useEffect(() => {
        async function fetchDbProjects() {
            setIsLoading(true);
            try {
                // Fetch clients map first
                const clientMap = {};
                const clientRes = await clientService.getClients().catch(() => null);
                if (clientRes?.clients && Array.isArray(clientRes.clients)) {
                    clientRes.clients.forEach(c => {
                        clientMap[c._id] = c.company || c.name;
                    });
                }

                // Fetch projects from backend database
                const res = await projectService.getProjects();
                if (res && res.projects && Array.isArray(res.projects)) {
                    const mappedProjects = res.projects.map(p => {
                        const clientName = typeof p.client === "object"
                            ? (p.client.company || p.client.name)
                            : (clientMap[p.client] || "Enterprise Client");

                        const statusText = p.status ? (p.status.charAt(0).toUpperCase() + p.status.slice(1)) : "In Progress";
                        const statusType = p.status === "completed" ? "green" : p.status === "delayed" ? "red" : "blue";

                        const leadName = typeof p.teamLeader === "object" && p.teamLeader
                            ? (p.teamLeader.name || p.teamLeader.email)
                            : "Unassigned Lead";

                        const leadAvatar = typeof p.teamLeader === "object" && p.teamLeader?.avatarUrl
                            ? p.teamLeader.avatarUrl
                            : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80";

                        return {
                            id: p._id || p.id,
                            title: p.title || "Project Initiative",
                            client: clientName,
                            lead: leadName,
                            leadAvatar: leadAvatar,
                            status: statusText,
                            statusType: statusType,
                            progress: p.status === "completed" ? 100 : 65,
                            dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "Dec 2026",
                            actionLabel: "View Details",
                            category: p.status === "archived" ? "archived" : "active",
                            starred: true,
                            revenue: p.revenue ? `$${Number(p.revenue).toLocaleString()}` : "$50,000"
                        };
                    });

                    setProjects(mappedProjects);
                }
            } catch (err) {
                console.warn("Database projects fetch info:", err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDbProjects();
    }, []);

    const handleDeleteProject = async (e, projectId, projectTitle) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete project "${projectTitle}" permanently from MongoDB database?`)) {
            try {
                await projectService.deleteProject(projectId);
                setProjects(prev => prev.filter(p => p.id !== projectId));
            } catch (err) {
                console.warn("Delete project notice:", err.message);
            }
        }
    };

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
            <Sidebar active="projects" />

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
                            placeholder="Search database projects, clients..."
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
                            <h3>Database Projects</h3>
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
                                        {selectedCategory === "active" ? "Active Initiatives (MongoDB)" : "Archived Projects"}
                                    </h1>
                                    <span className="badge green">Live MongoDB Data</span>
                                </div>
                                <p style={{ color: "#666", fontSize: "16px" }}>
                                    Overview of all corporate projects retrieved dynamically from your backend MongoDB database.
                                </p>
                            </div>

                        </div>

                        {/* PROJECTS GRID */}
                        {isLoading ? (
                            <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>
                                Loading projects from MongoDB database...
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div style={{ padding: "60px", textAlign: "center", color: "#777", background: "#fff", borderRadius: "16px" }}>
                                <FolderKanban size={48} color="#002045" style={{ marginBottom: "15px", opacity: 0.5 }} />
                                <h2>No Projects Found in MongoDB Database</h2>
                                <p style={{ margin: "10px 0 20px" }}>Initialize a new project to track deliverables and milestones.</p>
                                <Link href="/projects/create" className="dashboard-btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
                                    <Plus size={16} /> Create First Project
                                </Link>
                            </div>
                        ) : (
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

                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "20px 0", color: "#002045", fontSize: "14px", fontWeight: 500 }}>
                                            <Shield size={16} color="#002045" />
                                            <span>Lead: <strong>{p.lead}</strong></span>
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

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "15px", borderTop: "1px solid #eee" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#777" }}>
                                                <Calendar size={15} /> {p.dueDate}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <button
                                                    onClick={(e) => handleDeleteProject(e, p.id, p.title)}
                                                    title="Delete Project"
                                                    style={{ background: "none", border: "none", color: "#d63031", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <Link href={`/projects/${p.id}`} style={{ textDecoration: "none", color: p.statusType === "red" ? "#d63031" : "#002045", fontWeight: "bold", fontSize: "14px" }}>
                                                    {p.actionLabel} &rarr;
                                                </Link>
                                            </div>
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
