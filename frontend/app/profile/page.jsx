"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import "./profile.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getAvatarUrl } from "@/lib/utils";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import authService from "@/services/authService";
import { Search, Bell, CircleHelp } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);

    const [eventData, setEventData] = useState({
        title: "",
        date: "",
        time: "",
        type: "Meeting",
        description: "",
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
    const [events, setEvents] = useState([]);
    const handleSaveProfile = async () => {

        try {

            const response = await api.put(
                "/auth/profile",
                formData
            );

            setUser(response.data.user);

            setIsEditing(false);

            alert("Profile updated successfully!");

        } catch (err) {

            console.error(err);

            alert("Failed to update profile.");

        }

    };
    const handleSaveEvent = async () => {
        try {
            if (!eventData.title || !eventData.date || !eventData.time) {
                alert("Please fill all required fields.");
                return;
            }

            await api.post("/agenda", eventData);

            fetchAgenda();

            setEventData({
                title: "",
                date: "",
                time: "",
                type: "Meeting",
                description: "",
            });

            setShowModal(false);

        } catch (err) {
            console.error(err);
        }
    };
    const handleDelete = async (id) => {

        try {

            await api.delete(`/agenda/${id}`);

            fetchAgenda();

        } catch (err) {

            console.error(err);

        }

    };
    const handlePasswordChange = async () => {

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            alert("Passwords do not match");
            return;
        }

        try {

            await api.put("/auth/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            alert("Password updated successfully");

            setShowPasswordModal(false);

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to update password"
            );
        }
    };
    const handleImageSelect = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);

};
const uploadProfileImage = async () => {

    if (!selectedImage) return;

    const formData = new FormData();

    formData.append("avatar", selectedImage);

    try {

        const response = await api.post(
            "/auth/upload-avatar",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log("Uploaded User:", response.data.user);
        console.log("Avatar URL:", response.data.user.avatarUrl);

        setUser(response.data.user);
        setSelectedImage(null);

        alert("Profile picture updated!");

    } catch (err) {

        console.error(err);
        alert("Upload failed");

    }

};

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authService.getProfile();
                setUser(response.data.user);
                setFormData({
                    name: response.data.user.name || "",
                    email: response.data.user.email || "",
                    phone: response.data.user.phone || "",
                });
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        const fetchAgenda = async () => {
            try {
                const response = await api.get("/agenda");

                setEvents(response.data.agenda);

            } catch (err) {
                console.error(err);
            }
        };

        fetchProfile();
        fetchAgenda();
    }, []);



    return (
        <div className="dashboard-container">
            <Sidebar active="profile" />

            <div className="dashboard-content">
                <Navbar
                    user={user}
                    helpText="User Profile & Settings — View and edit your profile details, security credentials, and personal agenda."
                />


                <div className="profile-container">
                    {/* ================= Welcome Banner ================= */}

                    <div className="welcome-banner">

                        <div>

                            <h1>

                                Good {new Date().getHours() < 12
                                    ? "Morning"
                                    : new Date().getHours() < 18
                                        ? "Afternoon"
                                        : "Evening"}, {user?.name?.split(" ")[0]} 👋

                            </h1>

                            <p>

                                Welcome back! Here's your enterprise overview for today.

                            </p>

                        </div>

                        <div className="welcome-right">

                            <div className="today-box">

                                <h3>

                                    {new Date().toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                    })}

                                </h3>

                                <span>

                                    TeamFlow Workforce Management

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="profile-hero">

                        <div className="hero-left">

<div
    className="hero-avatar"
    onClick={() => fileInputRef.current.click()}
>

<img
    src={
        selectedImage
            ? URL.createObjectURL(selectedImage)
            : getAvatarUrl(user)
    }
    alt="Profile"
/>

    <div className="avatar-overlay">
        📷
    </div>
    


</div>
    <button
    className="primary-btn"
    onClick={uploadProfileImage}
>
    Upload Photo
</button>

