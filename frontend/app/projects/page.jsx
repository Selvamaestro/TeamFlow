"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../dashboard/dashboard.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { projectService } from "../../services/projectService";
import { clientService } from "../../services/clientService";
import api from "@/lib/api";
import {
    LayoutDashboard,
    Users,
    IndianRupee,
    FolderKanban,
    CalendarDays,
    MessageSquare,
    Building2,
    Settings,
    LogOut,
    Search,
    Bell,
    CircleHelp,
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
    const [user, setUser] = useState(null);

    // Live MongoDB Projects state
    const [projects, setProjects] = useState([]);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Fetch live projects and clients from MongoDB database
    useEffect(() => {
        async function fetchDbProjects() {
            setIsLoading(true);
            try {
                // Fetch logged-in user info
                api.get("/auth/me").then(res => {
                    if (res?.data?.user) setUser(res.data.user);
                    if (res?.data?.user?.role === "hr") {
                        router.replace("/projects/create");
                    }
                }).catch(() => null);

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
                            progress: typeof p.progress === "number" ? p.progress : (p.status === "completed" ? 100 : 0),
                            dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "Dec 2026",
                            actionLabel: "View Details",
                            category: p.status === "archived" ? "archived" : "active",
                            starred: true,
                            revenue: p.revenue ? `₹${Number(p.revenue).toLocaleString()}` : "₹50,000"
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

    const handleArchiveProject = async (e, projectId, projectTitle) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await projectService.updateProject(projectId, { status: "archived" });
            setProjects(prev =>
                prev.map(p =>
                    p.id === projectId
                        ? { ...p, category: "archived", status: "Archived", statusType: "yellow" }
                        : p
                )
            );
        } catch (err) {
            console.warn("Archive project notice:", err.message);
        }
    };

    const handleRestoreProject = async (e, projectId, projectTitle) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await projectService.updateProject(projectId, { status: "in_progress" });
            setProjects(prev =>
                prev.map(p =>
                    p.id === projectId
                        ? { ...p, category: "active", status: "In Progress", statusType: "blue" }
                        : p
                )
            );
        } catch (err) {
            console.warn("Restore project notice:", err.message);
        }
    };

    const handleOpenDeleteModal = (e, projectId, projectTitle) => {
        e.preventDefault();
        e.stopPropagation();
        setProjectToDelete({ id: projectId, title: projectTitle });
    };

    const handleConfirmDeleteProject = async () => {
        if (!projectToDelete) return;
        setIsDeleting(true);
        try {
            await projectService.deleteProject(projectToDelete.id);
            setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
        } catch (err) {
            console.warn("Delete project notice:", err.message);
        } finally {
            setIsDeleting(false);
            setProjectToDelete(null);
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

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar active="projects" />

            {/* Main Content Area */}
            <div className="main-content">
                <Navbar
                    user={user}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search database projects, clients..."
                    helpText="Projects Hub — View, create, and manage active corporate initiatives, contract revenues, team leads, and project milestones."
                />

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
                            <h3>Projects</h3>
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
                                        <span className="badge yellow" style={{ fontSize: "11px", padding: "2px 8px", background: "#fef3c7", color: "#d97706" }}>
                                            {projects.filter(p => p.category === "archived").length}
                                        </span>
                                    </div>
                                </li>
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
                                    <span className="badge green">Live MongoDB Data</span>
                                </div>
                                <p style={{ color: "#666", fontSize: "16px" }}>
                                    Overview of all corporate projects.
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
                                                {p.category === "active" ? (
                                                    <button
                                                        onClick={(e) => handleArchiveProject(e, p.id, p.title)}
                                                        title="Archive Project"
                                                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                                                    >
                                                        <Archive size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleRestoreProject(e, p.id, p.title)}
                                                        title="Restore Project to Active"
                                                        style={{ background: "none", border: "none", color: "#169c52", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                                                    >
                                                        <Folder size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleOpenDeleteModal(e, p.id, p.title)}
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

            {/* Custom Delete Confirmation Popup Modal */}
            {projectToDelete && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    padding: "20px"
                }}>
                    <div style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "28px",
                        maxWidth: "440px",
                        width: "100%",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        textAlign: "center"
                    }}>
                        <div style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "50%",
                            background: "#fee2e2",
                            color: "#dc2626",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px"
                        }}>
                            <Trash2 size={26} />
                        </div>
                        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>
                            Delete Project
                        </h3>
                        <p style={{ fontSize: "15px", color: "#475569", marginBottom: "24px", lineHeight: "1.5" }}>
                            Do you want to delete the <strong>{projectToDelete.title}</strong>?
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={() => setProjectToDelete(null)}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    padding: "10px 20px",
                                    borderRadius: "10px",
                                    border: "1px solid #cbd5e1",
                                    background: "#ffffff",
                                    color: "#334155",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    cursor: isDeleting ? "not-allowed" : "pointer"
                                }}
                            >
                                No
                            </button>
                            <button
                                onClick={handleConfirmDeleteProject}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    padding: "10px 20px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#ffffff",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    cursor: isDeleting ? "not-allowed" : "pointer"
                                }}
                            >
                                {isDeleting ? "Deleting..." : "Yes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
