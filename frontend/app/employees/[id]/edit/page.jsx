"use client";

import "../../employees.css";
import "../../../dashboard/dashboard.css";
import "./edit.css";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import api from "@/lib/api";

export default function EditEmployee() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [projects, setProjects] = useState([]);

const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    location: "",
    employmentType: "",
    currentProject: "",
});
    useEffect(() => {
  async function fetchEmployee() {
    try {
        const [employeeResponse, projectResponse] = await Promise.all([
            api.get(`/users/${id}`),
            api.get("/projects"),
        ]);

        const emp = employeeResponse.data.user;

        setProjects(projectResponse.data.projects || []);

        setForm({
            name: emp.name || "",
            email: emp.email || "",
            phone: emp.phone || "",
            department: emp.department || "",
            designation: emp.designation || "",
            location: emp.location || "",
            employmentType: emp.employmentType || "",
            currentProject: emp.currentProject?._id || "",
        });

    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
}

        fetchEmployee();
    }, [id]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);

        try {
            await api.patch(`/users/${id}`, form);

            alert("Employee updated successfully.");

            router.push(`/employees/${id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to update employee.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar active="employees" />
                <div className="main-content">
                    <h2 style={{ padding: 40 }}>
                        Loading...
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">

            <Sidebar active="employees" />

            <div className="main-content">

                <section className="dashboard edit-page">

                    <div className="edit-title">

                        <h1>Edit Employee</h1>

                        <p>
                            Update employee profile information.
                        </p>

                    </div>
                    <div className="edit-profile-header">

                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                form.name || "User"
                            )}&background=0f172a&color=ffffff&bold=true&size=200`}
                            alt={form.name}
                        />

                        <div>

                            <h2>{form.name}</h2>

                            <p>{form.designation || "Employee"}</p>

                            <span>{form.department || "Department"}</span>

                        </div>

                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="dashboard-form-card edit-card"
                    >

                        <div className="form-grid">
                            <div className="edit-section">

                                <h3>Personal Information</h3>

                                <div className="form-group">
                                    <label>Name</label>

                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>

                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>

                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>

                                    <input
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="edit-section">

                                <h3>Job Information</h3>

                                <div className="form-group">
                                    <label>Department</label>

                                    <select
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                    >
                                        <option>Engineering</option>
                                        <option>HR</option>
                                        <option>Sales</option>
                                        <option>Design</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Designation</label>

                                    <input
                                        name="designation"
                                        value={form.designation}
                                        onChange={handleChange}
                                    />
                                </div>



                                <div className="form-group full-width">
                                    <label>Employment Type</label>

                                    <select
                                        name="employmentType"
                                        value={form.employmentType}
                                        onChange={handleChange}
                                    >
                                        <option value="full_time">
                                            Full Time
                                        </option>

                                        <option value="part_time">
                                            Part Time
                                        </option>

                                        <option value="contract">
                                            Contract
                                        </option>

                                        <option value="intern">
                                            Intern
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="edit-section">

    <h3>Project Assignment</h3>

    <div className="form-group">

        <label>Current Project</label>

        <select
            name="currentProject"
            value={form.currentProject}
            onChange={handleChange}
        >

            <option value="">No Project</option>

            {projects.map((project) => (

                <option
                    key={project._id}
                    value={project._id}
                >
                    {project.title}
                </option>

            ))}

        </select>

    </div>

</div>

                        </div>

                        <div className="button-group">

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-btn"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "💾 Save Changes"}
                            </button>

                        </div>

                    </form>

                </section>

            </div>

        </div>
    );
}