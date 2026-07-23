"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../dashboard/dashboard.css";
import Sidebar from "@/components/Sidebar";
import api from "@/lib/api";
import {
    Search,
    Bell,
    CircleHelp,
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
    const [loading, setLoading] = useState(true);

    const [summaryData, setSummaryData] = useState({
        todayPresent: 0,
        todayAbsent: 0,
        totalEmployees: 0,
        monthlyInsights: []
    });

    const [leaveRequests, setLeaveRequests] = useState([]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const [summaryRes, leaveRes] = await Promise.all([
                api.get("/attendance/summary").catch(err => {
                    console.warn("Failed to fetch attendance summary", err);
                    return { data: null };
                }),
                api.get("/leave").catch(err => {
                    console.warn("Failed to fetch leave requests", err);
                    return { data: { requests: [] } };
                })
            ]);

            if (summaryRes.data) {
                setSummaryData(summaryRes.data);
            }

            if (leaveRes.data?.requests) {
                const formattedLeave = leaveRes.data.requests.map(req => ({
                    id: req._id,
                    initials: req.user?.name ? req.user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "EMP",
                    bgClass: "avatar",
                    name: req.user?.name || "Employee",
                    role: req.user?.department || req.type + " leave",
                    dateRange: formatDateRange(req.startDate, req.endDate),
                    reason: req.reason || req.type,
                    status: req.status,
                    actionTaken: req.status !== "pending" ? req.status : null
                }));
                setLeaveRequests(formattedLeave);
            }
        } catch (err) {
            console.error("Error loading attendance page data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const formatDateRange = (start, end) => {
        if (!start) return "N/A";
        const s = new Date(start);
        const e = end ? new Date(end) : s;
        const opts = { month: 'short', day: 'numeric' };
        if (s.toDateString() === e.toDateString()) {
            return s.toLocaleDateString('en-US', opts);
        }
        return `${s.toLocaleDateString('en-US', opts)} - ${e.toLocaleDateString('en-US', opts)}`;
    };

    const handleDecision = async (id, status) => {
        try {
            await api.patch(`/leave/${id}/decision`, { status });
            setLeaveRequests(prev =>
                prev.map(req => req.id === id ? { ...req, status, actionTaken: status } : req)
            );
        } catch (err) {
            console.error("Failed to update leave decision", err);
        }
    };

    const filteredLeaveRequests = leaveRequests.filter(req => {
        if (activeTab === "pending") {
            return req.status === "pending" || req.actionTaken;
        }
        return req.status !== "pending";
    });

    const filteredEmployees = summaryData.monthlyInsights.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar active="attendance" />

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
                                alt="Admin User"
                            />
                            <div>
                                <h4>Admin Dashboard</h4>
                                <span>Executive Management</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Page Body */}
                <div className="dashboard">
                    <div className="title-actions">
                        <div className="title">
                            <h1>Attendance &amp; Leave Management</h1>
                            <p>Monitor real-time employee presence and streamline leave approval workflows.</p>
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
                                <span className="badge green">Realtime</span>
                            </div>
                            <div className="card-title">Today's Present</div>
                            <h2>{loading ? "..." : summaryData.todayPresent}</h2>
                            <small>Total Workforce: {summaryData.totalEmployees} Employees (Excl. CEO)</small>
                        </div>

                        <div className="kpi-card">
                            <div className="card-top">
                                <div className="icon-box revenue-icon">
                                    <XCircle size={26} color="#d63031" />
                                </div>
                                <span className="badge yellow">Today</span>
                            </div>
                            <div className="card-title" style={{ color: "#d63031" }}>Today's Absent</div>
                            <h2 style={{ color: "#d63031" }}>{loading ? "..." : summaryData.todayAbsent}</h2>
                            <small>Excluding CEO role</small>
                        </div>
                    </div>

                    {/* Leave Requests Overview Card */}
                    <div className="overview-card" style={{ marginTop: "30px" }}>
                        <div className="section-header">
                            <h3>{activeTab === "pending" ? "Pending Leave Requests" : "Leave Request History"}</h3>
                            <button onClick={fetchAttendanceData}>Refresh</button>
                        </div>

                        {loading ? (
                            <p style={{ padding: "20px", color: "#666" }}>Loading leave requests...</p>
                        ) : filteredLeaveRequests.length === 0 ? (
                            <p style={{ padding: "20px", color: "#777", fontSize: "14px" }}>
                                {activeTab === "pending" ? "No pending leave requests currently." : "No historical leave requests found."}
                            </p>
                        ) : (
                            filteredLeaveRequests.map((req) => (
                                <div key={req.id} className="leave-card">
                                    <div className="leave-info">
                                        <div className={req.bgClass}>{req.initials}</div>
                                        <div>
                                            <h4>{req.name}</h4>
                                            <p>{req.role} • {req.dateRange} ({req.reason})</p>
                                        </div>
                                    </div>

                                    <div className="leave-buttons">
                                        {req.actionTaken === "approved" || req.status === "approved" ? (
                                            <span className="badge green" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <Check size={14} /> Approved
                                            </span>
                                        ) : req.actionTaken === "rejected" || req.status === "rejected" ? (
                                            <span className="badge yellow" style={{ background: "#ffeaea", color: "#d63031", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <X size={14} /> Rejected
                                            </span>
                                        ) : (
                                            <>
                                                <button className="approve" onClick={() => handleDecision(req.id, "approved")}>Approve</button>
                                                <button className="reject" onClick={() => handleDecision(req.id, "rejected")}>Reject</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Monthly Insights Table */}
                    <div className="dashboard-table-container">
                        <div className="dashboard-table-header">
                            <h3>Monthly Attendance Insights (Real-time Days Passed)</h3>
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
                                    <th>Present / Total Days</th>
                                    <th>Attendance %</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                            Calculating monthly attendance...
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#777" }}>
                                            No employee records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr key={emp.id}>
                                            <td style={{ fontWeight: "bold", color: "#002045" }}>
                                                {emp.name}{" "}
                                                <span style={{ fontWeight: "normal", color: "#777", fontSize: "12px", display: "block" }}>
                                                    {emp.role}
                                                </span>
                                            </td>
                                            <td>{emp.dept}</td>
                                            <td>{emp.presentDays}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div className="progress" style={{ width: "120px", margin: 0 }}>
                                                        <div
                                                            className="progress-fill employee-progress"
                                                            style={{ width: `${emp.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <strong style={{ color: "#002045", fontSize: "13px" }}>{emp.percentage}%</strong>
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    fontWeight: "bold",
                                                    color: emp.trend.startsWith("+")
                                                        ? "#169c52"
                                                        : emp.trend.startsWith("-")
                                                            ? "#d63031"
                                                            : "#777"
                                                }}
                                            >
                                                {emp.trend}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
