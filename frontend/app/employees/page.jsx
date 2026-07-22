"use client";

import "./employees.css";
import "../dashboard/dashboard.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";

import {
    Search,
    Plus,
    Cpu,
    Users,
    TrendingUp,
    Palette,
} from "lucide-react";

const departments = [
    {
        id: 1,
        icon: <Cpu size={24} />,
        title: "Engineering",
        members: 42,
        code: "DEPT_01",
    },
    {
        id: 2,
        icon: <Users size={24} />,
        title: "HR",
        members: 12,
        code: "DEPT_02",
    },
    {
        id: 3,
        icon: <TrendingUp size={24} />,
        title: "Sales",
        members: 28,
        code: "DEPT_03",
    },
    {
        id: 4,
        icon: <Palette size={24} />,
        title: "Design",
        members: 15,
        code: "DEPT_04",
    },
];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All Departments");
    const fetchEmployees = async () => {
        try {
            const response = await api.get("/users");

            setEmployees(response.data.users);
            console.log(response.data.users);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchEmployees();
    }, []);
    const filteredEmployees = useMemo(() => {
        return employees.filter((employee) => {

            const matchesSearch =
                employee.name?.toLowerCase().includes(search.toLowerCase()) ||
                employee.email?.toLowerCase().includes(search.toLowerCase());

            const matchesDepartment =
                departmentFilter === "All Departments" ||
                employee.department === departmentFilter;

            return matchesSearch && matchesDepartment;
        });
    }, [employees, search, departmentFilter]);
    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar active="employees" />
                <div className="employees-page">
                    <h2>Loading employees...</h2>
                </div>
            </div>
        );
    }
    console.log("Employees:", employees);
    return (
        <div className="dashboard-container">
            <Sidebar active="employees" />
            <div className="employees-page">

            {/* ================= Header ================= */}

            <div className="employees-header">

                <div>

                    <h1>Employee Directory</h1>

                    <p>
                        Manage, monitor and reward your workforce efficiency.
                    </p>

                </div>

                <Link
                    href="/employees/add"
                    className="add-btn"
                >
                    <Plus size={18} />

                    Add Employee

                </Link>

            </div>

            {/* ================= Search ================= */}

            <div className="search-section">

                <div className="search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

            </div>

            {/* ================= Department Cards ================= */}

            <div className="department-grid">

                {departments.map((dept) => (

                    <div
                        key={dept.id}
                        className="department-card"
                    >

                        <div className="card-top">

                            <div className="icon-box">

                                {dept.icon}

                            </div>

                            <span>

                                {dept.code}

                            </span>

                        </div>

                        <h3>

                            {dept.title}

                        </h3>

                        <div className="member-count">

                            <h2>

                                {dept.members}

                            </h2>

                            <p>

                                Members

                            </p>

                        </div>

                    </div>

                ))}

            </div>
            {/* ================= Employee Table ================= */}

            <div className="employee-table">

                <div className="table-header">

                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>

                        <h2>Full Staff List</h2>

                        <label>Filter by Department:</label>

                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >

                            <option>All Departments</option>

                            <option>Engineering</option>

                            <option>HR</option>

                            <option>Sales</option>

                            <option>Design</option>

                        </select>

                    </div>

                    <button className="filter-btn">

                        More Filters

                    </button>

                </div>

                <div className="table-responsive">

                    <table>

                        <thead>

                            <tr>

                                <th>Name</th>

                                <th>Department</th>

                                <th>Reward Score</th>

                                <th>Attendance</th>

                                <th>Current Project</th>

                                <th></th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredEmployees.map((employee) => (

                                <tr key={employee._id}>

                                    <td>

                                        <div className="employee-info">

                                            <div className="avatar">

                                                {employee.name?.charAt(0).toUpperCase()}

                                            </div>

                                            <div>

                                                <h4>{employee.name}</h4>

                                                <p>{employee.email}</p>

                                            </div>

                                        </div>

                                    </td>

                                    <td>

                                        <span className="dept-badge">

                                            {employee.role}

                                        </span>

                                    </td>

                                    <td>{employee.rewardScore}</td>

                                    <td>

                                        <div className="progress-wrapper">

                                            <span>{employee.attendance}</span>
                                            <div className="progress">

                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: "0%",
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    </td>

                                    <td>

                                        {employee.currentProject}

                                    </td>

                                    <td>

                                        <Link
                                            href={`/employees/${employee._id}`}
                                            className="view-btn"
                                        >

                                            View Details

                                        </Link>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>
                <div className="pagination">



                    <p>
                        Showing {filteredEmployees.length} of {filteredEmployees.length} employees
                    </p>


                    <div className="pages">

                        <button disabled>

                            Previous

                        </button>

                        <button className="active">

                            1

                        </button>

                        <button>

                            2

                        </button>

                        <button>

                            3

                        </button>

                        <button>

                            Next

                        </button>

                    </div>

                </div>

            </div>


        </div>
        </div>
    );
}