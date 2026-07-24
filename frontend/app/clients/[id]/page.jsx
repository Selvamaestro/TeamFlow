"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
import Sidebar from "@/components/Sidebar";
import { clientService } from "../../../services/clientService";
import { projectService } from "../../../services/projectService";
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
    FileText
} from "lucide-react";

export default function ClientDetailPage({ params }) {
    const router = useRouter();
    const resolvedParams = params ? use(params) : { id: "1" };
    const clientId = resolvedParams.id;

    const [dbClient, setDbClient] = useState(null);
    const [dbProjects, setDbProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Live Client and Projects from MongoDB Database
    useEffect(() => {
        async function fetchClientDetails() {
            setIsLoading(true);
            try {
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

    // Dynamic project history & revenue
    const projectHistory = dbProjects.map(p => ({
        name: p.title,
        date: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "Dec 2026",
        status: (p.status || "planning").toUpperCase(),
        revenue: p.revenue ? `$${Number(p.revenue).toLocaleString()}` : "$0"
    }));

    const totalCalculatedRevenue = dbProjects.length > 0
        ? `$${dbProjects.reduce((acc, p) => acc + (p.revenue || 0), 0).toLocaleString()}`
        : "$0";

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
                        <Bell className="icons" />
                        <Mail className="icons" />

                        <div className="profile">
                            <img
                                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
                                alt="Elena Rodriguez"
                            />
                            <div>
                                <h4>Elena Rodriguez</h4>
                                <span>Managing Director</span>
                            </div>
                        </div>
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
                            <button className="dashboard-btn-secondary">
                                <Download size={16} /> Export Record
                            </button>
                            <button className="dashboard-btn-primary">
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
                                            <DollarSign size={26} color="#002045" />
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
        </div>
    );
}
