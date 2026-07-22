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
    CircleHelp,
    Plus,
    UploadCloud,
    Check,
    FileText,
    MessageCircle,
    X,
    Filter,
    MoreVertical
} from "lucide-react";

export default function ProjectsPage() {
    const [activeTab, setActiveTab] = useState("create"); // "create" or "list"
    const [filterCategory, setFilterCategory] = useState("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [createChatGroup, setCreateChatGroup] = useState(true);

    // Form data state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        clientName: "",
        clientEmail: "",
        teamLeader: "",
        dueDate: "",
    });

    // Sample initial project list for the "All Projects" view
    const [projectsList, setProjectsList] = useState([
        {
            id: 1,
            title: "Infrastructure Alpha",
            client: "Global Dynamics Inc.",
            leader: "Alex Mercer",
            dueDate: "Oct 24, 2024",
            status: "On Track",
            progress: 78,
            budget: "$120,000",
            category: "active"
        },
        {
            id: 2,
            title: "Cloud Migration V2",
            client: "Stratosphere Systems",
            leader: "Sarah Jenkins",
            dueDate: "Nov 15, 2024",
            status: "At Risk",
            progress: 45,
            budget: "$85,000",
            category: "in-progress"
        },
        {
            id: 3,
            title: "CRISPR Dashboard",
            client: "Lumina Bio-Tech",
            leader: "Marcus Vane",
            dueDate: "Dec 01, 2024",
            status: "Delayed",
            progress: 30,
            budget: "$210,000",
            category: "in-progress"
        },
        {
            id: 4,
            title: "CRM Integration",
            client: "Apex Real Estate",
            leader: "Elena Rodriguez",
            dueDate: "Jan 10, 2025",
            status: "On Track",
            progress: 92,
            budget: "$45,000",
            category: "completed"
        }
    ]);

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const newFiles = Array.from(e.dataTransfer.files).map(f => f.name);
            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            const newFiles = Array.from(e.target.files).map(f => f.name);
            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);

            if (formData.title) {
                setProjectsList(prev => [
                    {
                        id: Date.now(),
                        title: formData.title,
                        client: formData.clientName || "General Client",
                        leader: formData.teamLeader || "Alex Mercer",
                        dueDate: formData.dueDate || "Nov 30, 2024",
                        status: "On Track",
                        progress: 10,
                        budget: "$95,000",
                        category: "active"
                    },
                    ...prev
                ]);
            }

            setTimeout(() => {
                setSubmitSuccess(false);
                setFormData({
                    title: "",
                    description: "",
                    clientName: "",
                    clientEmail: "",
                    teamLeader: "",
                    dueDate: "",
                });
                setUploadedFiles([]);
            }, 2500);
        }, 1200);
    };

    const filteredProjects = projectsList.filter(p => {
        if (filterCategory === "all") return true;
        if (filterCategory === "active") return p.status === "On Track";
        if (filterCategory === "in-progress") return p.status === "At Risk" || p.status === "Delayed";
        if (filterCategory === "completed") return p.status === "Completed" || p.progress >= 90;
        return true;
    });

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">
                    <h2>AdminPanel</h2>
                    <p>Management Suite</p>
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
                    <button className="project-btn" onClick={() => setActiveTab("create")}>
                        <Plus size={18} />
                        New Project
                    </button>

                    <a href="#">
                        <Settings size={18} />
                        Settings
                    </a>
                    <a href="#">
                        <LogOut size={18} />
                        Logout
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects, leaders, clients..."
                        />
                    </div>

                    <div className="header-right">
                        <Bell className="icons" />
                        <CircleHelp className="icons" />

                        <div className="profile">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                alt="Alex Thompson"
                            />
                            <div>
                                <h4>Alex Thompson</h4>
                                <span>Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Page Body */}
                <div className="dashboard">
                    <div className="title-actions">
                        <div className="title">
                            <h1>{activeTab === "create" ? "Create New Project" : "Projects Management"}</h1>
                            <p>
                                {activeTab === "create"
                                    ? "Initialize a new venture by providing core details, assigning a lead, and setting milestones."
                                    : "Overview of all active enterprise projects, deliverables, and milestone statuses."
                                }
                            </p>
                        </div>

                        <div className="tab-switcher">
                            <button
                                onClick={() => setActiveTab("create")}
                                className={activeTab === "create" ? "tab-active" : ""}
                            >
                                + Create Project
                            </button>
                            <button
                                onClick={() => setActiveTab("list")}
                                className={activeTab === "list" ? "tab-active" : ""}
                            >
                                All Projects ({projectsList.length})
                            </button>
                        </div>
                    </div>

                    {/* TAB 1: CREATE PROJECT FORM */}
                    {activeTab === "create" && (
                        <div className="dashboard-form-card">
                            <form onSubmit={handleSubmit} className="form-grid">
                                <div className="form-group full-width">
                                    <label>Project Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Q4 Global Market Analysis"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Project Description</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the project goals, scope, and key deliverables..."
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Client Name</label>
                                    <select
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    >
                                        <option value="">Select a client</option>
                                        <option value="Global Dynamics Inc.">Global Dynamics Inc.</option>
                                        <option value="Stratosphere Systems">Stratosphere Systems</option>
                                        <option value="Lumina Bio-Tech">Lumina Bio-Tech</option>
                                        <option value="Apex Real Estate">Apex Real Estate</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Client Email</label>
                                    <input
                                        type="email"
                                        value={formData.clientEmail}
                                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                        placeholder="contact@client.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Team Leader</label>
                                    <select
                                        value={formData.teamLeader}
                                        onChange={(e) => setFormData({ ...formData, teamLeader: e.target.value })}
                                    >
                                        <option value="">Assign a leader</option>
                                        <option value="Sarah Jenkins">Sarah Jenkins (Engineering)</option>
                                        <option value="Marcus Vane">Marcus Vane (Product Lead)</option>
                                        <option value="Elena Rodriguez">Elena Rodriguez (Marketing)</option>
                                        <option value="Alex Mercer">Alex Mercer (Operations)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>

                                {/* Drag & Drop Documents */}
                                <div className="form-group full-width">
                                    <label>Project Documents</label>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        className={`drop-zone ${dragActive ? "active" : ""}`}
                                    >
                                        <UploadCloud size={36} color="#002045" />
                                        <p style={{ fontWeight: 600, color: "#002045" }}>Click or drag and drop to upload files</p>
                                        <span style={{ fontSize: "13px", color: "#777" }}>PDF, DOCX, XLSX (max 50MB per file)</span>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileInput}
                                            style={{ display: "none" }}
                                            id="file-upload-input"
                                        />
                                        <label
                                            htmlFor="file-upload-input"
                                            className="dashboard-btn-secondary"
                                            style={{ marginTop: "10px" }}
                                        >
                                            Browse Files
                                        </label>
                                    </div>

                                    {uploadedFiles.length > 0 && (
                                        <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                            {uploadedFiles.map((filename, idx) => (
                                                <div key={idx} style={{ background: "#eef4ff", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", color: "#002045", display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <FileText size={14} />
                                                    <span>{filename}</span>
                                                    <X size={14} style={{ cursor: "pointer" }} onClick={() => removeFile(idx)} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Toggle */}
                                <div className="form-group full-width" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "18px 24px", borderRadius: "12px", border: "1px solid #eee" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                        <div className="icon-box project-icon">
                                            <MessageCircle size={22} color="#002045" />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: "15px", color: "#002045" }}>Create background group chat for this project</h4>
                                            <p style={{ fontSize: "13px", color: "#777" }}>Automatically add team members to a secure project channel</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={createChatGroup}
                                        onChange={(e) => setCreateChatGroup(e.target.checked)}
                                        style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#002045" }}
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="form-group full-width" style={{ flexDirection: "row", justifyContent: "flex-end", gap: "15px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
                                    <button
                                        type="button"
                                        className="dashboard-btn-secondary"
                                        onClick={() => setActiveTab("list")}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="dashboard-btn-primary"
                                    >
                                        {isSubmitting ? "Processing..." : submitSuccess ? "Project Initialized!" : "Initialize Project"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 2: ALL PROJECTS LIST */}
                    {activeTab === "list" && (
                        <div style={{ marginTop: "30px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "18px 25px", borderRadius: "14px", boxShadow: "0 5px 20px rgba(0, 0, 0, 0.05)", marginBottom: "25px" }}>
                                <div className="tab-switcher">
                                    <button onClick={() => setFilterCategory("all")} className={filterCategory === "all" ? "tab-active" : ""}>All ({projectsList.length})</button>
                                    <button onClick={() => setFilterCategory("active")} className={filterCategory === "active" ? "tab-active" : ""}>On Track</button>
                                    <button onClick={() => setFilterCategory("in-progress")} className={filterCategory === "in-progress" ? "tab-active" : ""}>Needs Attention</button>
                                    <button onClick={() => setFilterCategory("completed")} className={filterCategory === "completed" ? "tab-active" : ""}>Completed</button>
                                </div>
                                <button className="dashboard-btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                                    <Filter size={14} /> Filter
                                </button>
                            </div>

                            <div className="kpi-grid">
                                {filteredProjects.map((p) => (
                                    <div key={p.id} className="kpi-card">
                                        <div className="card-top">
                                            <div className="icon-box project-icon">
                                                <FolderKanban size={24} color="#002045" />
                                            </div>
                                            <span className={`badge ${p.status === "On Track" ? "green" : "yellow"}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <div className="card-title">{p.client}</div>
                                        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>{p.title}</h2>
                                        
                                        <div style={{ marginBottom: "15px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#666", marginBottom: "6px" }}>
                                                <span>Progress</span>
                                                <span style={{ fontWeight: "bold", color: "#002045" }}>{p.progress}%</span>
                                            </div>
                                            <div className="progress">
                                                <div className="progress-fill employee-progress" style={{ width: `${p.progress}%` }}></div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", justifyBetween: "space-between", paddingTop: "15px", borderTop: "1px solid #eee", fontSize: "13px", color: "#666" }}>
                                            <div>
                                                <span>Lead: </span>
                                                <strong style={{ color: "#002045" }}>{p.leader}</strong>
                                            </div>
                                            <div>
                                                <span>Due: </span>
                                                <strong style={{ color: "#002045" }}>{p.dueDate}</strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
