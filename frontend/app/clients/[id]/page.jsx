"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
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

    // Initial mock data map fallback
    const mockClientDataMap = {
        "1": {
            id: "1",
            name: "Global Dynamics Inc.",
            initials: "GD",
            badge: "KEY ACCOUNT",
            rating: "4.8 / 5.0",
            industry: "Global Logistics & Tech",
            contactPerson: "Sarah Jenkins",
            email: "s.jenkins@global-dynamics.com",
            phone: "+1 (555) 902-1432",
            website: "global-dynamics.com",
            location: "Austin, TX",
            status: "ACTIVE",
            completedProjects: 12,
            totalRevenue: "$450,000",
            retentionScore: "98.4%",
            history: [
                { name: "Q4 Infrastructure Audit", date: "Nov 12, 2023", status: "COMPLETED", revenue: "$85,000" },
                { name: "Cloud Migration Phase 2", date: "Sep 05, 2023", status: "COMPLETED", revenue: "$142,000" },
                { name: "Legacy System Deprecation", date: "Jul 20, 2023", status: "COMPLETED", revenue: "$64,500" },
                { name: "Security Protocol Update", date: "May 14, 2023", status: "COMPLETED", revenue: "$38,000" }
            ],
            testimonials: [
                {
                    quote: "The team at AdminSuite has consistently exceeded our expectations. Their Cloud Migration project was seamless, finished ahead of schedule, and the support post-launch has been incredible.",
                    author: "Sarah Jenkins",
                    role: "VP Operations, Global Dynamics",
                    date: "Feb 2024",
                    stars: 5,
                    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                }
            ]
        },
        "6a5f378992ca99522f4c65e7": {
            id: "6a5f378992ca99522f4c65e7",
            name: "Acme Corp",
            initials: "AC",
            badge: "KEY ACCOUNT",
            rating: "5.0 / 5.0",
            industry: "Enterprise Solutions",
            contactPerson: "Acme Contact",
            email: "contact@acme.test",
            phone: "1234567890",
            website: "acme.test",
            location: "New York, NY",
            status: "ACTIVE",
            completedProjects: 1,
            totalRevenue: "$50,000",
            retentionScore: "99.0%",
            history: [
                { name: "Website Revamp", date: "Dec 01, 2026", status: "PLANNING", revenue: "$50,000" }
            ],
            testimonials: [
                {
                    quote: "Acme Corp enterprise client initialized in MongoDB cluster.",
                    author: "Acme Executive",
                    role: "CEO, Acme Corp",
                    date: "Jul 2026",
                    stars: 5,
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                }
            ]
        },
        "6a606371039407e86e40f68d": {
            id: "6a606371039407e86e40f68d",
            name: "ABCD Corp",
            initials: "AB",
            badge: "ENTERPRISE",
            rating: "4.9 / 5.0",
            industry: "Healthcare & Tech",
            contactPerson: "ABCD Representative",
            email: "contact@abcd.test",
            phone: "1234567890",
            website: "abcd.test",
            location: "Boston, MA",
            status: "ACTIVE",
            completedProjects: 1,
            totalRevenue: "$5,000,000",
            retentionScore: "98.5%",
            history: [
                { name: "Website PureDent", date: "Dec 01, 2026", status: "PLANNING", revenue: "$5,000,000" }
            ],
            testimonials: [
                {
                    quote: "ABCD Corp digital transformation project managed through TeamFlow enterprise backend.",
                    author: "PureDent Director",
                    role: "VP Tech, ABCD Corp",
                    date: "Jul 2026",
                    stars: 5,
                    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                }
            ]
        }
    };

    // Load Live Client and Projects from MongoDB Database
    useEffect(() => {
        async function fetchClientDetails() {
            setIsLoading(true);
            try {
                // Try direct getClientById or search list
                let clientRes = null;
                try {
                    clientRes = await clientService.getClientById(clientId);
                } catch (e) {
                    const listRes = await clientService.getClients();
                    if (listRes?.clients) {
                        const matched = listRes.clients.find(c => c._id === clientId || c.id === clientId);
                        if (matched) clientRes = { client: matched };
                    }
                }

                if (clientRes && clientRes.client) {
                    const raw = clientRes.client;
                    const companyName = raw.company || raw.name || "Client Account";
                    const words = companyName.split(" ");
                    const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : companyName.substring(0, 2).toUpperCase();

                    setDbClient({
                        id: raw._id || raw.id,
                        name: companyName,
                        initials: initials,
                        badge: raw.status === "active" ? "KEY ACCOUNT" : "INACTIVE",
                        rating: "4.9 / 5.0",
                        industry: "Enterprise Client",
                        contactPerson: raw.name || "Primary Contact",
                        email: raw.email || "contact@company.com",
                        phone: raw.phone || "+1 (555) 000-0000",
                        website: raw.website || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
                        location: "Global",
                        status: (raw.status || "active").toUpperCase(),
                        notes: raw.notes || "Live MongoDB Client Record",
                        createdAt: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString() : "Jul 2026"
                    });
                }

                // Fetch linked projects from backend
                const projRes = await projectService.getProjects().catch(() => null);
                if (projRes && projRes.projects && Array.isArray(projRes.projects)) {
                    const clientProjs = projRes.projects.filter(p => p.client === clientId || p.client?._id === clientId);
                    setDbProjects(clientProjs);
                }
            } catch (err) {
                console.log("Using client details state:", err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchClientDetails();
    }, [clientId]);

    // Active client object
    const client = dbClient || mockClientDataMap[clientId] || mockClientDataMap["1"];

    // Compute dynamic project history & revenue
    const projectHistory = dbProjects.length > 0 ? dbProjects.map(p => ({
        name: p.title,
        date: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "Dec 2026",
        status: (p.status || "planning").toUpperCase(),
        revenue: p.revenue ? `$${Number(p.revenue).toLocaleString()}` : "$0"
    })) : client.history || [];

    const totalCalculatedRevenue = dbProjects.length > 0
        ? `$${dbProjects.reduce((acc, p) => acc + (p.revenue || 0), 0).toLocaleString()}`
        : client.totalRevenue || "$0";

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

                    <Link href="/projects">
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

                    <Link href="/clients" className="active">
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
                        </div>
                    </div>

                    {/* Profile Header Hero Card */}
                    <div className="dashboard-form-card" style={{ marginTop: 0, padding: "30px", position: "relative", overflow: "hidden" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "25px", alignItems: "center" }}>
                            {/* Logo Badge */}
                            <div style={{ width: "90px", height: "90px", borderRadius: "16px", background: "#002045", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 900, flexShrink: 0 }}>
                                {client.initials}
                            </div>

                            {/* Client Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                                    <h1 style={{ color: "#002045", fontSize: "32px", margin: 0 }}>{client.name}</h1>
                                    <span className="badge green" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <ShieldCheck size={14} /> {client.badge}
                                    </span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#666", fontSize: "14px", flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f4c430" }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={15} fill="#f4c430" stroke="#f4c430" />
                                        ))}
                                        <span style={{ color: "#333", fontWeight: "bold", marginLeft: "6px" }}>{client.rating}</span>
                                    </div>
                                    <span>•</span>
                                    <span>Industry: <strong style={{ color: "#002045" }}>{client.industry}</strong></span>
                                </div>

                                {/* Contact Details Row */}
                                <div style={{ display: "flex", gap: "25px", flexWrap: "wrap", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #eee", fontSize: "14px", color: "#555" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <User size={16} color="#002045" /> Contact: <strong style={{ color: "#002045" }}>{client.contactPerson}</strong>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Mail size={16} color="#002045" /> <a href={`mailto:${client.email}`} style={{ color: "#002045", textDecoration: "underline" }}>{client.email}</a>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Phone size={16} color="#002045" /> {client.phone}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Globe size={16} color="#002045" /> <a href="#" style={{ color: "#002045", textDecoration: "underline" }}>{client.website}</a>
                                    </div>
                                    {client.createdAt && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Clock size={16} color="#002045" /> Created: <strong style={{ color: "#002045" }}>{client.createdAt}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Engagement Status Badge */}
                            <div style={{ padding: "12px 24px", background: "#eef4ff", border: "1px solid #dfe9ff", borderRadius: "12px", textAlign: "center" }}>
                                <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", display: "block" }}>Engagement Status</span>
                                <strong style={{ fontSize: "18px", color: "#002045" }}>{client.status}</strong>
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
                            <h2>{dbProjects.length > 0 ? dbProjects.length : client.completedProjects || 1}</h2>
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
                            <h2>{client.retentionScore || "98.5%"}</h2>
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
                    </div>

                    {/* Client Notes / Engagement Summary */}
                    {client.notes && (
                        <div className="overview-card" style={{ marginTop: "30px" }}>
                            <div className="section-header">
                                <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FileText size={20} color="#002045" /> Client Notes &amp; Engagement Summary
                                </h3>
                            </div>
                            <div style={{ background: "#f8fbff", padding: "20px", borderRadius: "12px", borderLeft: "4px solid #002045" }}>
                                <p style={{ fontSize: "15px", color: "#002045", lineHeight: "24px", margin: 0 }}>
                                    {client.notes}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
