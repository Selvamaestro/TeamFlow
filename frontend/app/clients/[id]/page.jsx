"use client";

import { useState, use } from "react";
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
    Plus
} from "lucide-react";

export default function ClientDetailPage({ params }) {
    const router = useRouter();
    // Unwrap params if available or default to Global Dynamics Inc.
    const resolvedParams = params ? use(params) : { id: "1" };

    // Sample Client Database mapping
    const clientDataMap = {
        "1": {
            id: 1,
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
                    quote: "The team at AdminPanel has consistently exceeded our expectations. Their Cloud Migration project was seamless, finished ahead of schedule, and the support post-launch has been incredible.",
                    author: "Sarah Jenkins",
                    role: "VP Operations, Global Dynamics",
                    date: "Feb 2024",
                    stars: 5,
                    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                },
                {
                    quote: "Solid technical expertise during the Q4 Infrastructure Audit. We had a few delays due to internal bottlenecks, but the consultants handled the pivots with professionalism.",
                    author: "Mark Thompson",
                    role: "Director of IT Infrastructure",
                    date: "Nov 2023",
                    stars: 4,
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                }
            ]
        },
        "2": {
            id: 2,
            name: "Stratosphere Systems",
            initials: "SS",
            badge: "GROWTH PARTNER",
            rating: "4.5 / 5.0",
            industry: "Cloud & Network Solutions",
            contactPerson: "David Miller",
            email: "billing@stratosphere.io",
            phone: "+1 (555) 345-6789",
            website: "stratosphere.io",
            location: "San Francisco, CA",
            status: "ACTIVE",
            completedProjects: 8,
            totalRevenue: "$310,000",
            retentionScore: "95.0%",
            history: [
                { name: "Cloud Migration V2", date: "Oct 15, 2023", status: "IN REVIEW", revenue: "$120,000" },
                { name: "AWS Cost Optimization", date: "Jul 28, 2023", status: "COMPLETED", revenue: "$95,000" }
            ],
            testimonials: [
                {
                    quote: "Exceptional architecture planning and seamless backend integration across multi-cloud regions.",
                    author: "David Miller",
                    role: "CTO, Stratosphere",
                    date: "Oct 2023",
                    stars: 5,
                    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                }
            ]
        }
    };

    const client = clientDataMap[resolvedParams.id] || clientDataMap["1"];

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
                            placeholder="Search accounts..."
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
                            <ArrowLeft size={18} /> Back to Directory
                        </button>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="dashboard-btn-secondary">
                                <Download size={16} /> Export Data
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
                            <div style={{ width: "90px", height: "90px", borderRadius: "16px", background: "#002045", color: "#fff", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: "32px", fontWeight: 900, shrink: 0 }}>
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
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <MapPin size={16} color="#002045" /> {client.location}
                                    </div>
                                </div>
                            </div>

                            {/* Engagement Status Badge */}
                            <div style={{ padding: "12px 24px", background: "#eef4ff", border: "1px solid #dfe9ff", borderRadius: "12px", textAlign: "center" }}>
                                <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", display: "block" }}>Engagement</span>
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
                            <div className="card-title">Projects Completed</div>
                            <h2>{client.completedProjects}</h2>
                        </div>

                        <div className="kpi-card">
                            <div className="card-top">
                                <div className="icon-box revenue-icon">
                                    <DollarSign size={26} color="#002045" />
                                </div>
                            </div>
                            <div className="card-title">Total Revenue</div>
                            <h2>{client.totalRevenue}</h2>
                        </div>

                        <div className="kpi-card">
                            <div className="card-top">
                                <div className="icon-box project-icon">
                                    <TrendingUp size={26} color="#002045" />
                                </div>
                            </div>
                            <div className="card-title">Retention Score</div>
                            <h2>{client.retentionScore}</h2>
                        </div>
                    </div>

                    {/* Project History Section */}
                    <div className="dashboard-table-container">
                        <div className="dashboard-table-header">
                            <h3>Project History</h3>
                            <button className="dashboard-btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                                View All Projects
                            </button>
                        </div>

                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Project Name</th>
                                    <th>Completed</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {client.history.map((proj, idx) => (
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

                    {/* Client Feedback & Testimonials */}
                    <div className="overview-card" style={{ marginTop: "30px" }}>
                        <div className="section-header">
                            <h3>Client Feedback &amp; Testimonials</h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {client.testimonials.map((test, idx) => (
                                <div key={idx} style={{ background: "#f8fbff", padding: "20px", borderRadius: "12px", borderLeft: "4px solid #002045" }}>
                                    <p style={{ fontSize: "15px", fontStyle: "italic", color: "#002045", marginBottom: "15px", lineHeight: "24px" }}>
                                        "{test.quote}"
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <img src={test.avatar} alt={test.author} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                                            <div>
                                                <strong style={{ color: "#002045", display: "block" }}>{test.author}</strong>
                                                <span style={{ fontSize: "12px", color: "#777" }}>{test.role}</span>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: "12px", color: "#888" }}>{test.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
