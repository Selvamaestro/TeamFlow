"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import "./dashboard.css";
import Sidebar from "@/components/Sidebar";
import {
    LayoutDashboard,
    Users,
    DollarSign,
    FolderKanban,
    CalendarDays,
    MessageSquare,
    Building2,
    Bell,
    CircleHelp,
    Settings,
    LogOut,
    ClipboardList,
    Search,
    Plus,
} from "lucide-react";

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [user, setUser] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const response = await api.get("/dashboard/overview");

                setDashboard(response.data);
                const leaveResponse = await api.get("/leave?status=pending");

                setLeaveRequests(leaveResponse.data.requests);

                const storedUser = localStorage.getItem("user");

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchDashboard();

    }, []);
    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await api.get("/projects");
                setProjects(response.data.projects);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);
    if (loading) {
        return <h2>Loading Projects...</h2>;
    }
    if (loading) {

        return <h2>Loading Dashboard...</h2>;

    }

    return (
        <div className="dashboard-container">
            {/* ================= Sidebar ================= */}
            <Sidebar active="dashboard" />

            {/* ================= Main ================= */}

            <div className="main-content">

                {/* Header */}

                <header className="header">

                    <div className="search-box">

                        <Search className="search-icon" size={18} />

                        <input
                            type="text"
                            placeholder="Search enterprise data..."
                        />

                    </div>

                    <div className="header-right">

                        <div className="icons">
                            <Bell size={20} />
                        </div>

                        <div className="icons">
                            <CircleHelp size={20} />
                        </div>

                        <div className="profile">

                            <div className="profile-text">
                                <h4>{user?.name || "User"}</h4>

                                <span>{user?.role?.toUpperCase()}</span>
                            </div>

                            <img
                                src={
                                    user?.avatarUrl ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`
                                }
                                alt={user?.name || "Profile"}
                            />

                        </div>

                    </div>

                </header>

                {/* Dashboard */}

                <section className="dashboard">

                    <div className="title">

                        <h1>Executive Summary</h1>

                        <p>
                            Real-time performance metrics for
                            AdminPanel Enterprise.
                        </p>

                    </div>

                    <div className="kpi-grid">

                        {/* Card 1 */}

                        <div className="kpi-card">

                            <div className="card-top">

                                <div className="icon-box employee-icon">
                                    <Users size={28} />
                                </div>

                                <span className="badge green">
                                    ▲ +4%
                                </span>

                            </div>

                            <p className="card-title">
                                Today's Present Employees
                            </p>

                            <h2>{dashboard?.attendanceToday}</h2>

                            <div className="progress">

                                <div className="progress-fill employee-progress"></div>

                            </div>

                            <small>

                                Present: {dashboard?.attendanceToday} / {dashboard?.totalEmployees}

                            </small>

                        </div>



                        {/* Card 2 */}

                        <div className="kpi-card">

                            <div className="card-top">

                                <div className="icon-box revenue-icon">
                                    <DollarSign size={28} />
                                </div>

                                <span className="badge green">
                                    ▲ +12.5%
                                </span>

                            </div>

                            <p className="card-title">
                                Month Revenue (MTD)
                            </p>

                            <h2>

                                ₹ {dashboard?.revenueThisMonth?.toLocaleString() || 0}

                            </h2>

                            <small>
                                Projected monthly target:
                                <strong> $1.1M</strong>
                            </small>

                        </div>



                        {/* Card 3 */}

                        <div className="kpi-card">

                            <div className="card-top">

                                <div className="icon-box project-icon">
                                    <FolderKanban size={28} />
                                </div>

                                <span className="badge yellow">
                                    Steady
                                </span>

                            </div>

                            <p className="card-title">
                                Active Client Projects
                            </p>

                            <h2>{dashboard?.activeProjects}</h2>

                            <div className="avatars">

                                <span></span>
                                <span></span>
                                <span></span>

                                <div className="more">
                                    +12
                                </div>

                            </div>

                            <small>
                                3 new projects starting this week.
                            </small>

                        </div>

                    </div>
                    <div className="overview-grid">

                        {/* LEFT SIDE */}
                        <div className="left-panel">

                            <div className="overview-card">

                                {/* Pending Leave */}

                                <div className="section-header">
                                    <h3>Pending Leave Requests</h3>
                                    <button>View All</button>
                                </div>
                                {leaveRequests.length === 0 ? (

                                    <p>No pending leave requests.</p>

                                ) : (

                                    leaveRequests.slice(0, 2).map((leave) => (

                                        <div className="leave-card" key={leave._id}>

                                            <div className="leave-info">

                                                <div className="avatar">

                                                    {leave.user?.name?.charAt(0)}

                                                </div>

                                                <div>

                                                    <h4>{leave.user?.name}</h4>

                                                    <p>
                                                        {leave.type} • {new Date(leave.startDate).toLocaleDateString()}
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="leave-buttons">

                                                <button className="approve">
                                                    Approve
                                                </button>

                                                <button className="reject">
                                                    Reject
                                                </button>

                                            </div>

                                        </div>

                                    ))

                                )}
                            </div>
                            <div className="overview-card">



                                <div className="section-header">
                                    <h3>Project Progress</h3>
                                    <button>View All</button>
                                </div>

                                {projects.length === 0 ? (
                                    <p>No active projects.</p>
                                ) : (
                                    projects.slice(0, 2).map((project) => (
                                        <div key={project._id} className="project-card">
                                            <h4>{project.title}</h4>

                                            <div className="project-progress-item">

                                                <div className="project-header">

                                                    <h4>{project.title}</h4>

                                                    <span>
                                                        {project.status === "completed"
                                                            ? "100%"
                                                            : project.status === "planning"
                                                                ? "30%"
                                                                : project.status === "in_progress"
                                                                    ? "70%"
                                                                    : "50%"}
                                                    </span>

                                                </div>

                                                <small>
                                                    Due{" "}
                                                    {project.dueDate
                                                        ? new Date(project.dueDate).toLocaleDateString()
                                                        : "N/A"}
                                                </small>

                                                <div className="progress">

                                                    <div
                                                        className="progress-fill employee-progress"
                                                        style={{
                                                            width:
                                                                project.status === "completed"
                                                                    ? "100%"
                                                                    : project.status === "planning"
                                                                        ? "30%"
                                                                        : project.status === "in_progress"
                                                                            ? "70%"
                                                                            : "50%"
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>




                        </div>

                        {/* RIGHT SIDE */}

                        <div className="right-panel">

                            {/* Revenue Card */}

                            <div className="revenue-card">

                                <h3>Revenue Velocity</h3>

                                <p>Past 7 days performance</p>

                                <div className="chart">

                                    <div className="bar h40"><span>$12k</span></div>

                                    <div className="bar h55"><span>$18k</span></div>

                                    <div className="bar h45"><span>$14k</span></div>

                                    <div className="bar h70"><span>$24k</span></div>

                                    <div className="bar h90"><span>$32k</span></div>

                                    <div className="bar active h85"><span>$29k</span></div>

                                    <div className="bar active h95"><span>$34k</span></div>

                                </div>

                                <div className="days">

                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span className="active-day">Sat</span>
                                    <span className="active-day">Sun</span>

                                </div>

                            </div>

                            {/* Agenda */}

                            <div className="agenda-card">

                                <div className="agenda-title">

                                    <div className="agenda-icon">
                                        <ClipboardList size={24} />
                                    </div>

                                    <h3>Your Agenda</h3>

                                </div>

                                <p>
                                    3 high-priority meetings today.
                                </p>

                                <ul>

                                    <li>

                                        <span className="yellow-dot"></span>

                                        Quarterly Review: Finance

                                    </li>

                                    <li>

                                        <span className="green-dot"></span>

                                        Board Member Luncheon

                                    </li>

                                </ul>

                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}