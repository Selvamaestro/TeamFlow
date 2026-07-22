"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
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
    UploadCloud,
    MessageCircle,
    Check,
    ChevronRight,
    User,
    Calendar,
    X,
    FileText,
    Plus
} from "lucide-react";

export default function CreateProjectPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [createChatGroup, setCreateChatGroup] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        clientName: "",
        clientEmail: "",
        teamLeader: "",
        dueDate: "",
    });

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
            const filesArr = Array.from(e.dataTransfer.files).map(f => f.name);
            setUploadedFiles(prev => [...prev, ...filesArr]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            const filesArr = Array.from(e.target.files).map(f => f.name);
            setUploadedFiles(prev => [...prev, ...filesArr]);
        }
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);

            setTimeout(() => {
                router.push("/projects");
            }, 1200);
        }, 1200);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">
                    <h2>AdminSuite</h2>
                    <p>Enterprise Suite</p>
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

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search resources..."
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

                {/* Body Content */}
                <div className="dashboard">
                    {/* Breadcrumb Navigation */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                        <Link href="/projects" style={{ color: "#002045", textDecoration: "none", fontWeight: 600 }}>
                            Projects
                        </Link>
                        <ChevronRight size={16} />
                        <span style={{ color: "#777" }}>Create New Project</span>
                    </div>

                    <div className="title" style={{ marginBottom: "35px" }}>
                        <h1>Create New Project</h1>
                        <p>Initialize a new venture by providing core details, assigning a lead, and setting milestones.</p>
                    </div>

                    {/* Form Container */}
                    <div className="dashboard-form-card" style={{ maxWidth: "950px" }}>
                        <form onSubmit={handleSubmit} className="form-grid">
                            <div className="form-group full-width">
                                <label>Project Title</label>
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
                                    <option value="Aether Global Corp">Aether Global Corp</option>
                                    <option value="Horizon Solutions">Horizon Solutions</option>
                                    <option value="Pinnacle Innovations">Pinnacle Innovations</option>
                                    <option value="Stellar Tech Group">Stellar Tech Group</option>
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
                                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                                    <option value="Marcus Vane">Marcus Vane</option>
                                    <option value="Elena Rodriguez">Elena Rodriguez</option>
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

                            {/* Drag & Drop Upload */}
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
                                    <p style={{ fontWeight: 600, color: "#002045", margin: 0 }}>Click or drag and drop to upload files</p>
                                    <span style={{ fontSize: "13px", color: "#777" }}>PDF, DOCX, XLSX (max 50MB per file)</span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileInput}
                                        style={{ display: "none" }}
                                        id="create-file-input"
                                    />
                                    <label
                                        htmlFor="create-file-input"
                                        className="dashboard-btn-secondary"
                                        style={{ marginTop: "10px" }}
                                    >
                                        Browse Files
                                    </label>
                                </div>

                                {uploadedFiles.length > 0 && (
                                    <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                        {uploadedFiles.map((fn, idx) => (
                                            <div key={idx} style={{ background: "#eef4ff", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", color: "#002045", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <FileText size={14} />
                                                <span>{fn}</span>
                                                <X size={14} style={{ cursor: "pointer" }} onClick={() => removeFile(idx)} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Toggle Section */}
                            <div className="form-group full-width" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #eee" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <div className="icon-box project-icon">
                                        <MessageCircle size={22} color="#002045" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "15px", color: "#002045", margin: 0 }}>Create background group chat for this project</h4>
                                        <p style={{ fontSize: "13px", color: "#777", margin: "4px 0 0" }}>Automatically add team members to a secure Slack channel</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={createChatGroup}
                                    onChange={(e) => setCreateChatGroup(e.target.checked)}
                                    style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#002045" }}
                                />
                            </div>

                            {/* Actions */}
                            <div className="form-group full-width" style={{ flexDirection: "row", justifyContent: "flex-end", gap: "15px", paddingTop: "25px", borderTop: "1px solid #eee" }}>
                                <button
                                    type="button"
                                    className="dashboard-btn-secondary"
                                    onClick={() => router.push("/projects")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="dashboard-btn-primary"
                                >
                                    {isSubmitting ? "Processing..." : submitSuccess ? "Success! Redirecting..." : "Initialize Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
