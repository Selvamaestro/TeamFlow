"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import "./dashboard.css";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    IndianRupee,
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
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [user, setUser] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weeklySeries, setWeeklySeries] = useState([]);
    const [agenda, setAgenda] = useState([]);
    const router = useRouter();


    useEffect(() => {

        async function fetchDashboardData() {

            try {

                const [
                    overviewRes,
                    leaveRes,
                    projectRes,
                    revenueRes,
                    userRes,
                    agendaRes
                ] = await Promise.all([

                    api.get("/dashboard/overview"),
                    api.get("/leave?status=pending"),
                    api.get("/projects"),
                    api.get("/dashboard/revenue"),
                    api.get("/auth/me"),
                    api.get("/agenda")

                ]);

                setDashboard(overviewRes.data);

                setLeaveRequests(leaveRes.data.requests);

                setProjects(projectRes.data.projects);

                setUser(userRes.data.user);
                setWeeklySeries(revenueRes.data.weeklySeries);
                setAgenda(agendaRes.data.agenda);
            } catch (error) {

                console.error("Dashboard Error:", error);

            } finally {

                setLoading(false);

            }

        }

        fetchDashboardData();

    }, []);
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

                        <div className="icons help-tooltip-wrapper">
                            <CircleHelp size={20} />
                            <div className="help-tooltip-popover">
                                Executive Dashboard — Real-time performance metrics, workforce attendance, financial summaries, and daily agenda.
                            </div>
                        </div>
                        <Link href="/profile">
                            <div
                                className="profile"
                                onClick={() => router.push("/profile")}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="profile-text">
                                    <h4>{user?.name || "User"}</h4>
                                    <span>{user?.role?.toUpperCase()}</span>
                                </div>

<img
    src={
        user?.avatarUrl
            ? `http://localhost:5000${user.avatarUrl}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "User"
              )}`
    }
    alt={user?.name || "Profile"}
/>
                            </div>
                        </Link>

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
                                    <IndianRupee size={28} />
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
                                <strong> ₹1.1M</strong>
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

                                <div style={{ width: "100%", height: 260 }}>

                                    <ResponsiveContainer>

                                        <BarChart data={weeklySeries}>

                                            <CartesianGrid strokeDasharray="3 3" />

                                            <XAxis dataKey="day" />

                                            <YAxis
                                                tickFormatter={(value) => `₹${value / 1000}k`}
                                            />

                                            <Tooltip
                                                formatter={(value) => [
                                                    `₹${value.toLocaleString()}`,
                                                    "Revenue"
                                                ]}
                                            />

                                            <Bar
                                                dataKey="revenue"
                                                fill="#17305c"
                                                radius={[8, 8, 0, 0]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>



                            </div>

                            {/* Agenda */}

                            <div className="agenda-card">

                                <div className="agenda-title">

                                    <div className="agenda-icon">
                                        <ClipboardList size={24} />
                                    </div>

                                    <h3>Today's Schedule</h3>

                                </div>



                                <ul>

                                    {agenda.length === 0 ? (

                                        <p>No events scheduled for today.</p>

                                    ) : (

                                        agenda
                                            .filter((event) => {

                                                const today = new Date().toDateString();

                                                return (
                                                    new Date(event.date).toDateString() === today
                                                );

                                            })
                                            .map((event) => (

                                                <li key={event._id}>

                                                    <span
                                                        className={
                                                            event.type === "Meeting"
                                                                ? "yellow-dot"
                                                                : event.type === "Task"
                                                                    ? "green-dot"
                                                                    : "blue-dot"
                                                        }
                                                    ></span>

                                                    <strong>{event.time}</strong> - {event.title}

                                                </li>

                                            ))

                                    )}

                                </ul>

                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}