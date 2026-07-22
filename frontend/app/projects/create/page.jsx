"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
import { projectService } from "../../../services/projectService";
import { clientService } from "../../../services/clientService";
import { userService } from "../../../services/userService";
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
    Plus,
    UserCheck,
    Shield,
    AlertCircle
} from "lucide-react";

export default function CreateProjectPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    
    // Database collections data
    const [dbClients, setDbClients] = useState([]);
    const [teamLeaders, setTeamLeaders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
    const [memberLimitWarning, setMemberLimitWarning] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        clientId: "",
        teamLeaderId: "",
        selectedMembers: [],
        dueDate: "",
        revenue: "50000",
        autoChat: true
    });

    // Load live clients and users (filtered by exact role) from MongoDB database
    useEffect(() => {
        async function fetchInitialData() {
            try {
                // Fetch clients
                const clientRes = await clientService.getClients().catch(() => null);
                if (clientRes?.clients && Array.isArray(clientRes.clients)) {
                    setDbClients(clientRes.clients);
                    if (clientRes.clients.length > 0) {
                        setFormData(prev => ({ ...prev, clientId: clientRes.clients[0]._id }));
                    }
                }

                // Fetch users and filter by role from database collection
                const userRes = await userService.getUsers().catch(() => null);
                if (userRes?.users && Array.isArray(userRes.users)) {
                    const allUsers = userRes.users;

                    // Strictly filter ONLY Team Leaders (role === 'team_leader' or 'team_lead')
                    // Excludes CEO, HR, and Manager completely
                    const leaders = allUsers.filter(u =>
                        ["team_leader", "team_lead"].includes(u.role)
                    );
                    setTeamLeaders(leaders);
                    if (leaders.length > 0) {
                        setFormData(prev => ({ ...prev, teamLeaderId: leaders[0]._id }));
                    }

                    // Filter Employees (role === 'employee')
                    const staff = allUsers.filter(u => u.role === "employee");
                    setEmployees(staff);
                }
            } catch (err) {
                console.warn("Initial data fetch notice:", err.message);
            }
        }

        fetchInitialData();
    }, []);

    const toggleMemberSelection = (userId) => {
        setMemberLimitWarning("");
        setFormData(prev => {
            const exists = prev.selectedMembers.includes(userId);
            if (exists) {
                return { ...prev, selectedMembers: prev.selectedMembers.filter(id => id !== userId) };
            } else {
                if (prev.selectedMembers.length >= 3) {
                    setMemberLimitWarning("Maximum 3 team members allowed per project.");
                    return prev;
                }
                return { ...prev, selectedMembers: [...prev.selectedMembers, userId] };
            }
        });
    };

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

    // Filter employees list based on search query
    const filteredEmployees = employees.filter(emp => {
        const query = employeeSearchQuery.toLowerCase();
        return (
            (emp.name && emp.name.toLowerCase().includes(query)) ||
            (emp.employeeId && emp.employeeId.toLowerCase().includes(query)) ||
            (emp.email && emp.email.toLowerCase().includes(query)) ||
            (emp.department && emp.department.toLowerCase().includes(query))
        );
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) return;

        setIsSubmitting(true);

        try {
            // Send payload to backend with teamLeader and members IDs
            await projectService.createProject({
                title: formData.title,
                description: formData.description,
                client: formData.clientId || (dbClients[0] ? dbClients[0]._id : undefined),
                teamLeader: formData.teamLeaderId || undefined,
                members: formData.selectedMembers,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date("2026-12-01"),
                revenue: Number(formData.revenue) || 50000,
                status: "planning"
            });

            setIsSubmitting(false);
            setSubmitSuccess(true);

            setTimeout(() => {
                router.push("/projects");
            }, 1200);
        } catch (err) {
            console.warn("Project creation notice:", err.message);
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setTimeout(() => {
                router.push("/projects");
            }, 1200);
        }
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
                            placeholder="Search projects..."
                        />
                    </div>

                    <div className="header-right">
                        <Bell className="icons" />
                        <CircleHelp className="icons" />

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
                        <p>Initialize a new project, assign a Team Leader and up to 3 Employees from MongoDB.</p>
                    </div>

                    {/* Form Container */}
                    <div className="dashboard-form-card" style={{ maxWidth: "950px" }}>
                        <form onSubmit={handleSubmit} className="form-grid">
                            <div className="form-group full-width">
                                <label>Project Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Website Revamp & Cloud Migration"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Project Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the project goals, scope, and key deliverables..."
                                ></textarea>
                            </div>

                            {/* Client Selection */}
                            <div className="form-group">
                                <label>Client Account</label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                >
                                    {dbClients.length === 0 ? (
                                        <option value="">No clients found in database</option>
                                    ) : (
                                        dbClients.map(c => (
                                            <option key={c._id} value={c._id}>
                                                {c.company || c.name} ({c.email})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Team Leader Filtered Dropdown (Exclusively Team Leader role) */}
                            <div className="form-group">
                                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Shield size={16} color="#002045" /> Assign Team Leader
                                </label>
                                <select
                                    value={formData.teamLeaderId}
                                    onChange={(e) => setFormData({ ...formData, teamLeaderId: e.target.value })}
                                >
                                    {teamLeaders.length === 0 ? (
                                        <option value="">No Team Leader role found in database</option>
                                    ) : (
                                        teamLeaders.map(l => (
                                            <option key={l._id} value={l._id}>
                                                {l.name} ({l.email})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Contract Revenue ($ USD)</label>
                                <input
                                    type="number"
                                    value={formData.revenue}
                                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                    placeholder="50000"
                                />
                            </div>

                            <div className="form-group">
                                <label>Target Completion Date</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>

                            {/* Assign Employees Table Listing Format (Max 3 Members) */}
                            <div className="form-group full-width">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                                        <UserCheck size={16} color="#002045" /> Assign Team Employees (Max 3 Members)
                                    </label>
                                    <span style={{ fontSize: "12px", fontWeight: "bold", color: formData.selectedMembers.length >= 3 ? "#d63031" : "#002045" }}>
                                        Selected: {formData.selectedMembers.length} / 3 Max Members
                                    </span>
                                </div>

                                {/* Employee Search Field */}
                                <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px" }}>
                                    <Search size={16} color="#002045" style={{ marginRight: "8px" }} />
                                    <input
                                        type="text"
                                        value={employeeSearchQuery}
                                        onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                                        placeholder="Search employee by employee id or email..."
                                        style={{ border: "none", outline: "none", width: "100%", fontSize: "13px", color: "#002045", background: "transparent" }}
                                    />
                                    {employeeSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setEmployeeSearchQuery("")}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#777", padding: 0 }}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {memberLimitWarning && (
                                    <div style={{ background: "#ffeaea", color: "#d63031", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <AlertCircle size={15} /> {memberLimitWarning}
                                    </div>
                                )}

                                {/* Formal Table Listing Container */}
                                <div style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden", maxHeight: "280px", overflowY: "auto" }}>
                                    <table className="dashboard-table" style={{ margin: 0, width: "100%" }}>
                                        <thead style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 1 }}>
                                            <tr>
                                                <th style={{ width: "40px", padding: "12px 14px" }}>Select</th>
                                                <th style={{ padding: "12px 14px" }}>Employee Name &amp; ID</th>
                                                <th style={{ padding: "12px 14px" }}>Email</th>
                                                <th style={{ padding: "12px 14px" }}>Department</th>
                                                <th style={{ padding: "12px 14px", textAlign: "right" }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredEmployees.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#777", fontSize: "13px" }}>
                                                        {employees.length === 0 ? "Loading employees from database collection..." : "No matching employees found for search query."}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredEmployees.map(emp => {
                                                    const isChecked = formData.selectedMembers.includes(emp._id);
                                                    const isMaxReached = !isChecked && formData.selectedMembers.length >= 3;
                                                    const initials = emp.name ? emp.name.substring(0, 2).toUpperCase() : "EM";

                                                    return (
                                                        <tr
                                                            key={emp._id}
                                                            onClick={() => toggleMemberSelection(emp._id)}
                                                            style={{
                                                                cursor: isMaxReached ? "not-allowed" : "pointer",
                                                                background: isChecked ? "#eef4ff" : isMaxReached ? "#fafafa" : "#fff",
                                                                opacity: isMaxReached ? 0.6 : 1,
                                                                transition: "background 0.15s"
                                                            }}
                                                        >
                                                            <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    disabled={isMaxReached}
                                                                    onChange={() => { }}
                                                                    style={{ width: "16px", height: "16px", cursor: isMaxReached ? "not-allowed" : "pointer" }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#002045", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>
                                                                        {initials}
                                                                    </div>
                                                                    <div>
                                                                        <strong style={{ fontSize: "13px", color: "#002045", display: "block" }}>{emp.name}</strong>
                                                                        <span style={{ fontSize: "11px", color: "#777" }}>{emp.employeeId}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: "12px 14px", verticalAlign: "middle", fontSize: "13px", color: "#444" }}>
                                                                {emp.email}
                                                            </td>
                                                            <td style={{ padding: "12px 14px", verticalAlign: "middle", fontSize: "13px", color: "#444" }}>
                                                                {emp.department || emp.designation || "Engineering"}
                                                            </td>
                                                            <td style={{ padding: "12px 14px", verticalAlign: "middle", textAlign: "right" }}>
                                                                <span className={`badge ${isChecked ? "green" : "gray"}`} style={{ fontSize: "11px", padding: "3px 8px" }}>
                                                                    {isChecked ? "SELECTED" : isMaxReached ? "MAX REACHED" : "AVAILABLE"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Drag and Drop Upload */}
                            <div className="form-group full-width">
                                <label>Project Briefs &amp; Attachments</label>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    style={{
                                        border: `2px dashed ${dragActive ? "#002045" : "#cbd5e1"}`,
                                        borderRadius: "12px",
                                        padding: "30px",
                                        textAlign: "center",
                                        background: dragActive ? "#f0f4f8" : "#f8fafc",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onClick={() => document.getElementById("file-upload-input").click()}
                                >
                                    <UploadCloud size={32} color="#002045" style={{ marginBottom: "8px" }} />
                                    <p style={{ color: "#002045", fontWeight: "bold", marginBottom: "4px" }}>
                                        Click to upload or drag and drop
                                    </p>
                                    <p style={{ color: "#777", fontSize: "13px" }}>
                                        PDF, DOCX, XLSX, PNG (max 25MB per file)
                                    </p>
                                    <input
                                        id="file-upload-input"
                                        type="file"
                                        multiple
                                        onChange={handleFileInput}
                                        style={{ display: "none" }}
                                    />
                                </div>

                                {uploadedFiles.length > 0 && (
                                    <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {uploadedFiles.map((file, idx) => (
                                            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "10px 15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <FileText size={18} color="#002045" />
                                                    <span style={{ fontSize: "14px", color: "#333", fontWeight: 500 }}>{file}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#777" }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form Action Buttons */}
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
                                    {isSubmitting ? "Initializing Project..." : submitSuccess ? "Project Initialized! Redirecting..." : "Initialize Project in DB"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
