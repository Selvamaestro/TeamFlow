"use client";
import { useState, useEffect } from "react";
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
    Eye,
    EyeOff,
    AlertCircle
} from "lucide-react";

export default function AddEmployee() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [existingEmails, setExistingEmails] = useState([]);
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");

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

    // Fetch existing user emails from MongoDB database on mount
    useEffect(() => {
        async function fetchExistingEmails() {
            try {
                const res = await api.get("/users?limit=1000").catch(() => null);
                const usersList = res?.data?.users || (Array.isArray(res?.data) ? res.data : []);
                const emails = usersList.map(u => (u.email || "").toLowerCase().trim()).filter(Boolean);
                setExistingEmails(emails);
            } catch (err) {
                console.warn("Notice: Failed to fetch existing user emails:", err);
            }
        }
        fetchExistingEmails();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 1. Compare email against existing users in database collection
        if (name === "email") {
            const trimmed = value.trim().toLowerCase();
            if (existingEmails.includes(trimmed)) {
                setEmailError("This email address is already registered in the database.");
            } else {
                setEmailError("");
            }
            setFormData((prev) => ({ ...prev, email: value }));
            return;
        }

        // 3. Restrict phone number to max 10 digits
        if (name === "phone") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
            if (digitsOnly.length > 0 && digitsOnly.length < 10) {
                setPhoneError("Phone number must be exactly 10 digits.");
            } else {
                setPhoneError("");
            }
            setFormData((prev) => ({ ...prev, phone: digitsOnly }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Re-validate email uniqueness
        const trimmedEmail = (formData.email || "").trim().toLowerCase();
        if (existingEmails.includes(trimmedEmail)) {
            setEmailError("This email address is already registered in the database.");
            return;
        }

        // Re-validate phone length
        if (formData.phone && formData.phone.length !== 10) {
            setPhoneError("Phone number must be exactly 10 digits.");
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        try {
            const payload = { ...formData, email: trimmedEmail };

            if (!payload.reportingManager) {
                delete payload.reportingManager;
            }

            await api.post("/users", payload);

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
                <form className="register-card" onSubmit={handleSubmit}>
                    <div className="card-top">
                        <div>
                            <h2>Employee Registration</h2>
                            <p>Fill in the details to onboard a new team member.</p>
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
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Jonathan Doe"
                                />
                            </div>

                            {/* 1. Unique Email Check */}
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="j.doe@corporate.com"
                                    style={{ borderColor: emailError ? "#d63031" : undefined }}
                                />
                                {emailError && (
                                    <span style={{ color: "#d63031", fontSize: "12px", fontWeight: "600", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <AlertCircle size={13} /> {emailError}
                                    </span>
                                )}
                            </div>

                            {/* 2. Password with Eye Toggle */}
                            <div className="form-group">
                                <label>Password *</label>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* 3. Phone Number Max 10 Digits */}
                            <div className="form-group">
                                <label>Phone Number (Max 10 Digits)</label>
                                <input
                                    type="text"
                                    name="phone"
                                    maxLength={10}
                                    inputMode="numeric"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 9876543210"
                                    style={{ borderColor: phoneError ? "#d63031" : undefined }}
                                />
                                {phoneError && (
                                    <span style={{ color: "#d63031", fontSize: "12px", fontWeight: "600", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <AlertCircle size={13} /> {phoneError}
                                    </span>
                                )}
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

                            {/* 4. Department (Human Resources Removed) */}
                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Department</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                </select>
                            </div>

                            {/* 5. Role (employee, manager, team_leader, hr) */}
                            <div className="form-group">
                                <label>User Role (DB Role)</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="employee">employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="team_leader">Team_leader</option>
                                    <option value="hr">Hr</option>
                                </select>
                            </div>

                            {/* 6. Custom Designation Input */}
                            <div className="form-group">
                                <label>Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Frontend Engineer"
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
                        <div className="info-icon">ℹ</div>
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