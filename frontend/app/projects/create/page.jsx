"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
import Sidebar from "@/components/Sidebar";
import { projectService } from "../../../services/projectService";
import { clientService } from "../../../services/clientService";
import { userService } from "../../../services/userService";
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
    
    // Inactive Client Validation States
    const [clientError, setClientError] = useState("");
    const [showInactivePopup, setShowInactivePopup] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        clientId: "",
        teamLeaderId: "",
        selectedMembers: [],
        startDate: new Date().toISOString().split("T")[0],
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
                    // Preselect first active client
                    const firstActive = clientRes.clients.find(c => (c.status || "active").toLowerCase() !== "inactive");
                    if (firstActive) {
                        setFormData(prev => ({ ...prev, clientId: firstActive._id }));
                    } else if (clientRes.clients.length > 0) {
                        setFormData(prev => ({ ...prev, clientId: "" }));
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

    const handleClientChange = (e) => {
        const selectedId = e.target.value;
        const selectedClient = dbClients.find(c => c._id === selectedId);

        if (selectedClient && (selectedClient.status || "active").toLowerCase() === "inactive") {
            setClientError("the client is inactive");
            setShowInactivePopup(true);
            // Do NOT allow that specific client to be selected
            return;
        }

        setClientError("");
        setShowInactivePopup(false);
        setFormData(prev => ({ ...prev, clientId: selectedId }));
    };

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

    const uploadFileToCloudinary = async (fileObj) => {
        const tempId = Date.now() + Math.random().toString();
        const placeholder = {
            id: tempId,
            name: fileObj.name,
            url: "",
            isUploading: true,
            error: null
        };

        setUploadedFiles(prev => [...prev, placeholder]);

        try {
            const formDataPayload = new FormData();
            formDataPayload.append("document", fileObj);

            const res = await api.post("/projects/upload-document", formDataPayload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const docData = res.data?.document;
            if (docData && docData.url) {
                setUploadedFiles(prev => prev.map(item => item.id === tempId ? {
                    id: tempId,
                    name: docData.name || fileObj.name,
                    url: docData.url,
                    isUploading: false,
                    error: null
                } : item));
            } else {
                throw new Error("No URL returned from server");
            }
        } catch (err) {
            console.error("Cloudinary file upload failed:", err);
            const errMsg = err.response?.data?.message || err.message || "Upload failed";
            setUploadedFiles(prev => prev.map(item => item.id === tempId ? {
                ...item,
                isUploading: false,
                error: errMsg
            } : item));
        }
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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            Array.from(e.dataTransfer.files).forEach(f => uploadFileToCloudinary(f));
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach(f => uploadFileToCloudinary(f));
            e.target.value = "";
        }
    };

    const removeFile = (id) => {
        setUploadedFiles(prev => prev.filter((item) => item.id !== id));
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

        // Check if selected client is inactive
        const selectedClient = dbClients.find(c => c._id === (formData.clientId || (dbClients[0] ? dbClients[0]._id : undefined)));
        if (!formData.clientId || (selectedClient && (selectedClient.status || "active").toLowerCase() === "inactive")) {
            setClientError("the client is inactive");
            setShowInactivePopup(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // Send payload to backend with teamLeader, members IDs, and uploaded Cloudinary documents
            const selectedDueDate = formData.dueDate ? new Date(formData.dueDate) : new Date("2026-12-01");
            const selectedStartDate = formData.startDate ? new Date(formData.startDate) : new Date();

            const documentsPayload = uploadedFiles
                .filter(f => f.url && !f.isUploading)
                .map(f => ({ name: f.name, url: f.url }));

            await projectService.createProject({
                title: formData.title,
                description: formData.description,
                client: formData.clientId,
                teamLeader: formData.teamLeaderId || undefined,
                members: formData.selectedMembers,
                startDate: selectedStartDate,
                dueDate: selectedDueDate,
                endDate: selectedDueDate,
                revenue: Number(formData.revenue) || 50000,
                documents: documentsPayload,
                status: "planning"
            });

            setIsSubmitting(false);
            setSubmitSuccess(true);

            setTimeout(() => {
                router.push("/projects");
            }, 1200);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || "Failed to create project";
            if (errMsg.toLowerCase().includes("inactive")) {
                setClientError("the client is inactive");
                setShowInactivePopup(true);
            } else {
                console.warn("Project creation notice:", errMsg);
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar active="projects" />

            {/* Main Content */}
            <div className="main-content">
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
                                    onChange={handleClientChange}
                                >
                                    {dbClients.length === 0 ? (
                                        <option value="">No clients found in database</option>
                                    ) : (
                                        dbClients.map(c => {
                                            const isInactive = (c.status || "active").toLowerCase() === "inactive";
                                            return (
                                                <option key={c._id} value={c._id}>
                                                    {c.company || c.name} ({c.email}) {isInactive ? " — [INACTIVE]" : ""}
                                                </option>
                                            );
                                        })
                                    )}
                                </select>
                                {clientError && (
                                    <div style={{ color: "#d63031", fontSize: "13px", fontWeight: "600", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <AlertCircle size={15} /> {clientError}
                                    </div>
                                )}
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
                                <label>Contract Revenue (₹ INR)</label>
                                <input
                                    type="number"
                                    value={formData.revenue}
                                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                    placeholder="50000"
                                />
                            </div>

                             <div className="form-group">
                                 <label>Start Date (Defaults to Today)</label>
                                 <input
                                     type="date"
                                     value={formData.startDate}
                                     onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                 />
                             </div>

                             <div className="form-group">
                                 <label>Target Completion Date (Due Date)</label>
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
                                        {uploadedFiles.map((file) => (
                                            <div key={file.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "10px 15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <FileText size={18} color="#002045" />
                                                    <div>
                                                        <span style={{ fontSize: "14px", color: "#333", fontWeight: 500, display: "block" }}>{file.name}</span>
                                                        {file.url && (
                                                            <a href={file.url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#2563eb", textDecoration: "underline" }}>
                                                                View on Cloudinary
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    {file.isUploading ? (
                                                        <span style={{ fontSize: "12px", background: "#fef3c7", color: "#d97706", padding: "3px 8px", borderRadius: "6px", fontWeight: "600" }}>
                                                            Uploading to Cloudinary...
                                                        </span>
                                                    ) : file.error ? (
                                                        <span style={{ fontSize: "12px", background: "#fee2e2", color: "#dc2626", padding: "3px 8px", borderRadius: "6px", fontWeight: "600" }}>
                                                            {file.error}
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: "12px", background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "6px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                                            <Check size={12} /> Saved on Cloudinary
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(file.id)}
                                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#777" }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
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

            {/* Inactive Client Modal Alert Popup */}
            {showInactivePopup && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,32,69,0.5)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowInactivePopup(false)}>
                    <div style={{ background: "#ffffff", padding: "32px", borderRadius: "20px", maxWidth: "420px", width: "90%", textAlign: "center", boxShadow: "0 20px 50px rgba(0,32,69,0.25)" }} onClick={e => e.stopPropagation()}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#ffeaea", color: "#d63031", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <AlertCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#002045", marginBottom: "8px" }}>Selection Restricted</h3>
                        <p style={{ color: "#d63031", fontWeight: "bold", fontSize: "16px", marginBottom: "16px" }}>the client is inactive</p>
                        <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", marginBottom: "24px" }}>
                            This client account is currently marked as inactive and cannot be assigned to new projects.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowInactivePopup(false)}
                            style={{ background: "#002045", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", width: "100%" }}
                        >
                            Understand &amp; Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
