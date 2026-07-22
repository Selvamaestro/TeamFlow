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
    Building,
    Cloud,
    Dna,
    Home,
    Phone,
    Globe,
    Calendar,
    Star,
    ChevronRight,
    Download,
    Send,
    Check,
    X
} from "lucide-react";

export default function ClientsPage() {
    const [selectedClientIndex, setSelectedClientIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Initial Clients Data
    const [clientsList, setClientsList] = useState([
        {
            id: 1,
            name: "Global Dynamics Inc.",
            email: "contact@globaldyn.com",
            phone: "+1 (555) 012-9988",
            website: "www.globaldyn.com",
            project: "Infrastructure Alpha",
            status: "Active",
            rating: 5.0,
            badge: "Key Account",
            since: "2021",
            progress: 78,
            deadline: "Oct 24, 2024",
            quote: "The team at AdminSuite has consistently exceeded our expectations for scalability and responsiveness. Our infrastructure migration was handled with professional precision.",
            iconType: "corporate",
            touchpoints: [
                { title: "Quarterly Business Review", time: "Yesterday, 2:30 PM • Zoom Meeting" },
                { title: "Phase 2 Sign-off Received", time: "Aug 12, 2024 • Email Transaction" },
                { title: "New Account Manager Assigned", time: "Aug 05, 2024 • System Event" }
            ]
        },
        {
            id: 2,
            name: "Stratosphere Systems",
            email: "billing@stratosphere.io",
            phone: "+1 (555) 345-6789",
            website: "www.stratosphere.io",
            project: "Cloud Migration V2",
            status: "In Review",
            rating: 4.5,
            badge: "Growth Partner",
            since: "2022",
            progress: 45,
            deadline: "Nov 15, 2024",
            quote: "Exceptional architecture planning and seamless backend integration across multi-cloud regions.",
            iconType: "cloud",
            touchpoints: [
                { title: "Architecture Review Meeting", time: "3 days ago • In-Person" },
                { title: "AWS Cost Optimization Report", time: "Jul 28, 2024 • PDF Shared" }
            ]
        },
        {
            id: 3,
            name: "Lumina Bio-Tech",
            email: "ops@lumina.com",
            phone: "+1 (555) 987-6543",
            website: "www.lumina.com",
            project: "CRISPR Dashboard",
            status: "Delayed",
            rating: 3.5,
            badge: "Enterprise",
            since: "2023",
            progress: 30,
            deadline: "Dec 01, 2024",
            quote: "Solid core system, working together to streamline genomic data pipeline speeds.",
            iconType: "dna",
            touchpoints: [
                { title: "Security Compliance Audit", time: "1 week ago • Audit Report" }
            ]
        },
        {
            id: 4,
            name: "Apex Real Estate",
            email: "mktg@apex.net",
            phone: "+1 (555) 456-1122",
            website: "www.apex.net",
            project: "CRM Integration",
            status: "On Hold",
            rating: 4.0,
            badge: "Standard",
            since: "2023",
            progress: 92,
            deadline: "Jan 10, 2025",
            quote: "Smooth property listing workflow synchronization across our regional broker teams.",
            iconType: "home",
            touchpoints: [
                { title: "Contract Renewal Discussions", time: "2 weeks ago • Phone Call" }
            ]
        }
    ]);

    // Modal Form State
    const [newClientForm, setNewClientForm] = useState({
        name: "",
        email: "",
        phone: "",
        website: "",
        project: "",
        badge: "Key Account"
    });

    const handleCreateClient = (e) => {
        e.preventDefault();
        if (!newClientForm.name) return;

        const created = {
            id: Date.now(),
            name: newClientForm.name,
            email: newClientForm.email || "info@company.com",
            phone: newClientForm.phone || "+1 (555) 000-1111",
            website: newClientForm.website || "www.company.com",
            project: newClientForm.project || "New System Integration",
            status: "Active",
            rating: 5.0,
            badge: newClientForm.badge,
            since: "2024",
            progress: 15,
            deadline: "Dec 31, 2024",
            quote: "Excited to partner with AdminSuite on our upcoming digital transformation initiative.",
            iconType: "corporate",
            touchpoints: [
                { title: "Onboarding Call Completed", time: "Just Now • Welcome Call" }
            ]
        };

        setClientsList(prev => [created, ...prev]);
        setSelectedClientIndex(0);
        setShowNewClientModal(false);
        setNewClientForm({ name: "", email: "", phone: "", website: "", project: "", badge: "Key Account" });
    };

    const handleSendFeedback = () => {
        if (!feedbackText.trim()) return;
        setFeedbackSubmitted(true);

        setClientsList(prev => prev.map((c, i) => {
            if (i === selectedClientIndex) {
                return {
                    ...c,
                    touchpoints: [
                        { title: `Feedback Logged: "${feedbackText.substring(0, 30)}..."`, time: "Just Now • Direct Feedback" },
                        ...c.touchpoints
                    ]
                };
            }
            return c;
        }));

        setTimeout(() => {
            setFeedbackText("");
            setFeedbackSubmitted(false);
        }, 1500);
    };

    const filteredClients = clientsList.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedClient = filteredClients[selectedClientIndex] || filteredClients[0] || clientsList[0];

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
                    <button className="project-btn" onClick={() => setShowNewClientModal(true)}>
                        <Plus size={18} />
                        New Client
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search clients, projects, emails..."
                        />
                    </div>

                    <div className="header-right">
                        <Bell className="icons" />
                        <CircleHelp className="icons" />

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

                {/* Dashboard Page Body */}
                <div className="dashboard">
                    <div className="title-actions">
                        <div className="title">
                            <h1>Client Directory</h1>
                            <p>Manage your global client relationships and active contracts.</p>
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="dashboard-btn-secondary">
                                <Download size={16} /> Export List
                            </button>
                            <button
                                className="dashboard-btn-primary"
                                onClick={() => setShowNewClientModal(true)}
                            >
                                <Plus size={16} /> New Client
                            </button>
                        </div>
                    </div>

                    {/* Overview Grid Layout */}
                    <div className="overview-grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
                        {/* LEFT: Client Table */}
                        <div className="dashboard-table-container" style={{ marginTop: 0 }}>
                            <div className="dashboard-table-header">
                                <h3>All Clients ({filteredClients.length})</h3>
                            </div>

                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Client Name</th>
                                        <th>Project</th>
                                        <th>Rating</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map((client, idx) => {
                                        const isSelected = selectedClient?.id === client.id;
                                        return (
                                            <tr
                                                key={client.id}
                                                onClick={() => setSelectedClientIndex(idx)}
                                                className={isSelected ? "active-row" : ""}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div className="icon-box employee-icon" style={{ width: "40px", height: "40px", fontSize: "18px" }}>
                                                            {client.iconType === "corporate" && <Building size={18} color="#002045" />}
                                                            {client.iconType === "cloud" && <Cloud size={18} color="#002045" />}
                                                            {client.iconType === "dna" && <Dna size={18} color="#002045" />}
                                                            {client.iconType === "home" && <Home size={18} color="#002045" />}
                                                        </div>
                                                        <div>
                                                            <strong style={{ color: "#002045", display: "block" }}>{client.name}</strong>
                                                            <span style={{ fontSize: "12px", color: "#777" }}>{client.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong style={{ color: "#333", display: "block" }}>{client.project}</strong>
                                                    <span className={`badge ${client.status === "Active" ? "green" : "yellow"}`}>
                                                        {client.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", color: "#f4c430" }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < Math.floor(client.rating) ? "#f4c430" : "none"} stroke="#f4c430" />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    <ChevronRight size={18} color="#002045" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* RIGHT: Client Details Card */}
                        {selectedClient && (
                            <div className="right-panel">
                                <div className="revenue-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                        <div>
                                            <h3>{selectedClient.name}</h3>
                                            <span className="badge green">{selectedClient.badge}</span>
                                            <small style={{ marginLeft: "10px" }}>Since {selectedClient.since}</small>
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "#f8fbff", padding: "15px", borderRadius: "12px", marginBottom: "20px" }}>
                                        <div>
                                            <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase" }}>Phone</span>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "bold", color: "#002045", marginTop: "4px" }}>
                                                <Phone size={14} /> {selectedClient.phone}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase" }}>Website</span>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "bold", color: "#002045", marginTop: "4px" }}>
                                                <Globe size={14} /> {selectedClient.website}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "25px" }}>
                                        <h4 style={{ color: "#002045", fontSize: "15px", marginBottom: "10px" }}>Current Project</h4>
                                        <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "15px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <strong style={{ color: "#002045" }}>{selectedClient.project}</strong>
                                                <span style={{ fontWeight: "bold", color: "#169c52" }}>{selectedClient.progress}%</span>
                                            </div>
                                            <div className="progress">
                                                <div className="progress-fill employee-progress" style={{ width: `${selectedClient.progress}%` }}></div>
                                            </div>
                                            <div style={{ marginTop: "10px", fontSize: "12px", color: "#777", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Calendar size={14} /> Deadline: <strong style={{ color: "#002045" }}>{selectedClient.deadline}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "20px" }}>
                                        <h4 style={{ color: "#002045", fontSize: "15px", marginBottom: "10px" }}>Log Meeting Feedback</h4>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <input
                                                type="text"
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                placeholder="Enter meeting notes..."
                                                style={{ flex: 1, padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }}
                                            />
                                            <button className="dashboard-btn-primary" onClick={handleSendFeedback} style={{ padding: "10px 16px" }}>
                                                {feedbackSubmitted ? <Check size={16} /> : <Send size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Touchpoints Agenda Card */}
                                <div className="agenda-card">
                                    <div className="agenda-title">
                                        <div className="agenda-icon">
                                            <CalendarDays size={22} />
                                        </div>
                                        <div>
                                            <h3>Recent Touchpoints</h3>
                                            <p style={{ margin: 0, fontSize: "13px", color: "#d9e2f2" }}>Activity log with client</p>
                                        </div>
                                    </div>
                                    <ul>
                                        {selectedClient.touchpoints.map((tp, i) => (
                                            <li key={i}>
                                                <span className={i === 0 ? "yellow-dot" : "green-dot"}></span>
                                                <div>
                                                    <strong style={{ fontSize: "13px", display: "block" }}>{tp.title}</strong>
                                                    <span style={{ fontSize: "11px", color: "#a5b4fc" }}>{tp.time}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal: New Client */}
            {showNewClientModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyCenter: "center", padding: "20px" }}>
                    <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "500px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ color: "#002045", fontSize: "20px" }}>Add New Enterprise Client</h3>
                            <X size={20} style={{ cursor: "pointer", color: "#888" }} onClick={() => setShowNewClientModal(false)} />
                        </div>
                        <form onSubmit={handleCreateClient} className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                            <div className="form-group">
                                <label>Company Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newClientForm.name}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Email</label>
                                <input
                                    type="email"
                                    value={newClientForm.email}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                                    placeholder="contact@acme.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Primary Project</label>
                                <input
                                    type="text"
                                    value={newClientForm.project}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, project: e.target.value })}
                                    placeholder="e.g. ERP Platform Upgrade"
                                />
                            </div>
                            <div className="form-group">
                                <label>Account Classification</label>
                                <select
                                    value={newClientForm.badge}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, badge: e.target.value })}
                                >
                                    <option value="Key Account">Key Account</option>
                                    <option value="Growth Partner">Growth Partner</option>
                                    <option value="Enterprise">Enterprise</option>
                                    <option value="Standard">Standard</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                                <button type="button" className="dashboard-btn-secondary" onClick={() => setShowNewClientModal(false)}>Cancel</button>
                                <button type="submit" className="dashboard-btn-primary">Save Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
