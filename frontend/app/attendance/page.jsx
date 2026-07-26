"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../dashboard/dashboard.css";
import "./attendance.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
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
    Download,
    Clock,
    UserCheck,
    UserX,
    Users
} from "lucide-react";

export default function AttendancePage() {
    const [activeTab, setActiveTab] = useState("pending"); // "pending" or "history"
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedStatusFilter, setSelectedStatusFilter] = useState("all"); // "all", "present", "absent"
    const [showModal, setShowModal] = useState(false);
    const [modalTab, setModalTab] = useState("present"); // "present", "absent"
    const [modalSearch, setModalSearch] = useState("");

    const [summaryData, setSummaryData] = useState({
        todayPresent: 0,
        todayAbsent: 0,
        totalEmployees: 0,
        monthlyInsights: [],
        presentEmployees: [],
        absentEmployees: []
    });

    const [leaveRequests, setLeaveRequests] = useState([]);

    const [user, setUser] = useState(null);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            api.get("/auth/me").then(res => {
                if (res?.data?.user) setUser(res.data.user);
            }).catch(() => null);

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

    const handleCardClick = (status) => {
        setSelectedStatusFilter(status);
        setModalTab(status);
        setModalSearch("");
        setShowModal(true);
    };

    const filteredLeaveRequests = leaveRequests.filter(req => {
        const currentStatus = req.actionTaken || req.status;
        if (activeTab === "pending") {
            return currentStatus === "pending";
        }
        return currentStatus === "approved" || currentStatus === "rejected";
    });

    const filteredEmployees = (summaryData.monthlyInsights || []).filter(emp => {
        const matchesQuery = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesQuery) return false;

        if (selectedStatusFilter === "present") return emp.isPresentToday;
        if (selectedStatusFilter === "absent") return !emp.isPresentToday;
        return true;
    });

    const modalListSource = modalTab === "present"
        ? (summaryData.presentEmployees?.length ? summaryData.presentEmployees : summaryData.monthlyInsights.filter(e => e.isPresentToday))
        : (summaryData.absentEmployees?.length ? summaryData.absentEmployees : summaryData.monthlyInsights.filter(e => !e.isPresentToday));

    const modalList = (modalListSource || []).filter(emp =>
        emp.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        emp.dept.toLowerCase().includes(modalSearch.toLowerCase()) ||
        emp.role.toLowerCase().includes(modalSearch.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar active="attendance" />

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <Navbar
                    user={user}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search employees, records, departments..."
                    helpText="Attendance & Leave — Track real-time present/absent employee status, check-in logs, and manage pending leave approvals."
                />

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
                        {/* Today's Present Card */}
                        <div
                            className={`kpi-card kpi-card-clickable ${selectedStatusFilter === "present" ? "active-present" : ""}`}
                            onClick={() => handleCardClick("present")}
                            title="Click to showcase today's present employees"
                        >
                            <div className="card-top">
                                <div className="icon-box employee-icon">
                                    <CheckCircle2 size={26} color="#169c52" />
                                </div>
                                <span className="badge green">Realtime</span>
                            </div>
                            <div className="card-title">Today's Present</div>
                            <h2>{loading ? "..." : summaryData.todayPresent}</h2>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                                <small>Total Workforce: {summaryData.totalEmployees} Employees (Excl. CEO)</small>
                                <span className="card-action-hint green">View List &rarr;</span>
                            </div>
                        </div>

                        {/* Today's Absent Card */}
                        <div
                            className={`kpi-card kpi-card-clickable ${selectedStatusFilter === "absent" ? "active-absent" : ""}`}
                            onClick={() => handleCardClick("absent")}
                            title="Click to showcase today's absent employees"
                        >
                            <div className="card-top">
                                <div className="icon-box revenue-icon" style={{ background: "#ffeaea" }}>
                                    <XCircle size={26} color="#d63031" />
                                </div>
                                <span className="badge yellow" style={{ background: "#ffeaea", color: "#d63031" }}>Today</span>
                            </div>
                            <div className="card-title" style={{ color: "#d63031" }}>Today's Absent</div>
                            <h2 style={{ color: "#d63031" }}>{loading ? "..." : summaryData.todayAbsent}</h2>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                                <small style={{ color: "#666" }}>Excluding CEO role</small>
                                <span className="card-action-hint red">View List &rarr;</span>
                            </div>
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
                    <div className="dashboard-table-container" style={{ marginTop: "30px" }}>
                        <div className="dashboard-table-header" style={{ marginBottom: "15px" }}>
                            <div>
                                <h3>Monthly Attendance Insights &amp; Real-Time Presence</h3>
                                <p style={{ fontSize: "13px", color: "#718096", marginTop: "4px" }}>
                                    Showing {selectedStatusFilter === "all" ? "All Employees" : selectedStatusFilter === "present" ? "Today's Present Employees" : "Today's Absent Employees"}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button className="dashboard-btn-secondary" style={{ padding: "8px 14px" }}><Filter size={14} /></button>
                                <button className="dashboard-btn-secondary" style={{ padding: "8px 14px" }}><Download size={14} /></button>
                            </div>
                        </div>

                        {/* Status Filter Pills Bar */}
                        <div className="filter-pills-bar">
                            <button
                                className={`filter-pill ${selectedStatusFilter === "all" ? "active-all" : ""}`}
                                onClick={() => setSelectedStatusFilter("all")}
                            >
                                <Users size={14} /> All Employees ({summaryData.totalEmployees || 0})
                            </button>
                            <button
                                className={`filter-pill ${selectedStatusFilter === "present" ? "active-present" : ""}`}
                                onClick={() => setSelectedStatusFilter("present")}
                            >
                                <CheckCircle2 size={14} /> Present Today ({summaryData.todayPresent || 0})
                            </button>
                            <button
                                className={`filter-pill ${selectedStatusFilter === "absent" ? "active-absent" : ""}`}
                                onClick={() => setSelectedStatusFilter("absent")}
                            >
                                <XCircle size={14} /> Absent Today ({summaryData.todayAbsent || 0})
                            </button>
                        </div>

                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Today's Status</th>
                                    <th>Present / Total Days</th>
                                    <th>Attendance %</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                            Calculating monthly attendance...
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#777" }}>
                                            No employee records found for selected filter.
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
                                            <td>
                                                {emp.isPresentToday ? (
                                                    <span className="badge green" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                                                        <CheckCircle2 size={12} /> {emp.todayStatus || "Present"}
                                                        {emp.checkInTime && <span style={{ fontSize: "11px", opacity: 0.8, marginLeft: "2px" }}>({emp.checkInTime})</span>}
                                                    </span>
                                                ) : (
                                                    <span className="badge yellow" style={{ background: "#ffeaea", color: "#d63031", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                                                        <XCircle size={12} /> {emp.todayStatus || "Absent"}
                                                    </span>
                                                )}
                                            </td>
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

            {/* Showcase Modal for Today's Present / Absent Employees */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="attendance-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-title">
                                <div className={`modal-header-icon ${modalTab}`}>
                                    {modalTab === "present" ? <UserCheck size={24} /> : <UserX size={24} />}
                                </div>
                                <div>
                                    <h2>{modalTab === "present" ? "Today's Present Employees" : "Today's Absent Employees"}</h2>
                                    <p>
                                        {modalTab === "present"
                                            ? `${summaryData.todayPresent || 0} employees are checked in today`
                                            : `${summaryData.todayAbsent || 0} employees are currently absent today`}
                                    </p>
                                </div>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-tabs-row">
                            <div className="tab-switcher" style={{ marginTop: 0 }}>
                                <button
                                    onClick={() => { setModalTab("present"); setModalSearch(""); }}
                                    className={modalTab === "present" ? "tab-active" : ""}
                                    style={{ padding: "6px 14px", fontSize: "13px" }}
                                >
                                    Present ({summaryData.todayPresent || 0})
                                </button>
                                <button
                                    onClick={() => { setModalTab("absent"); setModalSearch(""); }}
                                    className={modalTab === "absent" ? "tab-active" : ""}
                                    style={{ padding: "6px 14px", fontSize: "13px" }}
                                >
                                    Absent ({summaryData.todayAbsent || 0})
                                </button>
                            </div>

                            <div className="modal-search">
                                <Search className="modal-search-icon" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search name, dept..."
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="modal-list-body">
                            {modalList.length === 0 ? (
                                <p style={{ textAlign: "center", padding: "40px 0", color: "#718096", fontSize: "14px" }}>
                                    {modalSearch
                                        ? "No matching employees found."
                                        : modalTab === "present"
                                            ? "No employees have checked in today yet."
                                            : "All employees are present today!"}
                                </p>
                            ) : (
                                modalList.map((emp) => (
                                    <div key={emp.id} className="modal-emp-card">
                                        <div className="modal-emp-info">
                                            <div className={`modal-emp-avatar ${modalTab === "absent" ? "absent-avatar" : ""}`}>
                                                {emp.name ? emp.name.split(" ").map(n => n[0]).join("").toUpperCase() : "EMP"}
                                            </div>
                                            <div className="modal-emp-details">
                                                <h4>{emp.name}</h4>
                                                <p>{emp.role} • <span style={{ color: "#4a5568", fontWeight: 600 }}>{emp.dept}</span></p>
                                            </div>
                                        </div>

                                        <div className="modal-emp-status">
                                            {emp.isPresentToday ? (
                                                <>
                                                    <span className="badge green" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                        <Check size={12} /> Present Today
                                                    </span>
                                                    {emp.checkInTime && (
                                                        <span className="time-badge">
                                                            <Clock size={12} /> In: {emp.checkInTime}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="badge yellow" style={{ background: "#ffeaea", color: "#d63031", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    <X size={12} /> {emp.todayStatus || "Absent"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
