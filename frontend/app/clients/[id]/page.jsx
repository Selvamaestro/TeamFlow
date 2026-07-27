"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
import Sidebar from "@/components/Sidebar";
import { clientService } from "../../../services/clientService";
import { projectService } from "../../../services/projectService";
import api from "@/lib/api";
import * as XLSX from "xlsx";
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
    ArrowLeft,
    Download,
    Edit,
    Star,
    CheckCircle,
    User,
    Phone,
    Globe,
    MapPin,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
    Trash2,
    Plus,
    Clock,
    FileText,
    X
} from "lucide-react";

export default function ClientDetailPage({ params }) {
    const router = useRouter();
    const resolvedParams = params ? use(params) : { id: "1" };
    const clientId = resolvedParams.id;

    const [dbClient, setDbClient] = useState(null);
    const [dbProjects, setDbProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Client Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editErrorMessage, setEditErrorMessage] = useState("");
    const [editFormData, setEditFormData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        website: "",
        status: "active",
        notes: ""
    });

    const [user, setUser] = useState(null);

    // Fetch Live Client and Projects from MongoDB Database
    useEffect(() => {
        async function fetchClientDetails() {
            setIsLoading(true);
            try {
                api.get("/auth/me").then(res => {
                    if (res?.data?.user) setUser(res.data.user);
                }).catch(() => null);

                let raw = null;
                // Try direct getClientById or search list
                try {
                    const res = await clientService.getClientById(clientId);
                    if (res && res.client) raw = res.client;
                } catch (e) {
                    // Search list fallback
                }

                if (!raw) {
                    const listRes = await clientService.getClients();
                    if (listRes?.clients) {
                        raw = listRes.clients.find(c => c._id === clientId || c.id === clientId) || listRes.clients[0];
                    }
                }

                if (raw) {
                    const companyName = raw.company || raw.name || "Client Account";
                    const words = companyName.split(" ");
                    const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : companyName.substring(0, 2).toUpperCase();

                    setDbClient({
                        id: raw._id || raw.id,
                        name: companyName,
                        initials: initials,
                        badge: raw.status === "inactive" ? "INACTIVE ACCOUNT" : "KEY ACCOUNT",
                        rating: "5.0 / 5.0",
                        industry: "Enterprise Client",
                        contactPerson: raw.name || "Primary Contact",
                        email: raw.email || "contact@company.com",
                        phone: raw.phone || "+1 (555) 000-0000",
                        website: raw.website || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
                        location: "Global",
                        status: (raw.status || "active").toUpperCase(),
                        notes: raw.notes || "Live MongoDB Client Record",
                        createdAt: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString() : "2026"
                    });
                }

                // Fetch linked projects from backend
                const projRes = await projectService.getProjects().catch(() => null);
                if (projRes && projRes.projects && Array.isArray(projRes.projects)) {
                    const targetId = raw ? (raw._id || raw.id) : clientId;
                    const clientProjs = projRes.projects.filter(p => p.client === targetId || p.client?._id === targetId);
                    setDbProjects(clientProjs);
                }
            } catch (err) {
                console.warn("Client details fetch info:", err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchClientDetails();
    }, [clientId]);

    const handleDeleteClient = async () => {
        if (!dbClient) return;
        if (confirm(`Are you sure you want to delete client "${dbClient.name}" permanently from MongoDB database?`)) {
            setIsDeleting(true);
            try {
                await clientService.deleteClient(dbClient.id);
            } catch (err) {
                console.warn("Delete API info:", err.message);
            }
            router.push("/clients");
        }
    };

    const openEditModal = () => {
        if (!dbClient) return;
        setEditFormData({
            name: dbClient.contactPerson || "",
            company: dbClient.name || "",
            email: dbClient.email || "",
            phone: dbClient.phone || "",
            website: dbClient.website || "",
            status: dbClient.status === "INACTIVE" ? "inactive" : "active",
            notes: dbClient.notes || ""
        });
        setEditErrorMessage("");
        setIsEditModalOpen(true);
    };

    const handleSaveClientEdits = async (e) => {
        e.preventDefault();
        if (!editFormData.company.trim()) {
            setEditErrorMessage("Company name is required");
            return;
        }

        if (editFormData.phone && editFormData.phone.length !== 10) {
            setEditErrorMessage("Phone number must be exactly 10 digits");
            return;
        }

        setIsUpdating(true);
        setEditErrorMessage("");

        try {
            await clientService.updateClient(dbClient.id, {
                name: editFormData.name,
                company: editFormData.company,
                email: editFormData.email,
                phone: editFormData.phone,
                status: editFormData.status,
                notes: editFormData.notes
            });

            const companyName = editFormData.company.trim();
            const words = companyName.split(" ");
            const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : companyName.substring(0, 2).toUpperCase();

            setDbClient(prev => ({
                ...prev,
                name: companyName,
                initials: initials,
                contactPerson: editFormData.name || prev.contactPerson,
                email: editFormData.email || prev.email,
                phone: editFormData.phone || prev.phone,
                website: editFormData.website || prev.website,
                status: editFormData.status.toUpperCase(),
                badge: editFormData.status === "inactive" ? "INACTIVE ACCOUNT" : "KEY ACCOUNT",
                notes: editFormData.notes
            }));

            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Client update error:", err);
            setEditErrorMessage(err.message || "Failed to update client record");
        } finally {
            setIsUpdating(false);
        }
    };

    // Dynamic project history & revenue
    const projectHistory = dbProjects.map(p => ({
        name: p.title,
        date: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "Dec 2026",
        status: (p.status || "planning").toUpperCase(),
        revenue: p.revenue ? `₹${Number(p.revenue).toLocaleString()}` : "₹0"
    }));

    const totalCalculatedRevenue = dbProjects.length > 0
        ? `₹${dbProjects.reduce((acc, p) => acc + (p.revenue || 0), 0).toLocaleString()}`
        : "₹0";

    const handleExportClientRecord = () => {
        if (!dbClient) {
            alert("No client details available to export.");
            return;
        }

        // Sheet 1: Client Overview & Contact Information
        const clientOverviewData = [
            { Field: "Client / Company Name", Value: dbClient.name || "N/A" },
            { Field: "Contact Person", Value: dbClient.contactPerson || "N/A" },
            { Field: "Email Address", Value: dbClient.email || "N/A" },
            { Field: "Phone Number", Value: dbClient.phone || "N/A" },
            { Field: "Website", Value: dbClient.website || "N/A" },
            { Field: "Engagement Status", Value: dbClient.status || "N/A" },
            { Field: "Account Badge", Value: dbClient.badge || "N/A" },
            { Field: "Rating", Value: dbClient.rating || "5.0 / 5.0" },
            { Field: "Industry", Value: dbClient.industry || "N/A" },
            { Field: "Retention Score", Value: "98.5%" },
            { Field: "Total Projects Count", Value: dbProjects.length },
            { Field: "Total Revenue", Value: totalCalculatedRevenue },
            { Field: "Created Date", Value: dbClient.createdAt || "N/A" },
            { Field: "Notes & Summary", Value: dbClient.notes || "N/A" }
        ];

        const sheet1 = XLSX.utils.json_to_sheet(clientOverviewData);
        sheet1["!cols"] = [{ wch: 28 }, { wch: 50 }];

        // Sheet 2: Project History & Contracts
        const projectHistoryData = projectHistory.length > 0
            ? projectHistory.map((proj, idx) => ({
                "S.No": idx + 1,
                "Project Name": proj.name || "N/A",
                "Target Date": proj.date || "N/A",
                "Status": proj.status || "N/A",
                "Revenue Value": proj.revenue || "₹0"
            }))
            : [{ "S.No": "-", "Project Name": "No projects linked to this client", "Target Date": "-", "Status": "-", "Revenue Value": "-" }];

        const sheet2 = XLSX.utils.json_to_sheet(projectHistoryData);
        sheet2["!cols"] = [{ wch: 6 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 18 }];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet1, "Client Details");
        XLSX.utils.book_append_sheet(workbook, sheet2, "Project History");

        const sanitizedName = (dbClient.name || "Client").replace(/[^a-zA-Z0-9]/g, "_");
        const today = new Date().toISOString().split("T")[0];
        XLSX.writeFile(workbook, `Client_Record_${sanitizedName}_${today}.xlsx`);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar active="clients" />

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search client database..."
                        />
                    </div>

                    <div className="header-right">
                        <div className="icons">
                            <Bell size={20} />
                        </div>

                        <div className="icons help-tooltip-wrapper">
                            <CircleHelp size={20} />
                            <div className="help-tooltip-popover">
                                Client Profile — View client contact details, engagement history, linked projects, and retention metrics.
                            </div>
                        </div>

                        <Link href="/profile">
                            <div className="profile" style={{ cursor: "pointer" }}>
                                <div className="profile-text">
                                    <h4>{user?.name || "User"}</h4>
                                    <span>{user?.role?.toUpperCase() || "ADMINISTRATOR"}</span>
                                </div>
                                <img
                                    src={
                                        user?.avatarUrl ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            user?.name || "User"
                                        )}`
                                    }
                                    alt={user?.name || "Profile"}
                                />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Body Content */}
                <div className="dashboard">
                    {/* Action Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                        <button
                            onClick={() => router.push("/clients")}
                            style={{ background: "none", border: "none", color: "#002045", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            <ArrowLeft size={18} /> Back to Client Directory
                        </button>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="dashboard-btn-secondary" onClick={handleExportClientRecord}>
                                <Download size={16} /> Export Record
                            </button>
                            <button
                                className="dashboard-btn-primary"
                                onClick={openEditModal}
                            >
                                <Edit size={16} /> Edit Client
                            </button>
                            {dbClient && (
                                <button
                                    onClick={handleDeleteClient}
                                    disabled={isDeleting}
                                    style={{ background: "#ba1a1a", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                                >
                                    <Trash2 size={16} /> {isDeleting ? "Deleting..." : "Delete Client"}
                                </button>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>
                            Loading live client record from MongoDB database...
                        </div>
                    ) : !dbClient ? (
                        <div style={{ padding: "60px", textAlign: "center", color: "#777", background: "#fff", borderRadius: "16px" }}>
                            <Building size={48} color="#002045" style={{ marginBottom: "15px", opacity: 0.5 }} />
                            <h2>Client Record Not Found</h2>
                            <p style={{ margin: "10px 0 20px" }}>The requested client record does not exist in your MongoDB database.</p>
                            <Link href="/clients" className="dashboard-btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
                                Back to Client Directory
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Profile Header Hero Card */}
                            <div className="dashboard-form-card" style={{ marginTop: 0, padding: "30px", position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "25px", alignItems: "center" }}>
                                    {/* Logo Badge */}
                                    <div style={{ width: "90px", height: "90px", borderRadius: "16px", background: "#002045", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 900, flexShrink: 0 }}>
                                        {dbClient.initials}
                                    </div>

                                    {/* Client Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                                            <h1 style={{ color: "#002045", fontSize: "32px", margin: 0 }}>{dbClient.name}</h1>
                                            <span className={`badge ${dbClient.status === "INACTIVE" ? "yellow" : "green"}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: dbClient.status === "INACTIVE" ? "#ffeaea" : undefined, color: dbClient.status === "INACTIVE" ? "#d63031" : undefined }}>
                                                <ShieldCheck size={14} /> {dbClient.badge}
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#666", fontSize: "14px", flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f4c430" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={15} fill="#f4c430" stroke="#f4c430" />
                                                ))}
                                                <span style={{ color: "#333", fontWeight: "bold", marginLeft: "6px" }}>{dbClient.rating}</span>
                                            </div>
                                            <span>•</span>
                                            <span>Industry: <strong style={{ color: "#002045" }}>{dbClient.industry}</strong></span>
                                        </div>

                                        {/* Contact Details Row */}
                                        <div style={{ display: "flex", gap: "25px", flexWrap: "wrap", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #eee", fontSize: "14px", color: "#555" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <User size={16} color="#002045" /> Contact: <strong style={{ color: "#002045" }}>{dbClient.contactPerson}</strong>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Mail size={16} color="#002045" /> <a href={`mailto:${dbClient.email}`} style={{ color: "#002045", textDecoration: "underline" }}>{dbClient.email}</a>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Phone size={16} color="#002045" /> {dbClient.phone}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Globe size={16} color="#002045" /> <a href="#" style={{ color: "#002045", textDecoration: "underline" }}>{dbClient.website}</a>
                                            </div>
                                            {dbClient.createdAt && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <Clock size={16} color="#002045" /> Created: <strong style={{ color: "#002045" }}>{dbClient.createdAt}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Engagement Status Badge */}
                                    <div style={{ padding: "12px 24px", background: dbClient.status === "INACTIVE" ? "#ffeaea" : "#eef4ff", border: `1px solid ${dbClient.status === "INACTIVE" ? "#ffcdd2" : "#dfe9ff"}`, borderRadius: "12px", textAlign: "center" }}>
                                        <span style={{ fontSize: "11px", color: dbClient.status === "INACTIVE" ? "#d63031" : "#777", textTransform: "uppercase", display: "block" }}>Engagement Status</span>
                                        <strong style={{ fontSize: "18px", color: dbClient.status === "INACTIVE" ? "#d63031" : "#002045" }}>{dbClient.status}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Bento Grid */}
                            <div className="kpi-grid" style={{ marginTop: "25px" }}>
                                <div className="kpi-card">
                                    <div className="card-top">
                                        <div className="icon-box employee-icon">
                                            <CheckCircle2 size={26} color="#002045" />
                                        </div>
                                    </div>
                                    <div className="card-title">Projects Count</div>
                                    <h2>{dbProjects.length}</h2>
                                </div>

                                <div className="kpi-card">
                                    <div className="card-top">
                                        <div className="icon-box revenue-icon">
                                            <IndianRupee size={26} color="#002045" />
                                        </div>
                                    </div>
                                    <div className="card-title">Total Revenue</div>
                                    <h2>{totalCalculatedRevenue}</h2>
                                </div>

                                <div className="kpi-card">
                                    <div className="card-top">
                                        <div className="icon-box project-icon">
                                            <TrendingUp size={26} color="#002045" />
                                        </div>
                                    </div>
                                    <div className="card-title">Retention Score</div>
                                    <h2>98.5%</h2>
                                </div>
                            </div>

                            {/* Project History Section */}
                            <div className="dashboard-table-container">
                                <div className="dashboard-table-header">
                                    <h3>Project History &amp; Contracts</h3>
                                    <button className="dashboard-btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                                        View All Projects
                                    </button>
                                </div>

                                {projectHistory.length === 0 ? (
                                    <div style={{ padding: "30px", textAlign: "center", color: "#777" }}>
                                        No active projects linked to this client in MongoDB database yet.
                                    </div>
                                ) : (
                                    <table className="dashboard-table">
                                        <thead>
                                            <tr>
                                                <th>Project Name</th>
                                                <th>Target Date</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: "right" }}>Revenue Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projectHistory.map((proj, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: "bold", color: "#002045" }}>{proj.name}</td>
                                                    <td style={{ color: "#666" }}>{proj.date}</td>
                                                    <td>
                                                        <span className="badge green">{proj.status}</span>
                                                    </td>
                                                    <td style={{ textAlign: "right", fontWeight: "bold", color: "#002045" }}>{proj.revenue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Client Notes / Engagement Summary */}
                            {dbClient.notes && (
                                <div className="overview-card" style={{ marginTop: "30px" }}>
                                    <div className="section-header">
                                        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <FileText size={20} color="#002045" /> Client Notes &amp; Engagement Summary
                                        </h3>
                                    </div>
                                    <div style={{ background: "#f8fbff", padding: "20px", borderRadius: "12px", borderLeft: "4px solid #002045" }}>
                                        <p style={{ fontSize: "15px", color: "#002045", lineHeight: "24px", margin: 0 }}>
                                            {dbClient.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit Client Modal Overlay */}
            {isEditModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 32, 69, 0.4)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    padding: "20px"
                }}>
                    <div style={{
                        background: "#fff",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "650px",
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
                                <h2 style={{ margin: 0, color: "#002045", fontSize: "20px" }}>Edit Client Information</h2>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={handleSaveClientEdits} style={{ padding: "25px" }}>
                            {editErrorMessage && (
                                <div style={{ background: "#ffeaea", color: "#d63031", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "20px" }}>
                                    {editErrorMessage}
                                </div>
                            )}

                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                {/* Company Name & Contact Person */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Company Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editFormData.company}
                                            onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Contact Person Name</label>
                                        <input
                                            type="text"
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                </div>

                                {/* Email & Phone */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Contact Email</label>
                                        <input
                                            type="email"
                                            value={editFormData.email}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Phone Number (10 digits)</label>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={editFormData.phone}
                                            onChange={(e) => {
                                                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                setEditFormData({ ...editFormData, phone: cleaned });
                                            }}
                                            placeholder="e.g. 9876543210"
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                </div>

                                {/* Website & Status */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Company Website</label>
                                        <input
                                            type="text"
                                            value={editFormData.website}
                                            onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Account Status</label>
                                        <select
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes / Engagement Summary */}
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: "bold", marginBottom: "6px" }}>Account Notes &amp; Engagement Summary</label>
                                    <textarea
                                        rows={4}
                                        value={editFormData.notes}
                                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
                                    ></textarea>
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
                                    disabled={isUpdating}
                                    className="dashboard-btn-primary"
                                >
                                    {isUpdating ? "Saving Changes..." : "Save Client Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
