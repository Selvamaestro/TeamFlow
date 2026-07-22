
"use client";

import "./details.css";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

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

    const [employee, setEmployee] = useState(null);

    const [loading, setLoading] = useState(true);

useEffect(() => {

    const fetchEmployee = async () => {

        try {

            const response = await api.get(`/users/${id}`);

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
if (loading) {
    return <h2>Loading employee...</h2>;
}

if (!employee) {
    return <h2>Employee not found.</h2>;
}

    return (
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
              <Briefcase size={15}/>
              {employee.department || "N/A"}
            </span>

            <span>
              <Mail size={15}/>
              {employee.email}
            </span>

            <span>
              <Phone size={15}/>
              {employee.phone || "N/A"}
            </span>

            <span>
              <MapPin size={15}/>
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
          <MoreHorizontal size={18}/>
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

        {/* Project 1 */}

        <div className="project">

            <div className="project-top">

                <div>

                    <h4>AdminPro Mobile App</h4>

                    <p>UI/UX Overhaul Phase 2</p>

                </div>

                <span className="green-badge">
                    ON TRACK
                </span>

            </div>

            <div className="progress-bar">

                <div
                    className="progress-fill"
                    style={{ width: "78%" }}
                />

            </div>

            <div className="progress-footer">

                <span>Progress</span>

                <span>78%</span>

            </div>

        </div>

        {/* Project 2 */}

        <div className="project">

            <div className="project-top">

                <div>

                    <h4>Global Design System</h4>

                    <p>Documentation & Tokens</p>

                </div>

                <span className="blue-badge">
                    PLANNING
                </span>

            </div>

            <div className="progress-bar">

                <div
                    className="progress-fill"
                    style={{ width: "32%" }}
                />

            </div>

            <div className="progress-footer">

                <span>Progress</span>

                <span>32%</span>

            </div>

        </div>

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
                <h5>employee.reportingManager?.name || "Not Assigned"</h5>
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

                <button>
                    Edit Profile
                    <span>›</span>
                </button>

                <button>
                    Change Department
                    <span>›</span>
                </button>

                <button>
                    Reset Password
                    <span>›</span>
                </button>

                <button className="danger-btn">
                    Deactivate Account
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

                        <span>98%</span>

                    </div>

                    <h4>Attendance</h4>

                    <small>Above company average</small>

                </div>

                <div className="stat-card">

                    <div className="score">

                        4.9

                    </div>

                    <h4>Reward Score</h4>

                    <small>Top performer</small>

                </div>

            </div>

        </div>

    </div>

</div>

  </div>
);
}