import Link from "next/link";
import "./dashboard.css";
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
    return (
        <div className="dashboard-container">
            {/* ================= Sidebar ================= */}

            <aside className="sidebar">
                <div className="logo">
                    <h2>AdminPanel</h2>
                    <p>Management Suite</p>
                </div>

                <nav className="menu">
                    <Link href="/dashboard" className="active">
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
                                <h4>Alexander Vance</h4>
                                <span>Chief Executive Officer</span>
                            </div>

                            <img
                                src="https://i.pravatar.cc/100"
                                alt="profile"
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

                            <h2>1,284</h2>

                            <div className="progress">

                                <div className="progress-fill employee-progress"></div>

                            </div>

                            <small>
                                92% of total workforce currently logged in.
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

                            <h2>$842,500</h2>

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

                            <h2>42</h2>

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

                        <div className="overview-card">

                            {/* Pending Leave */}

                            <div className="section-header">
                                <h3>Pending Leave Requests</h3>
                                <button>View All</button>
                            </div>

                            {/* Employee 1 */}

                            <div className="leave-card">

                                <div className="leave-info">

                                    <div className="avatar">
                                        JD
                                    </div>

                                    <div>

                                        <h4>Julianne Dorsey</h4>

                                        <p>Vacation • Oct 24-27</p>

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

                            {/* Employee 2 */}

                            <div className="leave-card">

                                <div className="leave-info">

                                    <div className="avatar purple">
                                        MK
                                    </div>

                                    <div>

                                        <h4>Marcus Knight</h4>

                                        <p>Sick Leave • Oct 12</p>

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

                            {/* Project Progress */}

                            <div className="project-section">

                                <h3>Project Progress</h3>

                                {/* Project 1 */}

                                <div className="project">

                                    <div className="project-header">

                                        <div>

                                            <h4>Cloud Infrastructure Revamp</h4>

                                            <p>Due : Dec 15, 2024</p>

                                        </div>

                                        <span>75%</span>

                                    </div>

                                    <div className="progress">

                                        <div
                                            className="progress-fill"
                                            style={{ width: "75%" }}
                                        ></div>

                                    </div>

                                </div>

                                {/* Project 2 */}

                                <div className="project">

                                    <div className="project-header">

                                        <div>

                                            <h4>Mobile App Redesign</h4>

                                            <p>Due : Nov 30, 2024</p>

                                        </div>

                                        <span>40%</span>

                                    </div>

                                    <div className="progress">

                                        <div
                                            className="progress-fill"
                                            style={{ width: "40%" }}
                                        ></div>

                                    </div>

                                </div>

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