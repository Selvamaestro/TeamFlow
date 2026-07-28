"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
import Sidebar from "@/components/Sidebar";
import { projectService } from "../../../services/projectService";
import { userService } from "../../../services/userService";
import { clientService } from "../../../services/clientService";
import { taskService } from "../../../services/taskService";
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
    Mail,
    ArrowLeft,
    ChevronRight,
    Edit,
    CheckCircle2,
    Calendar,
    Building,
    Check,
    Plus,
    UserPlus,
    Clock,
    UploadCloud,
    CheckSquare,
    Star,
    Sparkles,
    AlertCircle,
    Trash2,
    Shield,
    UserCheck,
    TrendingUp,
    CreditCard,
    FileText,
    ExternalLink,
    X
} from "lucide-react";

export default function ProjectDetailPage({ params }) {
    const router = useRouter();
    const resolvedParams = params ? use(params) : { id: "1" };
    const projectId = resolvedParams.id;

    const [dbProject, setDbProject] = useState(null);
    const [dbClients, setDbClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Document Upload & Delete state
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [docUploadMessage, setDocUploadMessage] = useState("");

    const handleAddDocument = async (e) => {
        const fileObj = e.target.files?.[0];
        if (!fileObj) return;

        setIsUploadingDoc(true);
        setDocUploadMessage("");

        try {
            const formDataPayload = new FormData();
            formDataPayload.append("document", fileObj);

            await api.post(`/projects/${projectId}/documents`, formDataPayload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            await fetchProjectDetails();
            setDocUploadMessage("File successfully uploaded to project!");
        } catch (err) {
            console.error("Failed to upload document to project:", err);
            setDocUploadMessage(err.response?.data?.message || err.message || "Failed to upload document.");
        } finally {
            setIsUploadingDoc(false);
            e.target.value = "";
        }
    };

    const handleDeleteDocument = async (docId, docName) => {
        if (!confirm(`Are you sure you want to delete file "${docName}" from this project?`)) return;

        try {
            await api.delete(`/projects/${projectId}/documents/${docId}`);
            await fetchProjectDetails();
        } catch (err) {
            console.error("Failed to delete document:", err);
            alert("Failed to delete document: " + (err.response?.data?.message || err.message));
        }
    };

    // Financial update state
    const [expensesInput, setExpensesInput] = useState("");
    const [paidAmountInput, setPaidAmountInput] = useState("");
    const [isSavingFinancials, setIsSavingFinancials] = useState(false);
    const [financialsMessage, setFinancialsMessage] = useState("");

    // Edit Project Modal state (For CEO / Managers)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);
    const [editErrorMessage, setEditErrorMessage] = useState("");
    const [dbTeamLeaders, setDbTeamLeaders] = useState([]);
    const [dbEmployees, setDbEmployees] = useState([]);
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
    const [memberLimitWarning, setMemberLimitWarning] = useState("");

    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        status: "planning",
        startDate: "",
        dueDate: "",
        revenue: "50000",
        teamLeaderId: "",
        selectedMembers: []
    });

    const handleConfirmDeleteProject = async () => {
        if (!dbProject) return;
        setIsDeleting(true);
        try {
            await projectService.deleteProject(dbProject.id);
            router.push("/projects");
        } catch (err) {
            console.warn("Delete project notice:", err.message);
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // Load available Team Leaders, Employees, and Clients for edit modal assignment
    useEffect(() => {
        async function fetchInitialListData() {
            try {
                const userRes = await userService.getUsers().catch(() => null);
                if (userRes?.users && Array.isArray(userRes.users)) {
                    const allUsers = userRes.users;
                    const leaders = allUsers.filter(u => ["team_leader", "team_lead"].includes(u.role));
                    setDbTeamLeaders(leaders);
                    const staff = allUsers.filter(u => u.role === "employee");
                    setDbEmployees(staff);
                }
                const clientRes = await clientService.getClients().catch(() => null);
                if (clientRes?.clients && Array.isArray(clientRes.clients)) {
                    setDbClients(clientRes.clients);
                }
            } catch (err) {
                console.warn("Initial list fetch notice:", err.message);
            }
        }
        fetchInitialListData();
    }, []);

    // Load Live Project from MongoDB
    async function fetchProjectDetails() {
        setIsLoading(true);
        try {
            let raw = null;
            try {
                const res = await projectService.getProjectById(projectId);
                if (res && res.project) raw = res.project;
            } catch (e) {
                // Fallback search
            }

            if (!raw) {
                const listRes = await projectService.getProjects();
                if (listRes?.projects) {
                    raw = listRes.projects.find(p => p._id === projectId || p.id === projectId);
                }
            }

            if (raw) {
                const leadObj = typeof raw.teamLeader === "object" ? raw.teamLeader : null;
                const leadId = leadObj ? leadObj._id : (typeof raw.teamLeader === "string" ? raw.teamLeader : "");
                const leadName = leadObj ? (leadObj.name || leadObj.email) : "Unassigned Team Leader";
                const leadRole = leadObj ? (leadObj.designation || (leadObj.role ? leadObj.role.toUpperCase() : "Team Leader")) : "Team Leader";
                const leadAvatar = leadObj?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80";

                const rawMembers = Array.isArray(raw.members)
                    ? raw.members.map(m => (typeof m === "object" ? m._id : m))
                    : [];

                const membersList = Array.isArray(raw.members)
                    ? raw.members.map(m => {
                        if (typeof m === "object" && m) {
                            return {
                                id: m._id,
                                name: m.name || m.email,
                                role: m.designation || (m.role ? m.role.toUpperCase() : "Employee"),
                                email: m.email,
                                employeeId: m.employeeId || "",
                                avatar: m.avatarUrl || null,
                                initials: m.name ? m.name.substring(0, 2).toUpperCase() : "EM"
                            };
                        }
                        return null;
                    }).filter(Boolean)
                    : [];

                const numRev = Number(raw.revenue) || Number(raw.budget) || 50000;
                const numExp = Number(raw.expenses) || 0;
                const numPaid = Number(raw.paidAmount) || 0;
                const numPending = raw.pendingAmount !== undefined ? Number(raw.pendingAmount) : Math.max(0, numRev - numPaid);

                let pStatus = raw.paymentStatus;
                if (!pStatus) {
                    if (numPaid >= numRev && numRev > 0) pStatus = "Paid";
                    else if (numPaid > 0) pStatus = "Partial";
                    else pStatus = "Pending";
                }

                const startDateFormatted = raw.startDate
                    ? new Date(raw.startDate).toLocaleDateString()
                    : (raw.createdAt ? new Date(raw.createdAt).toLocaleDateString() : "N/A");

                const endDateFormatted = raw.endDate
                    ? new Date(raw.endDate).toLocaleDateString()
                    : (raw.dueDate ? new Date(raw.dueDate).toLocaleDateString() : "Dec 2026");

                const docsList = Array.isArray(raw.documents)
                    ? raw.documents.map(d => ({
                        id: d._id || d.id,
                        name: d.name || "Untitled Document",
                        url: d.url,
                        uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : "Recently"
                    }))
                    : [];

                const clientObj = typeof raw.client === "object" ? raw.client : null;
                const clientId = clientObj ? clientObj._id : (typeof raw.client === "string" ? raw.client : "");
                const clientName = clientObj ? (clientObj.company || clientObj.name) : "Client Enterprise";

                setDbProject({
                    id: raw._id || raw.id,
                    title: raw.title || "Project Initiative",
                    clientId: clientId,
                    client: clientName,
                    lead: leadName,
                    leadRole: leadRole,
                    leadAvatar: leadAvatar,
                    teamLeaderId: leadId,
                    rawStatus: raw.status || "planning",
                    rawStartDate: raw.startDate || raw.createdAt,
                    rawDueDate: raw.dueDate || raw.endDate,
                    rawMembers: rawMembers,
                    status: raw.status ? (raw.status.charAt(0).toUpperCase() + raw.status.slice(1)) : "In Progress",
                    statusType: raw.status === "completed" ? "green" : raw.status === "delayed" ? "red" : "blue",
                    progress: typeof raw.progress === "number" ? raw.progress : (raw.status === "completed" ? 100 : 0),
                    startDate: startDateFormatted,
                    endDate: endDateFormatted,
                    dueDate: endDateFormatted,
                    description: raw.description || "Core enterprise software engineering workflow and infrastructure implementation.",
                    priority: "High - Tier 1",
                    revenue: numRev,
                    expenses: numExp,
                    paidAmount: numPaid,
                    pendingAmount: numPending,
                    paymentStatus: pStatus,
                    teamLeaderObj: leadObj ? {
                        name: leadName,
                        role: leadRole,
                        email: leadObj.email,
                        employeeId: leadObj.employeeId,
                        avatar: leadAvatar,
                        initials: leadName.substring(0, 2).toUpperCase()
                    } : null,
                    membersList: membersList,
                    documentsList: docsList,
                    activity: [
                        { title: "Project Loaded from MongoDB", desc: `Team Leader: ${leadName} • ${membersList.length} Working Members assigned.`, time: "Live Database Record" }
                    ]
                });

                setExpensesInput(numExp.toString());
                setPaidAmountInput(numPaid.toString());
            }
        } catch (err) {
            console.warn("Project details fetch info:", err.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    useEffect(() => {
        async function fetchCompletedTasks() {
            setIsLoadingTasks(true);
            try {
                // Don't filter server-side to "approved" only — an employee's task
                // already reads as done once they submit it (see DONE_STATUSES in
                // TaskListItem.jsx on the employee side); it just hasn't been signed
                // off by the Team Leader yet. Fetch everything and filter client-side
                // so both states show up here.
                const res = await taskService.getProjectTasks(projectId);
                const allTasks = Array.isArray(res?.tasks) ? res.tasks : [];
                const done = allTasks
                    .filter((t) => ["submitted", "approved"].includes(t.status))
                    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
                setCompletedTasks(done);
            } catch (err) {
                console.warn("Completed tasks fetch info:", err.message);
                setCompletedTasks([]);
            } finally {
                setIsLoadingTasks(false);
            }
        }
        if (projectId) fetchCompletedTasks();
    }, [projectId]);

    const openEditModal = () => {
        if (!dbProject) return;
        setMemberLimitWarning("");
        setEditErrorMessage("");

        const formatISO = (dateStr) => {
            if (!dateStr) return "";
            try {
                return new Date(dateStr).toISOString().split("T")[0];
            } catch (e) {
                return "";
            }
        };

        setEditFormData({
            title: dbProject.title || "",
            description: dbProject.description || "",
            clientId: dbProject.clientId || (dbClients[0] ? dbClients[0]._id : ""),
            status: dbProject.rawStatus || "planning",
            startDate: formatISO(dbProject.rawStartDate) || new Date().toISOString().split("T")[0],
            dueDate: formatISO(dbProject.rawDueDate) || "",
            revenue: dbProject.revenue ? dbProject.revenue.toString() : "50000",
            teamLeaderId: dbProject.teamLeaderId || (dbTeamLeaders[0] ? dbTeamLeaders[0]._id : ""),
            selectedMembers: dbProject.rawMembers || []
        });
        setIsEditModalOpen(true);
    };

    const toggleEditMemberSelection = (userId) => {
        setMemberLimitWarning("");
        setEditFormData(prev => {
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

    const handleSaveProjectEdits = async (e) => {
        e.preventDefault();
        if (!editFormData.title) return;
        setIsUpdatingProject(true);
        setEditErrorMessage("");

        try {
            const updatePayload = {
                title: editFormData.title,
                description: editFormData.description,
                client: editFormData.clientId || undefined,
                status: editFormData.status,
                startDate: editFormData.startDate ? new Date(editFormData.startDate) : undefined,
                dueDate: editFormData.dueDate ? new Date(editFormData.dueDate) : undefined,
                endDate: editFormData.dueDate ? new Date(editFormData.dueDate) : undefined,
                revenue: Number(editFormData.revenue) || 0,
                teamLeader: editFormData.teamLeaderId || null,
                members: editFormData.selectedMembers
            };

            await projectService.updateProject(projectId, updatePayload);
            setIsEditModalOpen(false);
            await fetchProjectDetails();
        } catch (err) {
            console.error("Project edit error:", err);
            setEditErrorMessage(err.message || "Failed to save project edits.");
        } finally {
            setIsUpdatingProject(false);
        }
    };

    const handleUpdateFinancials = async (e) => {
        e.preventDefault();
        setIsSavingFinancials(true);
        setFinancialsMessage("");

        const targetRev = dbProject?.revenue || 0;
        const newPaid = Number(paidAmountInput) || 0;

        if (targetRev > 0 && newPaid > targetRev) {
            setFinancialsMessage("exceeded the pending amount");
            setIsSavingFinancials(false);
            return;
        }

        try {
            const updatePayload = {
                expenses: Number(expensesInput) || 0,
                paidAmount: newPaid
            };

            const res = await projectService.updateProject(projectId, updatePayload);
            const updated = res?.project || res;

            if (updated) {
                const updatedRev = Number(updated.revenue) || Number(updated.budget) || targetRev;
                const updatedExp = Number(updated.expenses) || 0;
                const updatedPaid = Number(updated.paidAmount) || 0;
                const updatedPending = updated.pendingAmount !== undefined
                    ? Number(updated.pendingAmount)
                    : Math.max(0, updatedRev - updatedPaid);

                let updatedStatus = updated.paymentStatus;
                if (!updatedStatus) {
                    if (updatedPaid >= updatedRev && updatedRev > 0) updatedStatus = "Paid";
                    else if (updatedPaid > 0) updatedStatus = "Partial";
                    else updatedStatus = "Pending";
                }

                setDbProject(prev => ({
                    ...prev,
                    expenses: updatedExp,
                    paidAmount: updatedPaid,
                    pendingAmount: updatedPending,
                    paymentStatus: updatedStatus
                }));

                setFinancialsMessage("Financial details successfully updated in MongoDB!");
            }
        } catch (err) {
            console.error("Failed to update financials:", err);
            const msg = err.message || "";
            if (msg.toLowerCase().includes("exceeded")) {
                setFinancialsMessage("exceeded the pending amount");
            } else {
                setFinancialsMessage("Failed to update financials: " + msg);
            }
        } finally {
            setIsSavingFinancials(false);
        }
    };

    const project = dbProject;

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
                            placeholder="Search project details..."
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

                {/* Dashboard Page Body */}
                <div className="dashboard">
                    {isLoading ? (
                        <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>
                            Loading live project details from MongoDB database...
                        </div>
                    ) : !project ? (
                        <div style={{ padding: "60px", textAlign: "center", color: "#777", background: "#fff", borderRadius: "16px" }}>
                            <FolderKanban size={48} color="#002045" style={{ marginBottom: "15px", opacity: 0.5 }} />
                            <h2>Project Record Not Found</h2>
                            <p style={{ margin: "10px 0 20px" }}>The requested project record does not exist in your MongoDB database.</p>
                            <Link href="/projects" className="dashboard-btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
                                Back to Projects
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Action Header Row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666" }}>
                                    <Link href="/projects" style={{ color: "#002045", textDecoration: "none", fontWeight: 600 }}>
                                        Projects
                                    </Link>
                                    <ChevronRight size={16} />
                                    <span style={{ color: "#777" }}>{project.title}</span>
                                </nav>

                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button onClick={openEditModal} className="dashboard-btn-secondary">
                                        <Edit size={16} /> Edit Project &amp; Employees
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        disabled={isDeleting}
                                        style={{ background: "#ba1a1a", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        <Trash2 size={16} /> Delete Project
                                    </button>
                                </div>
                            </div>

                            {/* Title & Status Badge Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                                    <h1 style={{ color: "#002045", fontSize: "32px", margin: 0 }}>{project.title}</h1>
                                    <span className={`badge ${project.statusType === "green" ? "green" : project.statusType === "red" ? "yellow" : "badge"}`} style={{ padding: "6px 14px", fontSize: "13px" }}>
                                        ● {project.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#002045" }}>
                                    Contract Revenue: <span style={{ color: "#169c52" }}>₹{Number(project.revenue).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Main Bento 2-Column Grid */}
                            <div className="overview-grid" style={{ gridTemplateColumns: "1.8fr 1fr", gap: "25px" }}>
                                {/* LEFT COLUMN: Overview & Financial Management */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                    {/* Project Overview Card */}
                                    <div className="overview-card" style={{ marginTop: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ color: "#002045", fontSize: "20px", marginBottom: "12px" }}>Project Overview</h3>
                                                <p style={{ color: "#555", fontSize: "15px", lineHeight: "24px", margin: 0 }}>
                                                    {project.description}
                                                </p>
                                            </div>
                                            <div style={{ display: "flex", gap: "12px" }}>
                                                <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", minWidth: "120px" }}>
                                                    <Calendar size={20} color="#002045" style={{ marginBottom: "4px" }} />
                                                    <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", display: "block" }}>Start Date</span>
                                                    <strong style={{ fontSize: "14px", color: "#002045" }}>{project.startDate}</strong>
                                                </div>
                                                <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", minWidth: "120px" }}>
                                                    <Calendar size={20} color="#002045" style={{ marginBottom: "4px" }} />
                                                    <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", display: "block" }}>Target Due Date</span>
                                                    <strong style={{ fontSize: "14px", color: "#002045" }}>{project.endDate}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "30px", marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #eee", fontSize: "14px", flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Building size={18} color="#002045" />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: "12px", color: "#777", display: "block" }}>Client</span>
                                                    <strong style={{ color: "#002045" }}>{project.client}</strong>
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Shield size={18} color="#002045" />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: "12px", color: "#777", display: "block" }}>Project Lead</span>
                                                    <strong style={{ color: "#002045" }}>{project.lead}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financials & Payment Management Card */}
                                    <div className="overview-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                            <h3 style={{ color: "#002045", fontSize: "20px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                                <IndianRupee size={22} color="#002045" /> Financials &amp; Payment Tracking
                                            </h3>
                                            <span
                                                className={`badge ${project.paymentStatus === "Paid" ? "green" : project.paymentStatus === "Partial" ? "blue" : "yellow"}`}
                                                style={{ fontSize: "12px", padding: "6px 14px", fontWeight: "bold" }}
                                            >
                                                Payment Status: {project.paymentStatus}
                                            </span>
                                        </div>

                                        {/* Financial Summary Grid */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "15px", marginBottom: "25px" }}>
                                            <div style={{ background: "#f8fbff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                                <span style={{ fontSize: "12px", color: "#777", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Contract Revenue</span>
                                                <strong style={{ fontSize: "18px", color: "#002045" }}>₹{Number(project.revenue).toLocaleString()}</strong>
                                            </div>
                                            <div style={{ background: "#fff5f5", padding: "16px", borderRadius: "12px", border: "1px solid #fed7d7" }}>
                                                <span style={{ fontSize: "12px", color: "#c53030", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Expenses</span>
                                                <strong style={{ fontSize: "18px", color: "#c53030" }}>₹{Number(project.expenses).toLocaleString()}</strong>
                                            </div>
                                            <div style={{ background: "#f0fff4", padding: "16px", borderRadius: "12px", border: "1px solid #c6f6d5" }}>
                                                <span style={{ fontSize: "12px", color: "#22543d", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Paid Amount</span>
                                                <strong style={{ fontSize: "18px", color: "#276749" }}>₹{Number(project.paidAmount).toLocaleString()}</strong>
                                            </div>
                                            <div style={{ background: "#fffaf0", padding: "16px", borderRadius: "12px", border: "1px solid #feebc8" }}>
                                                <span style={{ fontSize: "12px", color: "#9c4221", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Pending Amount</span>
                                                <strong style={{ fontSize: "18px", color: "#dd6b20" }}>₹{Number(project.pendingAmount).toLocaleString()}</strong>
                                            </div>
                                        </div>

                                        {/* Financial Update Form */}
                                        <form onSubmit={handleUpdateFinancials} style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                                            <h4 style={{ color: "#002045", margin: "0 0 15px 0", fontSize: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <CreditCard size={16} /> Update Project Financials &amp; Payments
                                            </h4>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "13px", color: "#444", marginBottom: "6px", fontWeight: "bold" }}>Total Expenses (₹ INR)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={expensesInput}
                                                        onChange={(e) => setExpensesInput(e.target.value)}
                                                        placeholder="e.g. 15000"
                                                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "13px", color: "#444", marginBottom: "6px", fontWeight: "bold" }}>Paid Amount (₹ INR)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={paidAmountInput}
                                                        onChange={(e) => setPaidAmountInput(e.target.value)}
                                                        placeholder="e.g. 25000"
                                                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                                    />
                                                </div>
                                            </div>

                                            {financialsMessage && (
                                                <div
                                                    style={{
                                                        marginBottom: "15px",
                                                        fontSize: "13px",
                                                        fontWeight: 700,
                                                        color: (financialsMessage.toLowerCase().includes("exceeded") || financialsMessage.toLowerCase().includes("failed") || financialsMessage.toLowerCase().includes("error")) ? "#d63031" : "#169c52",
                                                        background: (financialsMessage.toLowerCase().includes("exceeded") || financialsMessage.toLowerCase().includes("failed") || financialsMessage.toLowerCase().includes("error")) ? "#ffeaea" : "#eefbf3",
                                                        padding: "10px 14px",
                                                        borderRadius: "8px",
                                                        border: `1px solid ${(financialsMessage.toLowerCase().includes("exceeded") || financialsMessage.toLowerCase().includes("failed") || financialsMessage.toLowerCase().includes("error")) ? "#fecaca" : "#bbf7d0"}`
                                                    }}
                                                >
                                                    {financialsMessage}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={isSavingFinancials}
                                                className="dashboard-btn-primary"
                                                style={{ width: "100%", justifyContent: "center" }}
                                            >
                                                {isSavingFinancials ? "Updating MongoDB..." : "Save Financial Update"}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Assigned Team & Activity */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                    {/* Assigned Team Card */}
                                    <div className="overview-card" style={{ marginTop: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                            <h3 style={{ color: "#002045", fontSize: "18px", margin: 0 }}>Assigned Team</h3>
                                            <span className="badge blue" style={{ fontSize: "11px" }}>
                                                {(project.teamLeaderObj ? 1 : 0) + (project.membersList?.length || 0)} Total
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                            {/* Team Leader */}
                                            {project.teamLeaderObj ? (
                                                <div style={{ background: "#eef4ff", padding: "12px", borderRadius: "10px", border: "1px solid #d0e1ff" }}>
                                                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#002045", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                                                        ● Project Team Leader
                                                    </span>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#002045", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "bold", flexShrink: 0 }}>
                                                            {project.teamLeaderObj.initials}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <strong style={{ color: "#002045", display: "block", fontSize: "14px" }}>{project.teamLeaderObj.name}</strong>
                                                            <span style={{ fontSize: "11px", color: "#555" }}>{project.teamLeaderObj.email}</span>
                                                        </div>
                                                        <span className="badge green" style={{ fontSize: "10px" }}>LEAD</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ color: "#777", fontSize: "13px", padding: "8px 0" }}>No Team Leader assigned</div>
                                            )}

                                            {/* Working Members */}
                                            <div>
                                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                                                    Working Members ({project.membersList?.length || 0})
                                                </span>

                                                {(!project.membersList || project.membersList.length === 0) ? (
                                                    <div style={{ color: "#777", fontSize: "13px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                        No working members assigned to this project yet.
                                                    </div>
                                                ) : (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                        {project.membersList.map((member, idx) => (
                                                            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1a365d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>
                                                                        {member.initials}
                                                                    </div>
                                                                    <div>
                                                                        <strong style={{ color: "#002045", display: "block", fontSize: "13px" }}>{member.name}</strong>
                                                                        <span style={{ fontSize: "11px", color: "#777" }}>{member.email} {member.employeeId ? `(${member.employeeId})` : ""}</span>
                                                                    </div>
                                                                </div>
                                                                <span className="badge gray" style={{ fontSize: "10px" }}>MEMBER</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recently Completed Tasks Section */}
                                    <div className="overview-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                            <h3 style={{ color: "#002045", fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                                <CheckCircle2 size={20} color="#002045" /> Recently Completed Tasks
                                            </h3>
                                            <span className="badge green" style={{ fontSize: "11px" }}>
                                                {completedTasks.length} Completed
                                            </span>
                                        </div>

                                        {isLoadingTasks ? (
                                            <div style={{ color: "#777", fontSize: "13px", padding: "8px 0" }}>Loading tasks...</div>
                                        ) : completedTasks.length === 0 ? (
                                            <div style={{ color: "#777", fontSize: "13px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                No tasks have been completed for this project yet.
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                {completedTasks.slice(0, 6).map((task) => {
                                                    const assignee = task.assignedTo && typeof task.assignedTo === "object" ? task.assignedTo : null;
                                                    const assigner = task.assignedBy && typeof task.assignedBy === "object" ? task.assignedBy : null;
                                                    const completedOn = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "Recently";
                                                    const isApproved = task.status === "approved";
                                                    return (
                                                        <div key={task._id} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                                                                <strong style={{ color: "#002045", fontSize: "13px" }}>{task.title}</strong>
                                                                <span className={`badge ${isApproved ? "green" : "blue"}`} style={{ fontSize: "10px", flexShrink: 0, whiteSpace: "nowrap" }}>
                                                                    {isApproved ? "APPROVED" : "PENDING APPROVAL"}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: "11px", color: "#666", marginTop: "6px" }}>
                                                                {isApproved ? "Completed" : "Submitted"} by <strong style={{ color: "#334155" }}>{assignee?.name || "Unassigned"}</strong>
                                                                {" "}on {completedOn}
                                                            </div>
                                                            {assigner?.name && (
                                                                <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
                                                                    Assigned by Team Leader <strong style={{ color: "#334155" }}>{assigner.name}</strong>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Files & Documents Section */}
                                    <div className="overview-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                                            <h3 style={{ color: "#002045", fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                                <FileText size={20} color="#002045" /> Project Documents ({project.documentsList?.length || 0})
                                            </h3>

                                            <div>
                                                <input
                                                    type="file"
                                                    id="add-doc-input"
                                                    style={{ display: "none" }}
                                                    onChange={handleAddDocument}
                                                />
                                                <button
                                                    type="button"
                                                    className="dashboard-btn-secondary"
                                                    style={{ padding: "6px 12px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                                                    onClick={() => document.getElementById("add-doc-input").click()}
                                                    disabled={isUploadingDoc}
                                                >
                                                    <Plus size={14} /> {isUploadingDoc ? "Uploading to Cloudinary..." : "Add File"}
                                                </button>
                                            </div>
                                        </div>

                                        {docUploadMessage && (
                                            <div style={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                padding: "8px 12px",
                                                borderRadius: "6px",
                                                marginBottom: "15px",
                                                color: (docUploadMessage.toLowerCase().includes("fail") || docUploadMessage.toLowerCase().includes("error")) ? "#d63031" : "#169c52",
                                                background: (docUploadMessage.toLowerCase().includes("fail") || docUploadMessage.toLowerCase().includes("error")) ? "#ffeaea" : "#eefbf3"
                                            }}>
                                                {docUploadMessage}
                                            </div>
                                        )}

                                        {(!project.documentsList || project.documentsList.length === 0) ? (
                                            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "10px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
                                                <UploadCloud size={32} color="#002045" style={{ opacity: 0.5, marginBottom: "8px" }} />
                                                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>No project documents uploaded yet.</p>
                                                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Click "Add File" to upload project briefs, PDFs, or design assets.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                {project.documentsList.map((doc) => (
                                                    <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                                                            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eef4ff", color: "#002045", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                                <FileText size={18} />
                                                            </div>
                                                            <div style={{ overflow: "hidden" }}>
                                                                <strong style={{ color: "#002045", fontSize: "13px", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                                                    {doc.name}
                                                                </strong>
                                                                <span style={{ fontSize: "11px", color: "#777", display: "block" }}>
                                                                    Uploaded {doc.uploadedAt}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                                            {doc.url && (
                                                                <a
                                                                    href={doc.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    style={{ background: "#f1f5f9", color: "#002045", textDecoration: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                                >
                                                                    <ExternalLink size={12} /> View
                                                                </a>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteDocument(doc.id, doc.name)}
                                                                style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 8px", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                                                                title="Delete File"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* EDIT PROJECT MODAL (CEO / Manager Project & Employee Management) */}
            {isEditModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 32, 69, 0.65)",
                    backdropFilter: "blur(5px)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px"
                }}>
                    <div style={{
                        background: "#fff",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "750px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
                        border: "1px solid #cbd5e1"
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: "20px 25px",
                            borderBottom: "1px solid #e2e8f0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#f8fafc"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Edit size={20} color="#002045" />
                                <h2 style={{ margin: 0, color: "#002045", fontSize: "20px" }}>Edit Project &amp; Add Employees</h2>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={handleSaveProjectEdits} style={{ padding: "25px" }}>
                            {editErrorMessage && (
                                <div style={{ background: "#ffeaea", color: "#d63031", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "20px" }}>
                                    {editErrorMessage}
                                </div>
                            )}

                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                {/* Client Account & Title Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Project Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editFormData.title}
                                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Client Account</label>
                                        <select
                                            value={editFormData.clientId}
                                            onChange={(e) => setEditFormData({ ...editFormData, clientId: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        >
                                            <option value="">Unassigned Client</option>
                                            {dbClients.map(c => (
                                                <option key={c._id} value={c._id}>
                                                    {c.company || c.name} ({c.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Project Description</label>
                                    <textarea
                                        rows={3}
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                    ></textarea>
                                </div>

                                {/* Status & Revenue Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Project Status</label>
                                        <select
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        >
                                            <option value="planning">Planning</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="on_hold">On Hold</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Contract Revenue (₹ INR)</label>
                                        <input
                                            type="number"
                                            value={editFormData.revenue}
                                            onChange={(e) => setEditFormData({ ...editFormData, revenue: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                </div>

                                {/* Dates Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Start Date</label>
                                        <input
                                            type="date"
                                            value={editFormData.startDate}
                                            onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Target Due Date</label>
                                        <input
                                            type="date"
                                            value={editFormData.dueDate}
                                            onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                </div>

                                {/* Team Leader Selection */}
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Assign Team Leader</label>
                                    <select
                                        value={editFormData.teamLeaderId}
                                        onChange={(e) => setEditFormData({ ...editFormData, teamLeaderId: e.target.value })}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                    >
                                        <option value="">Unassigned Team Leader</option>
                                        {dbTeamLeaders.map(l => (
                                            <option key={l._id} value={l._id}>
                                                {l.name} ({l.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Add / Edit Team Employees (Max 3 Members) */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <label style={{ fontSize: "13px", color: "#334155", fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                                            <UserCheck size={16} color="#002045" /> Assign / Add Team Employees (Max 3 Members)
                                        </label>
                                        <span style={{ fontSize: "12px", fontWeight: "bold", color: editFormData.selectedMembers.length >= 3 ? "#d63031" : "#002045" }}>
                                            Selected: {editFormData.selectedMembers.length} / 3 Max Members
                                        </span>
                                    </div>

                                    {memberLimitWarning && (
                                        <div style={{ background: "#ffeaea", color: "#d63031", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, marginBottom: "10px" }}>
                                            {memberLimitWarning}
                                        </div>
                                    )}

                                    <div style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", display: "flex", alignItems: "center" }}>
                                        <Search size={16} color="#002045" style={{ marginRight: "8px" }} />
                                        <input
                                            type="text"
                                            value={employeeSearchQuery}
                                            onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                                            placeholder="Search employees to add by name, email or employee ID..."
                                            style={{ border: "none", outline: "none", width: "100%", fontSize: "13px" }}
                                        />
                                    </div>

                                    <div style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", maxHeight: "200px", overflowY: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                            <tbody>
                                                {dbEmployees.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: "15px", textAlign: "center", color: "#777" }}>
                                                            Loading employees from database collection...
                                                        </td>
                                                    </tr>
                                                ) : dbEmployees
                                                    .filter(emp => {
                                                        const q = employeeSearchQuery.toLowerCase();
                                                        return !q || (emp.name && emp.name.toLowerCase().includes(q)) || (emp.email && emp.email.toLowerCase().includes(q)) || (emp.employeeId && emp.employeeId.toLowerCase().includes(q));
                                                    })
                                                    .map(emp => {
                                                        const isChecked = editFormData.selectedMembers.includes(emp._id);
                                                        const isMaxReached = !isChecked && editFormData.selectedMembers.length >= 3;
                                                        return (
                                                            <tr
                                                                key={emp._id}
                                                                onClick={() => toggleEditMemberSelection(emp._id)}
                                                                style={{
                                                                    cursor: isMaxReached ? "not-allowed" : "pointer",
                                                                    background: isChecked ? "#eef4ff" : "#fff",
                                                                    borderBottom: "1px solid #f1f5f9"
                                                                }}
                                                            >
                                                                <td style={{ padding: "10px 12px", width: "35px" }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        disabled={isMaxReached}
                                                                        onChange={() => { }}
                                                                    />
                                                                </td>
                                                                <td style={{ padding: "10px 12px" }}>
                                                                    <strong style={{ color: "#002045", display: "block" }}>{emp.name}</strong>
                                                                    <span style={{ fontSize: "11px", color: "#64748b" }}>{emp.email} ({emp.employeeId || "EM"})</span>
                                                                </td>
                                                                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                                                                    <span className={`badge ${isChecked ? "green" : "gray"}`} style={{ fontSize: "10px" }}>
                                                                        {isChecked ? "ASSIGNED" : isMaxReached ? "MAX REACHED" : "AVAILABLE"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "25px", paddingTop: "15px", borderTop: "1px solid #e2e8f0" }}>
                                <button
                                    type="button"
                                    className="dashboard-btn-secondary"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingProject}
                                    className="dashboard-btn-primary"
                                >
                                    {isUpdatingProject ? "Saving Changes..." : "Save Project & Employee Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Popup Modal */}
            {showDeleteModal && dbProject && (
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
                            Do you want to delete the <strong>{dbProject.title}</strong>?
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
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