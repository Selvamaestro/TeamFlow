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
    CheckCircle2,
    XCircle,
    Check,
    X,
    Filter,
    Download
} from "lucide-react";

export default function AttendancePage() {
    const [activeTab, setActiveTab] = useState("pending"); // "pending" or "history"
    const [searchQuery, setSearchQuery] = useState("");

    // Leave Requests state
    const [leaveRequests, setLeaveRequests] = useState([
        {
            id: 1,
            initials: "JD",
            bgClass: "avatar",
            name: "Julianne Dorsey",
            role: "Senior Analyst",
            dateRange: "Oct 24 - Oct 27, 2023",
            reason: "Vacation",
            status: "Pending Review",
            actionTaken: null
        },
        {
            id: 2,
            initials: "MK",
            bgClass: "avatar purple",
            name: "Marcus Knight",
            role: "DevOps Engineer",
            dateRange: "Oct 25, 2023",
            reason: "Sick Leave",
            status: "Urgent",
            actionTaken: null
        },
        {
            id: 3,
            initials: "ER",
            bgClass: "avatar",
            name: "Elena Rodriguez",
            role: "Growth Manager",
            dateRange: "Nov 02 - Nov 04, 2023",
            reason: "Personal",
            status: "Pending Review",
            actionTaken: null
        }
    ]);

    // Monthly Attendance Employees Data
    const [employees] = useState([
        {
            id: 1,
            name: "Sarah Chen",
            role: "Product Designer",
            dept: "Design & UX",
            presentDays: "21 / 22 days",
            percentage: 95,
            trend: "+3%"
        },
        {
            id: 2,
            name: "David Miller",
            role: "Backend Developer",
            dept: "Engineering",
            presentDays: "19 / 22 days",
            percentage: 86,
            trend: "-2%"
        },
        {
            id: 3,
            name: "Elena Rodriguez",
            role: "Growth Manager",
            dept: "Marketing",
            presentDays: "22 / 22 days",
            percentage: 100,
            trend: "0%"
        },
        {
            id: 4,
            name: "Marcus Vane",
            role: "Product Lead",
            dept: "Product",
            presentDays: "20 / 22 days",
            percentage: 91,
            trend: "+1%"
        }
    ]);

    const handleApprove = (id) => {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, actionTaken: "approved" } : req));
    };

    const handleReject = (id) => {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, actionTaken: "rejected" } : req));
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                    <Link href="/attendance" className="active">
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
                    <button className="project-btn">
                        <Plus size={18} />
                        New Project
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
                            placeholder="Search employees, records, departments..."
                        />
                    </div>

                    <div className="header-right">
                        <Bell className="icons" />
                        <CircleHelp className="icons" />

                        <div className="profile">
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80"
                                alt="Alex Sterling"
                            />
                            <div>
                                <h4>Alex Sterling</h4>
                                <span>Chief Executive</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Page Body */}
                <div className="dashboard">
                    <div className="title-actions">
                        <div className="title">
                            <h1>Attendance &amp; Leave Management</h1>
                            <p>Monitor employee presence and streamline approval workflows.</p>
                        </div>

                        <div className="tab-switcher">
                            <button
                                onClick={() => setActiveTab("pending")}
                                className={activeTab === "pending" ? "tab-active" : ""}
                            >
                                Pending Requests
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={activeTab === "history" ? "tab-active" : ""}
                            >
                                History
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                        <div className="kpi-card">
                            <div className="card-top">
                                <div className="icon-box employee-icon">
                                    <CheckCircle2 size={26} color="#002045" />
                                </div>
                                <span className="badge green">+12%</span>
                            </div>
                            <div className="card-title">Today's Present</div>
                            <h2>428</h2>
                            <small>Total Workforce: 450 Employees</small>
                        </div>

                        <div className="kpi-card">
                            <div className="card-top">
                                <div className="icon-box revenue-icon">
                                    <XCircle size={26} color="#d63031" />
                                </div>
                                <span className="badge yellow">Last avg: 18</span>
                            </div>
                            <div className="card-title" style={{ color: "#d63031" }}>Today's Absent</div>
                            <h2 style={{ color: "#d63031" }}>22</h2>
                            <small>Includes 15 approved leave requests</small>
                        </div>
                    </div>

                    {/* Leave Requests Overview Card */}
                    <div className="overview-card" style={{ marginTop: "30px" }}>
                        <div className="section-header">
                            <h3>Pending Leave Requests</h3>
                            <button>View All Requests</button>
                        </div>

                        {leaveRequests.map((req) => (
                            <div key={req.id} className="leave-card">
                                <div className="leave-info">
                                    <div className={req.bgClass}>{req.initials}</div>
                                    <div>
                                        <h4>{req.name}</h4>
                                        <p>{req.role} • {req.dateRange} ({req.reason})</p>
                                    </div>
                                </div>

                                <div className="leave-buttons">
                                    {req.actionTaken === "approved" ? (
                                        <span className="badge green" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                            <Check size={14} /> Approved
                                        </span>
                                    ) : req.actionTaken === "rejected" ? (
                                        <span className="badge yellow" style={{ background: "#ffeaea", color: "#d63031", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                            <X size={14} /> Rejected
                                        </span>
                                    ) : (
                                        <>
                                            <button className="approve" onClick={() => handleApprove(req.id)}>Approve</button>
                                            <button className="reject" onClick={() => handleReject(req.id)}>Reject</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Insights Table */}
                    <div className="dashboard-table-container">
                        <div className="dashboard-table-header">
                            <h3>Monthly Attendance Insights</h3>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button className="dashboard-btn-secondary" style={{ padding: "8px 14px" }}><Filter size={14} /></button>
                                <button className="dashboard-btn-secondary" style={{ padding: "8px 14px" }}><Download size={14} /></button>
                            </div>
                        </div>

                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Present / Total</th>
                                    <th>Attendance %</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id}>
                                        <td style={{ fontWeight: "bold", color: "#002045" }}>{emp.name} <span style={{ fontWeight: "normal", color: "#777", fontSize: "12px", display: "block" }}>{emp.role}</span></td>
                                        <td>{emp.dept}</td>
                                        <td>{emp.presentDays}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div className="progress" style={{ width: "120px", margin: 0 }}>
                                                    <div className="progress-fill employee-progress" style={{ width: `${emp.percentage}%` }}></div>
                                                </div>
                                                <strong style={{ color: "#002045", fontSize: "13px" }}>{emp.percentage}%</strong>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: "bold", color: emp.trend.startsWith("+") ? "#169c52" : emp.trend.startsWith("-") ? "#d63031" : "#777" }}>
                                            {emp.trend}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