<input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={handleImageSelect}
/>

                            <div className="hero-info">

                                <h1>{user?.name}</h1>

                                <h3>Chief Executive Officer</h3>

                                <p>{user?.email}</p>

                                <div className="hero-badges">

                                    <span className="badge role">
                                        {user?.role?.toUpperCase()}
                                    </span>

                                    <span className="badge active">
                                        Active
                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="hero-right">

                            <button
                                className="primary-btn"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                ✏ {isEditing ? "Cancel" : "Edit Profile"}
                            </button>

                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className=".change-password-btn"
                            >
                                Change Password
                            </button>

                        </div>

                    </div>

                    <div className="info-grid">

                        <div className="info-card">

                            <h2>Personal Information</h2>

                            <div className="profile-field">

                                <label>Full Name</label>

                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    readOnly={!isEditing}
                                />

                            </div>

                            <div className="profile-field">

                                <label>Email</label>

                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    readOnly={!isEditing}
                                />

                            </div>

                            <div className="profile-field">

                                <label>Phone</label>

                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    readOnly={!isEditing}
                                />

                            </div>

                            <div className="profile-field">

                                <label>Role</label>

                                <input
                                    type="text"
                                    value={user?.role || ""}
                                    readOnly
                                />

                            </div>

                            {isEditing && (

                                <button
                                    className="save-profile-btn"
                                    onClick={handleSaveProfile}
                                >

                                    💾 Save Changes

                                </button>

                            )}

                        </div>

                        <div className="stats-card">

                            <h2>Quick Overview</h2>

                            <div className="mini-stat">

                                <span>👥</span>

                                <div>

                                    <h3>24</h3>

                                    <p>Employees</p>

                                </div>

                            </div>

                            <div className="mini-stat">

                                <span>📁</span>

                                <div>

                                    <h3>18</h3>

                                    <p>Projects</p>

                                </div>

                            </div>

                            <div className="mini-stat">

                                <span>🏢</span>

                                <div>

                                    <h3>12</h3>

                                    <p>Clients</p>

                                </div>

                            </div>

                            <div className="mini-stat">

                                <span>💰</span>

                                <div>

                                    <h3>₹6.1L</h3>

                                    <p>Revenue</p>

                                </div>

                            </div>

                        </div>

                    </div>
                    {/* ================= Calendar Section ================= */}

                    <div className="planner-grid">

                        <div className="calendar-card">

                            <div className="card-header">

                                <h2>📅 My Planner</h2>

                                <button
                                    className="add-event-btn"
                                    onClick={() => setShowModal(true)}
                                >
                                    + Add Event
                                </button>

                            </div>

                            <Calendar
                                onChange={setDate}
                                value={date}
                            />

                            <div className="selected-date-box">

                                <h4>Selected Date</h4>

                                <p>{date.toDateString()}</p>

                            </div>

                        </div>

                        <div className="agenda-card">

                            <div className="card-header">

                                <h2>Today's Agenda</h2>

                            </div>

                            {events.length === 0 ? (

                                <div className="empty-agenda">

                                    <h3>🎉 No Events Today</h3>

                                    <p>
                                        Your schedule is completely free.
                                    </p>

                                </div>

                            ) : (

                                events.map((event) => (

                                    <div
                                        key={event._id}
                                        className="agenda-item"
                                    >

                                        <div className="agenda-icon">

                                            {event.type === "Meeting"
                                                ? "🔵"
                                                : event.type === "Task"
                                                    ? "🟢"
                                                    : "🟠"}

                                        </div>

                                        <div className="agenda-content">

                                            <h4>{event.title}</h4>

                                            <span>

                                                {event.date} • {event.time}

                                            </span>

                                            <p>{event.description}</p>

                                        </div>

                                        <button
                                            className="delete-event-btn"
                                            onClick={() => handleDelete(event._id)}
                                        >
                                            ✕
                                        </button>

                                    </div>

                                ))

                            )}

                        </div>

                    </div>
                    {/* ================= Performance Dashboard ================= */}

                    <div className="performance-section">

                        <h2>Performance Dashboard</h2>

                        <div className="performance-grid">

                            <div className="performance-card">

                                <div className="performance-icon blue">
                                    📁
                                </div>

                                <div>

                                    <h3>18</h3>

                                    <p>Active Projects</p>

                                    <small>+3 this month</small>

                                </div>

                            </div>

                            <div className="performance-card">

                                <div className="performance-icon green">
                                    👥
                                </div>

                                <div>

                                    <h3>24</h3>

                                    <p>Employees</p>

                                    <small>95% Attendance</small>

                                </div>

                            </div>

                            <div className="performance-card">

                                <div className="performance-icon orange">
                                    🏢
                                </div>

                                <div>

                                    <h3>12</h3>

                                    <p>Clients</p>

                                    <small>2 New Clients</small>

                                </div>

                            </div>

                            <div className="performance-card">

                                <div className="performance-icon purple">
                                    💰
                                </div>

                                <div>

                                    <h3>₹6.1L</h3>

                                    <p>Monthly Revenue</p>

                                    <small>↑ 18%</small>

                                </div>

                            </div>

                        </div>

                    </div>



                    {/* ================= Activity ================= */}

                    <div className="activity-grid">

                        <div className="activity-card">

                            <h2>Recent Activity</h2>

                            <div className="timeline">

                                <div className="timeline-item">

                                    <div className="dot blue"></div>

                                    <div>

                                        <h4>New Employee Joined</h4>

                                        <p>Rahul Kumar joined Development Team</p>

                                        <span>Today • 09:15 AM</span>

                                    </div>

                                </div>

                                <div className="timeline-item">

                                    <div className="dot green"></div>

                                    <div>

                                        <h4>Project Completed</h4>

                                        <p>Inventory System delivered successfully</p>

                                        <span>Yesterday</span>

                                    </div>

                                </div>

                                <div className="timeline-item">

                                    <div className="dot orange"></div>

                                    <div>

                                        <h4>Client Meeting</h4>

                                        <p>Quarterly planning discussion completed</p>

                                        <span>2 days ago</span>

                                    </div>

                                </div>

                            </div>

                        </div>



                        <div className="activity-card">

                            <h2>Today's Progress</h2>

                            <div className="progress-item">

                                <label>Projects</label>

                                <progress value="80" max="100"></progress>

                                <span>80%</span>

                            </div>

                            <div className="progress-item">

                                <label>Revenue Target</label>

                                <progress value="65" max="100"></progress>

                                <span>65%</span>

                            </div>

                            <div className="progress-item">

                                <label>Attendance</label>

                                <progress value="92" max="100"></progress>

                                <span>92%</span>

                            </div>

                            <div className="progress-item">

                                <label>Task Completion</label>

                                <progress value="88" max="100"></progress>

                                <span>88%</span>

                            </div>

                        </div>

                    </div>
                </div>
                {showPasswordModal && (
                    <div className="password-modal-overlay">

                        <div className="password-modal">

                            <h2>Change Password</h2>

                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value,
                                    })
                                }
                            />

                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value,
                                    })
                                }
                            />

                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                            />

                            <div className="password-buttons">

                                <button
                                    className="password-cancel"
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="password-save"
                                    onClick={handlePasswordChange}
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">

                    <div className="event-modal">

                        <h2>Add Event</h2>

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                placeholder="Enter title"
                                value={eventData.title}
                                onChange={(e) =>
                                    setEventData({
                                        ...eventData,
                                        title: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={eventData.date}
                                onChange={(e) =>
                                    setEventData({
                                        ...eventData,
                                        date: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Time</label>
                            <input
                                type="time"
                                value={eventData.time}
                                onChange={(e) =>
                                    setEventData({
                                        ...eventData,
                                        time: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>

                            <select
                                value={eventData.type}
                                onChange={(e) =>
                                    setEventData({
                                        ...eventData,
                                        type: e.target.value,
                                    })
                                }
                            >
                                <option>Meeting</option>
                                <option>Task</option>
                                <option>Reminder</option>
                            </select>

                        </div>

                        <div className="form-group">
                            <label>Description</label>

                            <textarea
                                rows="4"
                                value={eventData.description}
                                onChange={(e) =>
                                    setEventData({
                                        ...eventData,
                                        description: e.target.value,
                                    })
                                }
                            />

                        </div>

                        <div className="modal-buttons">

                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="save-btn"
                                onClick={handleSaveEvent}
                            >
                                Save Event
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}