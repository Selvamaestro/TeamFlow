"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
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
    AlertCircle
} from "lucide-react";

export default function ProjectDetailPage({ params }) {
    const router = useRouter();
    const resolvedParams = params ? use(params) : { id: "1" };
    const projectId = resolvedParams.id;

    const [dbProject, setDbProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Default sample project data map
    const mockProjectDataMap = {
        "1": {
            id: 1,
            title: "Q4 Logistics Revamp",
            client: "SwiftShip Logistics",
            lead: "Marcus J.",
            leadRole: "Lead Architect",
            leadAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            status: "In Progress",
            statusType: "blue",
            progress: 65,
            dueDate: "Dec 15, 2023",
            description: "Strategic migration of core legacy systems to a unified cloud-native SaaS infrastructure. This initiative aims to reduce operational latency by 40% and establish a scalable framework for future enterprise integrations.",
            priority: "High - Tier 1",
            revenue: "$85,000",
            subProgress: [
                { title: "Architecture & Design", status: "Completed", percent: 100 },
                { title: "Frontend UI Components", status: "In Progress", percent: 85 },
                { title: "Backend API Integration", status: "In Progress", percent: 40 }
            ],
            milestones: [
                { name: "Database Schema Finalization", owner: "Sarah Chen", ownerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", status: "Completed", priority: "High" },
                { name: "Auth Flow & Role Integration", owner: "Marcus Wright", ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", status: "In Review", priority: "Medium" },
                { name: "AWS Staging Deployment", owner: "Alex Mercer", ownerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80", status: "In Progress", priority: "High" }
            ],
            team: [
                { name: "Sarah Chen", role: "Technical Lead", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", status: "online" },
                { name: "Marcus J.", role: "Senior Developer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", status: "online" },
                { name: "Elena Rodriguez", role: "UI/UX Specialist", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80", status: "away" }
            ],
            activity: [
                { title: "Sarah Chen updated the UI kit", desc: "Refined navigation patterns and updated design tokens for accessibility.", time: "2 hours ago" },
                { title: "Marcus J. pushed code to staging", desc: "Deployed API endpoint structures and security middleware layers.", time: "5 hours ago" },
                { title: "Client Feedback Received", desc: "SwiftShip approved the migration roadmap with minor notes on data retention.", time: "Yesterday" }
            ]
        },
        "2": {
            id: 2,
            title: "Global ERP Integration",
            client: "TerraCorp Industries",
            lead: "Sarah Chen",
            leadRole: "Lead Technical Architect",
            leadAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
            status: "Completed",
            statusType: "green",
            progress: 100,
            dueDate: "Oct 28, 2023",
            description: "End-to-end global ERP platform synchronization across multi-region cloud servers with real-time financial auditing and warehouse tracking.",
            priority: "Critical - Tier 1",
            revenue: "$142,000",
            subProgress: [
                { title: "ERP Schema Integration", status: "Completed", percent: 100 },
                { title: "Financial Audit Pipeline", status: "Completed", percent: 100 },
                { title: "Multi-Region Cloud Sync", status: "Completed", percent: 100 }
            ],
            milestones: [
                { name: "Financial Pipeline Audit", owner: "Sarah Chen", ownerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", status: "Completed", priority: "High" }
            ],
            team: [
                { name: "Sarah Chen", role: "Lead Architect", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", status: "online" }
            ],
            activity: [
                { title: "System Sign-Off Completed", desc: "TerraCorp approved final production ERP synchronization.", time: "3 days ago" }
            ]
        }
    };

    // Load Live Project from MongoDB
    useEffect(() => {
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
                    setDbProject({
                        id: raw._id || raw.id,
                        title: raw.title || "Project Initiative",
                        client: typeof raw.client === "object" ? (raw.client.company || raw.client.name) : "Client Enterprise",
                        lead: "Sarah Chen",
                        leadRole: "Lead Technical Architect",
                        leadAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
                        status: raw.status ? (raw.status.charAt(0).toUpperCase() + raw.status.slice(1)) : "In Progress",
                        statusType: raw.status === "completed" ? "green" : raw.status === "delayed" ? "red" : "blue",
                        progress: raw.status === "completed" ? 100 : 65,
                        dueDate: raw.dueDate ? new Date(raw.dueDate).toLocaleDateString() : "Dec 2026",
                        description: raw.description || "Core enterprise software engineering workflow and infrastructure implementation.",
                        priority: "High - Tier 1",
                        revenue: raw.revenue ? `$${Number(raw.revenue).toLocaleString()}` : "$50,000",
                        subProgress: [
                            { title: "Architecture & Design", status: "Completed", percent: 100 },
                            { title: "Frontend UI Components", status: "In Progress", percent: 80 },
                            { title: "Backend API Integration", status: "In Progress", percent: 60 }
                        ],
                        milestones: [
                            { name: "Database Schema Finalization", owner: "Sarah Chen", ownerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", status: "Completed", priority: "High" },
                            { name: "API Route Security & CORS", owner: "Alex Mercer", ownerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80", status: "In Progress", priority: "High" }
                        ],
                        team: [
                            { name: "Sarah Chen", role: "Lead Architect", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", status: "online" },
                            { name: "Marcus J.", role: "Senior Developer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", status: "online" }
                        ],
                        activity: [
                            { title: "Project Registered in Database", desc: "Live record retrieved from MongoDB backend.", time: "Live Data" }
                        ]
                    });
                }
            } catch (err) {
                console.warn("Project details fetch info:", err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProjectDetails();
    }, [projectId]);

    const project = dbProject || mockProjectDataMap[projectId] || mockProjectDataMap["1"];

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

            {/* Main Content Area */}
            <div className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search project milestones, tasks..."
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
                            <button className="dashboard-btn-secondary">
                                <Edit size={16} /> Edit Project
                            </button>
                            <button className="dashboard-btn-primary">
                                <CheckCircle2 size={16} /> Complete Milestone
                            </button>
                        </div>
                    </div>

                    {/* Title & Status Badge Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                            <h1 style={{ color: "#002045", fontSize: "32px", margin: 0 }}>{project.title}</h1>
                            <span className={`badge ${project.statusType === "green" ? "green" : project.statusType === "red" ? "yellow" : "badge"}`} style={{ padding: "6px 14px", fontSize: "13px" }}>
                                ● {project.status}
                            </span>
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#002045" }}>
                            Contract Revenue: <span style={{ color: "#169c52" }}>{project.revenue}</span>
                        </div>
                    </div>

                    {/* Main Bento 2-Column Grid */}
                    <div className="overview-grid" style={{ gridTemplateColumns: "1.8fr 1fr", gap: "25px" }}>
                        {/* LEFT COLUMN: Overview, Progress, Milestones */}
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
                                    <div style={{ background: "#f8fbff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", minWidth: "140px" }}>
                                        <Calendar size={24} color="#002045" style={{ marginBottom: "4px" }} />
                                        <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", display: "block" }}>Target Due Date</span>
                                        <strong style={{ fontSize: "15px", color: "#002045" }}>{project.dueDate}</strong>
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
                                            <Sparkles size={18} color="#002045" />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: "12px", color: "#777", display: "block" }}>Priority Level</span>
                                            <strong style={{ color: "#002045" }}>{project.priority}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Development Progress Section */}
                            <div className="overview-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                    <h3 style={{ color: "#002045", fontSize: "20px", margin: 0 }}>Development Progress</h3>
                                    <span style={{ fontSize: "24px", fontWeight: "bold", color: "#002045" }}>{project.progress}%</span>
                                </div>

                                <div className="progress" style={{ height: "14px", borderRadius: "8px", marginBottom: "20px" }}>
                                    <div
                                        className="progress-fill employee-progress"
                                        style={{ width: `${project.progress}%`, background: project.statusType === "green" ? "#169c52" : "#002045" }}
                                    ></div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                                    {project.subProgress?.map((sub, idx) => (
                                        <div key={idx} style={{ background: "#f8fbff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                            <span style={{ fontSize: "12px", color: "#777", display: "block", marginBottom: "4px" }}>{sub.title}</span>
                                            <strong style={{ fontSize: "15px", color: "#002045" }}>{sub.status} ({sub.percent}%)</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Milestones & Tasks Table */}
                            <div className="dashboard-table-container" style={{ marginTop: 0 }}>
                                <div className="dashboard-table-header">
                                    <h3>Key Milestones &amp; Tasks</h3>
                                    <button className="dashboard-btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                                        <Plus size={14} /> Add Milestone
                                    </button>
                                </div>

                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Task / Milestone</th>
                                            <th>Owner</th>
                                            <th>Status</th>
                                            <th>Priority</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {project.milestones?.map((m, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: "bold", color: "#002045" }}>{m.name}</td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <img src={m.ownerAvatar} alt={m.owner} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                                                        <span style={{ fontSize: "13px", color: "#333" }}>{m.owner}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${m.status === "Completed" ? "green" : "blue"}`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong style={{ fontSize: "12px", color: m.priority === "High" ? "#d63031" : "#002045" }}>{m.priority}</strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Team & Activity */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                            {/* Assigned Team Card */}
                            <div className="overview-card" style={{ marginTop: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                    <h3 style={{ color: "#002045", fontSize: "18px", margin: 0 }}>Assigned Team</h3>
                                    <button style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                        <UserPlus size={16} color="#002045" />
                                    </button>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                    {project.team?.map((member, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <img src={member.avatar} alt={member.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                                                <div>
                                                    <strong style={{ color: "#002045", display: "block", fontSize: "14px" }}>{member.name}</strong>
                                                    <span style={{ fontSize: "12px", color: "#777" }}>{member.role}</span>
                                                </div>
                                            </div>
                                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: member.status === "online" ? "#169c52" : "#94a3b8" }}></span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity Timeline */}
                            <div className="overview-card">
                                <h3 style={{ color: "#002045", fontSize: "18px", marginBottom: "20px" }}>Recent Activity Timeline</h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                    {project.activity?.map((act, idx) => (
                                        <div key={idx} style={{ background: "#f8fbff", padding: "14px", borderRadius: "10px", borderLeft: "4px solid #002045" }}>
                                            <strong style={{ color: "#002045", fontSize: "14px", display: "block" }}>{act.title}</strong>
                                            <p style={{ color: "#555", fontSize: "13px", margin: "4px 0", lineHeight: "18px" }}>{act.desc}</p>
                                            <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{act.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
