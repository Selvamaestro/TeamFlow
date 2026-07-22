import "./add.css";
import Link from "next/link";
import {
    ArrowLeft,
    User,
    Briefcase,
} from "lucide-react";

export default function AddEmployee() {
    return (
        <div className="add-page">

            {/* Breadcrumb */}

            <div className="page-header">

                <Link href="/employees" className="back-link">
                    <ArrowLeft size={16} />
                    Employees
                </Link>

                <span>/</span>

                <h3>Add New Employee</h3>

            </div>

            {/* Registration Card */}

            <div className="register-card">

                <div className="card-top">

                    <div>

                        <h2>Employee Registration</h2>

                        <p>
                            Fill in the details to onboard a new team member.
                        </p>

                    </div>

                    <div className="step-badge">
                        STEP 1 OF 1
                    </div>

                </div>

                {/* ================= BASIC INFORMATION ================= */}

                <div className="section">

                    <div className="section-title">

                        <User size={16} />

                        <h4>Basic Information</h4>

                    </div>

                    <div className="form-grid">

                        {/* Full Name */}

                        <div className="form-group">

                            <label>Full Name</label>

                            <input
                                type="text"
                                placeholder="e.g. Jonathan Doe"
                            />

                        </div>

                        {/* Email */}

                        <div className="form-group">

                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="j.doe@corporate.com"
                            />

                        </div>

                        {/* Password */}

                        <div className="form-group">

                            <label>Password</label>

                            <div className="password-field">

                                <input
                                    type="password"
                                    placeholder="••••••••"
                                />

                                <button
                                    type="button"
                                    className="eye-btn"
                                >
                                    👁
                                </button>

                            </div>

                        </div>

                        {/* Phone */}

                        <div className="form-group">

                            <label>Phone Number</label>

                            <input
                                type="text"
                                placeholder="+1 (555) 000-0000"
                            />

                        </div>

                    </div>

                </div>
                {/* ================= JOB DETAILS ================= */}

<div className="section">

    <div className="section-title">

        <Briefcase size={16} />

        <h4>Job Details</h4>

    </div>

    <div className="form-grid">

        {/* Department */}

        <div className="form-group">

            <label>Department</label>

            <select>

                <option>Select Department</option>
                <option>Engineering</option>
                <option>Human Resources</option>
                <option>Finance</option>
                <option>Sales</option>
                <option>Design</option>

            </select>

        </div>

        {/* Role */}

        <div className="form-group">

            <label>Role Designation</label>

            <input
                type="text"
                placeholder="e.g. Senior Frontend Dev"
            />

        </div>

        {/* Employee Type */}

        <div className="form-group">

            <label>Employee Type</label>

            <div className="employee-type">

                <button
                    type="button"
                    className="active-type"
                >
                    Full-Time
                </button>

                <button
                    type="button"
                >
                    Contract
                </button>

            </div>

        </div>

        {/* Join Date */}

        <div className="form-group">

            <label>Join Date</label>

            <input
                type="date"
            />

        </div>

    </div>

</div>
{/* ================= INITIAL ASSIGNMENT ================= */}

<div className="section">

    <div className="section-title">

        <Briefcase size={16} />

        <h4>Initial Assignment</h4>

    </div>

    <div className="form-grid">

        {/* Primary Project */}

        <div className="form-group">

            <label>Primary Project</label>

            <select>

                <option>Select Primary Project</option>

                <option>AdminPro Mobile App</option>

                <option>Employee Portal</option>

                <option>CRM Dashboard</option>

                <option>Analytics Platform</option>

            </select>

        </div>

        {/* Reward Score */}

        <div className="form-group">

            <label>Reward Score (Starting)</label>

            <input
                type="number"
                placeholder="100"
            />

            <small className="helper-text">
                Initial score for performance evaluation.
            </small>

        </div>

    </div>

</div>

{/* ================= ACTION BUTTONS ================= */}

<div className="form-actions">

    <button
        type="button"
        className="cancel-btn"
    >
        Cancel
    </button>

    <button
        type="submit"
        className="create-btn"
    >
        Create Employee
    </button>

</div>

{/* ================= INFO BOX ================= */}

<div className="info-box">

    <div className="info-icon">

        ℹ

    </div>

    <div>

        <h5>Automatic Notification</h5>

        <p>

            Once you create the employee, a welcome email with login
            credentials and onboarding instructions will be sent automatically.

        </p>

    </div>

</div>

            </div>

        </div>
    );
}