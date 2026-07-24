"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../dashboard/dashboard.css";
import Sidebar from "@/components/Sidebar";
import { clientService } from "../../services/clientService";
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
    X,
    Trash2,
    Clock,
    FileText
} from "lucide-react";

export default function ClientsPage() {
    const [selectedClientIndex, setSelectedClientIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Live Clients State loaded exclusively from MongoDB database
    const [clientsList, setClientsList] = useState([]);

    // Fetch live MongoDB clients from backend clientService on mount
    useEffect(() => {
        async function fetchDbClients() {
            setIsLoading(true);
            try {
                const res = await clientService.getClients();
                if (res && res.clients && Array.isArray(res.clients)) {
                    const mappedDbClients = res.clients.map(c => {
                        const companyName = c.company || c.name || "Client Account";
                        const words = companyName.split(" ");
                        const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : companyName.substring(0, 2).toUpperCase();

                        return {
                            id: c._id || c.id,
                            name: companyName,
                            initials: initials,
                            contactName: c.name || "Primary Contact",
                            email: c.email || "contact@client.com",
                            phone: c.phone || "+1 (555) 000-1111",
                            website: c.website || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
                            project: "Enterprise Engagement",
                            status: c.status === "inactive" ? "Inactive" : "Active",
                            rating: 5.0,
                            badge: c.status === "inactive" ? "Inactive Account" : "Key Account",
                            since: c.createdAt ? new Date(c.createdAt).getFullYear().toString() : "2026",
                            progress: 80,
                            deadline: "Dec 31, 2026",
                            quote: c.notes || "Registered in MongoDB database.",
                            iconType: "corporate",
                            touchpoints: [
                                { title: "Client Registered in Database", time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Live Database Record" }
                            ]
                        };
                    });

                    setClientsList(mappedDbClients);
                }
            } catch (err) {
                console.warn("Database client fetch info:", err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDbClients();
    }, []);

    const handleDeleteClient = async (e, id, name) => {
        if (e) e.stopPropagation();
        if (confirm(`Are you sure you want to delete client "${name}" permanently from MongoDB database?`)) {
            try {
                await clientService.deleteClient(id);
            } catch (err) {
                console.log("Delete client notice:", err.message);
            }
            setClientsList(prev => prev.filter(c => c.id !== id));
            setSelectedClientIndex(0);
        }
    };

    const handleSendFeedback = (e) => {
        e.preventDefault();
        if (!feedbackText.trim()) return;

        setFeedbackSubmitted(true);
        const newTouchpoint = {
            title: `Feedback: "${feedbackText}"`,
            time: "Just now • Executive Note"
        };

        setClientsList(prev => prev.map((item, idx) => {
            if (idx === selectedClientIndex) {
                return {
                    ...item,
                    touchpoints: [newTouchpoint, ...(item.touchpoints || [])]
                };
            }
            return item;
        }));

        setTimeout(() => {
            setFeedbackText("");
            setFeedbackSubmitted(false);
        }, 1500);
    };

    const filteredClients = clientsList.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedClient = filteredClients[selectedClientIndex] || filteredClients[0] || clientsList[0];

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar active="clients" />

            {/* Main Content Area */}
            <div className="main-content">
                {/* Top Header */}
                <header className="header">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search clients from database..."
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
                            <h1>Client Directory (MongoDB)</h1>
                            <p>Live client accounts retrieved directly from your backend MongoDB database.</p>
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="dashboard-btn-secondary">
                                <Download size={16} /> Export List
                            </button>
                            <Link
                                href="/clients/create"
                                className="dashboard-btn-primary"
                                style={{ textDecoration: "none" }}
                            >
                                <Plus size={16} /> New Client
                            </Link>
                        </div>
                    </div>

                    {/* Overview Grid Layout */}
                    <div className="overview-grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
                        {/* LEFT: Client Table */}
                        <div className="dashboard-table-container" style={{ marginTop: 0 }}>
                            <div className="dashboard-table-header">
                                <h3>All Database Clients ({filteredClients.length})</h3>
                            </div>

                            {isLoading ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                                    Loading clients from MongoDB database...
                                </div>
                            ) : filteredClients.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#777" }}>
                                    <Building size={36} color="#002045" style={{ marginBottom: "10px", opacity: 0.5 }} />
                                    <p style={{ fontWeight: 600, color: "#002045" }}>No clients found in MongoDB database.</p>
                                    <Link href="/clients/create" className="dashboard-btn-primary" style={{ display: "inline-flex", marginTop: "15px", textDecoration: "none" }}>
                                        <Plus size={16} /> Add First Client
                                    </Link>
                                </div>
                            ) : (
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Client Name</th>
                                            <th>Status</th>
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
                                                            <div className="icon-box employee-icon" style={{ width: "40px", height: "40px", fontSize: "16px", fontWeight: "bold" }}>
                                                                {client.initials}
                                                            </div>
                                                            <div>
                                                                <strong style={{ color: "#002045", display: "block" }}>{client.name}</strong>
                                                                <span style={{ fontSize: "12px", color: "#777" }}>{client.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${client.status === "Active" ? "green" : "yellow"}`} style={{ background: client.status === "Inactive" ? "#ffeaea" : undefined, color: client.status === "Inactive" ? "#d63031" : undefined }}>
                                                            {client.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", color: "#f4c430" }}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={14} fill="#f4c430" stroke="#f4c430" />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                                                            <button
                                                                onClick={(e) => handleDeleteClient(e, client.id, client.name)}
                                                                title="Delete Client"
                                                                style={{ background: "none", border: "none", color: "#d63031", cursor: "pointer", padding: "4px" }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <Link href={`/clients/${client.id}`} onClick={(e) => e.stopPropagation()}>
                                                                <ChevronRight size={18} color="#002045" style={{ cursor: "pointer" }} />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* RIGHT: Client Details Card */}
                        {selectedClient && (
                            <div className="right-panel">
                                <div className="revenue-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                        <div>
                                            <h3>{selectedClient.name}</h3>
                                            <span className={`badge ${selectedClient.status === "Active" ? "green" : "yellow"}`} style={{ background: selectedClient.status === "Inactive" ? "#ffeaea" : undefined, color: selectedClient.status === "Inactive" ? "#d63031" : undefined }}>
                                                {selectedClient.badge}
                                            </span>
                                            <small style={{ marginLeft: "10px" }}>Since {selectedClient.since}</small>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                onClick={(e) => handleDeleteClient(e, selectedClient.id, selectedClient.name)}
                                                style={{ background: "#ffeaea", color: "#d63031", border: "none", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                            <Link href={`/clients/${selectedClient.id}`} className="dashboard-btn-secondary" style={{ padding: "8px 14px", fontSize: "12px", textDecoration: "none" }}>
                                                Full Details &rarr;
                                            </Link>
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
                                            <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase" }}>Contact Person</span>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "bold", color: "#002045", marginTop: "4px" }}>
                                                <Users size={14} /> {selectedClient.contactName}
                                            </div>
                                        </div>
                                        <div style={{ gridColumn: "span 2" }}>
                                            <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase" }}>Website</span>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "bold", color: "#002045", marginTop: "4px" }}>
                                                <Globe size={14} /> <a href="#" style={{ color: "#002045" }}>{selectedClient.website}</a>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "20px" }}>
                                        <h4 style={{ fontSize: "14px", color: "#002045", marginBottom: "8px" }}>Client Notes / Feedback</h4>
                                        <p style={{ fontSize: "13px", fontStyle: "italic", color: "#555", background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #eee", margin: 0 }}>
                                            "{selectedClient.quote}"
                                        </p>
                                    </div>
                                </div>

                                {/* Executive Notes & Feedback Form */}
                                <div className="overview-card" style={{ marginTop: "20px" }}>
                                    <div className="section-header">
                                        <h3>Add Note for {selectedClient.name}</h3>
                                    </div>

                                    <form onSubmit={handleSendFeedback} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <textarea
                                            rows={3}
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            placeholder={`Write an executive note or record meeting feedback for ${selectedClient.name}...`}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                borderRadius: "8px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "13px",
                                                outline: "none"
                                            }}
                                        ></textarea>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            {feedbackSubmitted && (
                                                <span style={{ fontSize: "12px", color: "#169c52", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    <Check size={14} /> Note Saved to Touchpoints!
                                                </span>
                                            )}
                                            <button
                                                type="submit"
                                                className="dashboard-btn-primary"
                                                style={{ marginLeft: "auto", padding: "8px 16px", fontSize: "13px" }}
                                            >
                                                <Send size={14} /> Save Note
                                            </button>
                                        </div>
                                    </form>

                                    {/* Touchpoints Log */}
                                    <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #eee" }}>
                                        <h4 style={{ fontSize: "13px", color: "#777", marginBottom: "12px", textTransform: "uppercase" }}>Engagement History</h4>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {selectedClient.touchpoints?.map((tp, idx) => (
                                                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px" }}>
                                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#002045", marginTop: "6px" }}></div>
                                                    <div>
                                                        <strong style={{ color: "#002045", display: "block" }}>{tp.title}</strong>
                                                        <span style={{ fontSize: "11px", color: "#888" }}>{tp.time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
