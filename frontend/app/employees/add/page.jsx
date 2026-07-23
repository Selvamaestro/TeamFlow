"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import "./add.css";
import "../../dashboard/dashboard.css";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
    ArrowLeft,
    User,
    Briefcase,
} from "lucide-react";

export default function AddEmployee() {

    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        department: "",
        designation: "",
        role: "employee",
        employmentType: "full_time",
        joiningDate: "",
        reportingManager: "",
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };
    const handleSubmit = async (e) => {
    e.preventDefault();

    try {

        const payload = { ...formData };

        if (!payload.reportingManager) {
            delete payload.reportingManager;
        }

        const response = await api.post("/users", payload);

        alert("Employee created successfully!");

        router.push("/employees");

    } catch (error) {

        console.error(error.response?.data);

        alert(
            error.response?.data?.message ||
            "Failed to create employee."
        );

    }
};


    return (
        <div className="dashboard-container">
            <Sidebar active="employees" />
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

                <form
                    className="register-card"
                    onSubmit={handleSubmit}
                >

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
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Jonathan Doe"
                                />

                            </div>

                            {/* Email */}

                            <div className="form-group">

                                <label>Email Address</label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="j.doe@corporate.com"
                                />

                            </div>

                            {/* Password */}

                            <div className="form-group">

                                <label>Password</label>

                                <div className="password-field">

                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
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
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
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

                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Department</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Human Resources">Human Resources</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Design">Design</option>
                                </select>

                            </div>

                            {/* Role */}

                            <div className="form-group">

                                <label>Role Designation</label>

                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Frontend Dev"
                                />

                            </div>

                            {/* Employee Type */}

                            <div className="form-group">

                                <label>Employee Type</label>

                                <div className="employee-type">

                                    <button
                                        type="button"
                                        className={formData.employmentType === "full_time" ? "active-type" : ""}
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                employmentType: "full_time",
                                            }))
                                        }
                                    >
                                        Full-Time
                                    </button>

                                    <button
                                        type="button"
                                        className={formData.employmentType === "contract" ? "active-type" : ""}
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                employmentType: "contract",
                                            }))
                                        }
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
                                    name="joiningDate"
                                    value={formData.joiningDate}
                                    onChange={handleChange}
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
                            onClick={() => router.push("/employees")}
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
                </form>
            </div>

        </div>

    );
}