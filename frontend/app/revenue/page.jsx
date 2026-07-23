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

export default function RevenuePage() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {

        const getRevenue = async () => {

            try {

                const response = await api.get("/dashboard/revenue");

                console.log(response.data);

                setSeries(response.data.series);

            } catch (error) {

                console.error("Revenue API Error:", error);

            } finally {

                setLoading(false);

            }

        };

        getRevenue();

    }, []);

    return (

        <div className="dashboard-container">

            <Sidebar active="revenue" />

            <main className="revenue-page">

                {/* ================= TOP BAR ================= */}

                <header className="topbar">

                    <div className="search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search data..."
                        />

                    </div>

                    <div className="topbar-right">

                        <Bell size={20} />

                        <CircleHelp size={20} />

                        <div className="profile">

                            <div>

                                <h4>Profile</h4>

                                <p>Administrator</p>

                            </div>

                            <img
                                src="https://i.pravatar.cc/150?img=12"
                                alt="profile"
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

                                    $248,590.00

                                </h2>

                                <div className="growth">

                                    <span>

                                        <TrendingUp size={14} />

                                        12.5%

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

        <>
            <div className="bars">

                {series.map((item, index) => (

                    <div
                        key={index}
                        className="bar"
                        style={{
                            height: `${(item.revenue / Math.max(...series.map(s => s.revenue))) * 95}%`,
                        }}
                    >
                        <span>{item.revenue}</span>
                    </div>

                ))}

            </div>

            <div className="week-labels">

                {series.map((item) => (

                    <span key={item.period}>
                        {item.period}
                    </span>

                ))}

            </div>
        </>

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

                                $1.2M

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

                                18 Items

                            </h2>

                            <p className="danger">

                                $12,400 overdue

                            </p>

                        </div>

                    </div>

                </section>

                {/* ================= PROJECT TABLE ================= */}

                <section className="table-section">

                    <div className="table-header">

                        <h3>Project Revenue Breakdown</h3>

                        <div className="table-actions">

                            <button>
                                Filter
                            </button>

                            <button>
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

                            <tr>

                                <td>

                                    <div className="project">

                                        <div className="project-icon">
                                            ☁️
                                        </div>

                                        Cloud Infrastructure Revamp

                                    </div>

                                </td>

                                <td>Starlight Ventures</td>

                                <td>
                                    <span className="completed">
                                        Completed
                                    </span>
                                </td>

                                <td>Oct 12, 2023</td>

                                <td className="amount">
                                    $84,000.00
                                </td>

                            </tr>

                            <tr>

                                <td>

                                    <div className="project">

                                        <div className="project-icon">
                                            🛒
                                        </div>

                                        E-commerce Marketplace App

                                    </div>

                                </td>

                                <td>Vogue Retail Group</td>

                                <td>
                                    <span className="active-status">
                                        Active
                                    </span>
                                </td>

                                <td>Nov 05, 2023</td>

                                <td className="amount">
                                    $112,500.00
                                </td>

                            </tr>

                            <tr>

                                <td>

                                    <div className="project">

                                        <div className="project-icon">
                                            🔒
                                        </div>

                                        Cybersecurity Audit Q4

                                    </div>

                                </td>

                                <td>National Bank Corp</td>

                                <td>

                                    <span className="hold">

                                        On Hold

                                    </span>

                                </td>

                                <td>

                                    Dec 01, 2023

                                </td>

                                <td className="amount">

                                    $32,000.00

                                </td>

                            </tr>

                            <tr>

                                <td>

                                    <div className="project">

                                        <div className="project-icon">
                                            🎨
                                        </div>

                                        Brand Identity Refresh

                                    </div>

                                </td>

                                <td>

                                    Innovate Digital

                                </td>

                                <td>

                                    <span className="completed">

                                        Completed

                                    </span>

                                </td>

                                <td>

                                    Oct 28, 2023

                                </td>

                                <td className="amount">

                                    $19,250.00

                                </td>

                            </tr>

                        </tbody>

                    </table>

                    <div className="pagination">

                        <p>

                            Showing 4 of 12 projects

                        </p>

                        <div>

                            <button>{"<"}</button>

                            <button className="page-active">

                                1

                            </button>

                            <button>

                                2

                            </button>

                            <button>{">"}</button>

                        </div>

                    </div>

                </section>

            </main>

        </div>

    );

}