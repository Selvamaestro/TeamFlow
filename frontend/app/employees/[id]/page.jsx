
"use client";

import "./details.css";
import "../../dashboard/dashboard.css";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";import api from "@/lib/api";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    MoreHorizontal,
} from "lucide-react";



export default function EmployeeDetails() {

    const { id } = useParams();
    const router = useRouter();

    const [employee, setEmployee] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchEmployee = async () => {

            try {

                const response = await api.get(`/users/${id}`);
                console.log("Employee Response:", response.data.user);

                setEmployee(response.data.user);


            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        if (id) {
            fetchEmployee();
        }

    }, [id]);
const handleDeactivate = async () => {

    const confirmDeactivate = window.confirm(
        `Are you sure you want to deactivate ${employee.name}?`
    );

    if (!confirmDeactivate) return;

    try {

        await api.delete(`/users/${id}`);

        alert("Employee deactivated successfully.");

        router.push("/employees");

    } catch (error) {

        console.error(error);

        alert("Failed to deactivate employee.");

    }

};
    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar active="employees" />
                <div className="employee-details-page">
                    <h2>Loading employee...</h2>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="dashboard-container">
                <Sidebar active="employees" />
                <div className="employee-details-page">
                    <h2>Employee not found.</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar active="employees" />
            <div className="employee-details-page">

                {/* Breadcrumb */}
                <div className="page-top">
                    <Link href="/employees" className="back-link">
                        <ArrowLeft size={16} />
                        Back to Employee Directory
                    </Link>
                </div>

                {/* ================= Profile Card ================= */}

                <div className="employee-card">

                    <div className="employee-left">

                        <img
                            src={employee.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(employee.name)}
                            alt={employee.name}
                            className="employee-image"
                        />

                        <div className="employee-info">

                            <div className="employee-title">

                                <h2>{employee.name}</h2>

                                <span className="role-tag">
                                    {employee.designation || employee.role}
                                </span>

                            </div>

                            <div className="employee-meta">

                                <span>
                                    <Briefcase size={15} />
                                    {employee.department || "N/A"}
                                </span>

                                <span>
                                    <Mail size={15} />
                                    {employee.email}
                                </span>

                                <span>
                                    <Phone size={15} />
                                    {employee.phone || "N/A"}
                                </span>

                                <span>
                                    <MapPin size={15} />
                                    {employee.location || "N/A"}
                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="employee-actions">

                        <span className="status-pill">
                            {employee.status}
                        </span>

                        <button className="more-btn">
                            <MoreHorizontal size={18} />
                        </button>

                    </div>

                </div>
                {/* ================= MIDDLE SECTION ================= */}

                <div className="middle-section">

                    {/* Projects */}

                    <div className="card projects-card">

                        <div className="card-header">

                            <h3>Current Projects</h3>

                            <a href="#">View All Projects ↗</a>

                        </div>

                        {employee.projects && employee.projects.length > 0 ? (

                            employee.projects.map((project) => (

                                <div className="project" key={project._id}>

                                    <div className="project-top">

                                        <div>

                                            <h4>{project.title}</h4>

                                            <p>
                                                Project Status
                                            </p>

                                        </div>

                                        <span
                                            className={
                                                project.status === "completed"
                                                    ? "green-badge"
                                                    : project.status === "planning"
                                                        ? "blue-badge"
                                                        : "green-badge"
                                            }
                                        >
                                            {project.status?.replace("_", " ").toUpperCase()}
                                        </span>

                                    </div>

                                </div>

                            ))

                        ) : (

                            <p>No projects assigned.</p>

                        )}

                    </div>

                    {/* Employment */}

                    <div className="card employment-card">

                        <h3>Employment Details</h3>

                        <div className="employment-list">

                            <div>
                                <small>Join Date</small>
                                <h5>{employee.joiningDate
                                    ? new Date(employee.joiningDate).toLocaleDateString()
                                    : "N/A"}</h5>
                            </div>

                            <div>
                                <small>Employee Type</small>
                                <h5>{employee.employmentType?.replace("_", " ")}</h5>
                            </div>

                            <div>
                                <small>Reporting Manager</small>
                                <h5>
                                    {employee.reportingManager?.name || "Not Assigned"}
                                </h5>
                            </div>

                            <div>
                                <small>Annual Leave Balance</small>
                                <h5>14 Days</h5>
                            </div>

                            <div>
                                <small>Office Location</small>
                                <h5>4th HQ · Floor 4</h5>
                            </div>

                        </div>

                    </div>

                </div>
                {/* ================= BOTTOM SECTION ================= */}

                <div className="bottom-section">

                    {/* Recent Tasks */}

                    <div className="card recent-card">

                        <div className="card-header">

                            <h3>Recent Tasks</h3>

                        </div>

                        <div className="task">

                            <div className="task-left">

                                <div className="task-success">✓</div>

                                <div>

                                    <h4>Finalize Dashboard Grid Tokens</h4>

                                    <p>Completed yesterday at 4:30 PM</p>

                                </div>

                            </div>

                            <MoreHorizontal size={18} />

                        </div>

                        <div className="task">

                            <div className="task-left">

                                <div className="task-blue">●</div>

                                <div>

                                    <h4>Conduct Stakeholder Interview - CEO</h4>

                                    <p>Scheduled tomorrow 10:00 AM</p>

                                </div>

                            </div>

                            <MoreHorizontal size={18} />

                        </div>

                        <div className="task">

                            <div className="task-left">

                                <div className="task-success">✓</div>

                                <div>

                                    <h4>Design System Color Palette Revamp</h4>

                                    <p>Completed on Monday</p>

                                </div>

                            </div>

                            <MoreHorizontal size={18} />

                        </div>

                    </div>

                    {/* Right Side */}

                    <div className="right-panel">

                        {/* Quick Actions */}

<div className="card">

    <h3>Quick Actions</h3>

    <div className="quick-buttons">

        <Link
    href={`/employees/${employee._id}/edit`}
    className="action-btn"
>
    <span>Edit Profile</span>
    <span>›</span>
</Link>

<Link
    href={`/employees/${employee._id}/edit`}
    className="action-btn"
>
    <span>Change Department</span>
    <span>›</span>
</Link>

<Link
    href={`/employees/${employee._id}/edit`}
    className="action-btn"
>
    <span>Assign Project</span>
    <span>›</span>
</Link>

<button
    className="danger-btn"
    onClick={handleDeactivate}
>
    <span>Deactivate Employee</span>
    <span>›</span>
</button>

    </div>

</div>

                        {/* Performance */}

                        <div className="card">

                            <h3>Performance & Attendance</h3>

                            <div className="stats">

                                <div className="stat-card">

                                    <div className="circle">

                                        <span>{employee.attendance}</span>

                                    </div>

                                    <h4>Attendance</h4>

                                    <small>Above company average</small>

                                </div>

                                <div className="stat-card">

                                    <div className="score">

                                        {employee.rewardScore}

                                    </div>

                                    <h4>Reward Score</h4>

                                    <small>Top performer</small>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}