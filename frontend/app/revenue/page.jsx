"use client";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import "./revenue.css";
import Sidebar from "@/components/Sidebar";

import {
    Search,
    Bell,
    CircleHelp,
    Calendar,
    MoreVertical,
    TrendingUp,
    Wallet,
    FileText,
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

export default function RevenuePage() {
    const [series, setSeries] = useState([]);
    const [user, setUser] = useState(null);
    const [summary, setSummary] = useState({});
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const projectsPerPage = 5;
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await api.get("/auth/me"); // Change this if your endpoint is different
                setUser(response.data.user);
            } catch (error) {
                console.error("User API Error:", error);
            }
        };

        const getRevenue = async () => {

            try {


                const response = await api.get("/dashboard/revenue");

                console.log(response.data);

                setSummary(response.data.summary);
                setSeries(response.data.series);
                setProjects(response.data.projects);
                setFilteredProjects(response.data.projects);

            } catch (error) {

                console.error("Revenue API Error:", error);

            } finally {

                setLoading(false);

            }

        };

        getRevenue();
        getUser();

    }, []);
    useEffect(() => {

        let filtered = projects;

        // Search

        if (search.trim() !== "") {

            const keyword = search.toLowerCase();

            filtered = filtered.filter((project) =>

                project.title.toLowerCase().includes(keyword) ||

                project.client?.company?.toLowerCase().includes(keyword) ||

                project.status.toLowerCase().includes(keyword)

            );

        }

        // Status Filter

        if (statusFilter !== "All") {

            filtered = filtered.filter(

                (project) => project.status === statusFilter

            );

        }

        setFilteredProjects(filtered);

    }, [search, statusFilter, projects]);
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);
    const totalPages = Math.ceil(
        filteredProjects.length / projectsPerPage
    );

    const indexOfLastProject = currentPage * projectsPerPage;

    const indexOfFirstProject =
        indexOfLastProject - projectsPerPage;

    const currentProjects =
        filteredProjects.slice(
            indexOfFirstProject,
            indexOfLastProject
        );
    const exportCSV = () => {

        const headers = [
            "Project Name",
            "Client",
            "Status",
            "Start Date",
            "Revenue"
        ];

        const rows = filteredProjects.map((project) => [

            project.title,

            project.client?.company || "N/A",

            project.status,

            new Date(project.startDate).toLocaleDateString(),

            project.revenue

        ]);

        const csvContent = [

            headers.join(","),

            ...rows.map(row => row.join(","))

        ].join("\n");

        const blob = new Blob([csvContent], {

            type: "text/csv;charset=utf-8;"

        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.setAttribute("download", "Revenue_Report.csv");

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    };
console.log(user);
    return (

        <div className="dashboard-container">

            <Sidebar active="revenue" />

            <main className="revenue-page">

                {/* ================= TOP BAR ================= */}

                <header className="topbar">

                    <div className="search-box">

                        <Search className="search-icon" size={18} />

<input
    type="text"
    placeholder="Search project, client or status..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
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

                {/* ================= PAGE HEADER ================= */}

                <section className="page-header">

                    <div>

                        <p className="breadcrumb">

                            Finance /

                            <span>

                                Revenue Overview

                            </span>

                        </p>

                        <h1>

                            Revenue Insights

                        </h1>

                        <p className="subtitle">

                            Real-time fiscal monitoring and project profitability analysis.

                        </p>

                    </div>

                    <div className="header-buttons">

                        <button className="active">

                            This Month

                        </button>

                        <button>

                            Last 6 Months

                        </button>

                        <button className="calendar-btn">

                            <Calendar size={18} />

                        </button>

                    </div>

                </section>


                {/* ================= TOP GRID ================= */}

                <section className="top-grid">

                    {/* LEFT */}

                    <div className="revenue-card">

                        <div className="revenue-card-header">

                            <div>

                                <p>

                                    TOTAL MONTHLY EARNINGS

                                </p>

                                <h2>
                                    ₹{summary?.totalRevenue?.toLocaleString() || 0}
                                </h2>

                                <div className="growth">

                                    <span>

                                        <TrendingUp size={14} />

                                        {summary?.growth || 0}%

                                    </span>

                                    <small>

                                        vs last month

                                    </small>

                                </div>

                            </div>

                            <div className="card-actions">

                                <button className="badge">

                                    Revenue

                                </button>

                                <button>

                                    <MoreVertical size={18} />

                                </button>

                            </div>

                        </div>

                        <div className="chart-area">

                            {loading ? (

                                <p>Loading revenue...</p>

                            ) : (

                                <ResponsiveContainer width="100%" height={320}>

                                    <LineChart
                                        data={series}
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 10,
                                            bottom: 10,
                                        }}
                                    >

                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis
                                            dataKey="period"
                                        />

                                        <YAxis
                                            tickFormatter={(value) => `₹${value / 1000}k`}
                                        />

                                        <Tooltip
                                            formatter={(value) => [
                                                `₹${value.toLocaleString()}`,
                                                "Revenue",
                                            ]}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#17305c"
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                            activeDot={{ r: 8 }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>

                    {/* RIGHT */}

                    <div className="right-column">

                        <div className="info-card">

                            <div className="icon-box">

                                <Wallet size={20} />

                            </div>

                            <h4>

                                Available Funds

                            </h4>

                            <h2>
                                ₹{summary?.availableFunds?.toLocaleString() || 0}
                            </h2>

                            <p>

                                Liquidity ratio currently

                                <strong>

                                    {" "}1.4

                                </strong>

                            </p>

                        </div>

                        <div className="info-card">

                            <div className="icon-box">

                                <FileText size={20} />

                            </div>

                            <h4>

                                Pending Invoices

                            </h4>

                            <h2>
                                {summary?.pendingInvoices || 0} Items
                            </h2>

                            <p className="danger">

                                ₹{summary?.overdueAmount?.toLocaleString() || 0} overdue

                            </p>

                        </div>

                    </div>

                </section>

                {/* ================= PROJECT TABLE ================= */}

                <section className="table-section">

                    <div className="table-header">

                        <h3>Project Revenue Breakdown</h3>

                        <div className="table-actions">

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >

                                <option value="All">All Status</option>

                                <option value="planning">Planning</option>

                                <option value="in_progress">In Progress</option>

                                <option value="completed">Completed</option>

                                <option value="on_hold">On Hold</option>

                                <option value="cancelled">Cancelled</option>

                            </select>

                            <button onClick={exportCSV}>
                                Export CSV
                            </button>

                        </div>

                    </div>

                    <table className="revenue-table">

                        <thead>

                            <tr>

                                <th>PROJECT NAME</th>
                                <th>CLIENT</th>
                                <th>STATUS</th>
                                <th>START DATE</th>
                                <th>REVENUE AMOUNT</th>

                            </tr>

                        </thead>

                        <tbody>
                            {currentProjects.map((project) => (

                                <tr key={project._id}>

                                    <td>
                                        <div className="project">
                                            <div className="project-icon">📁</div>
                                            {project.title}
                                        </div>
                                    </td>

                                    <td>
                                        {project.client?.company || "N/A"}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                project.status === "completed"
                                                    ? "completed"
                                                    : project.status === "active"
                                                        ? "active-status"
                                                        : "hold"
                                            }
                                        >
                                            {project.status}
                                        </span>
                                    </td>

                                    <td>
                                        {new Date(project.startDate).toLocaleDateString()}
                                    </td>

                                    <td className="amount">
                                        ₹{project.revenue.toLocaleString()}
                                    </td>

                                </tr>

                            ))}



                        </tbody>

                    </table>

                    <div className="pagination">

                        <p>

                            Showing {indexOfFirstProject + 1} - {Math.min(indexOfLastProject, filteredProjects.length)} of {filteredProjects.length} projects
                        </p>

                        <div>

                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage(currentPage - 1)
                                }
                            >
                                {"<"}
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => (

                                    <button
                                        key={index + 1}
                                        className={
                                            currentPage === index + 1
                                                ? "page-active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setCurrentPage(index + 1)
                                        }
                                    >
                                        {index + 1}
                                    </button>

                                )
                            )}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage(currentPage + 1)
                                }
                            >
                                {">"}
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>

    );

}