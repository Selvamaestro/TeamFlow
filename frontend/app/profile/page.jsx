"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import "./profile.css";
import Sidebar from "@/components/Sidebar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Search, Bell, CircleHelp } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
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
    const [events, setEvents] = useState([]);
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

    try{

        await api.delete(`/agenda/${id}`);

        fetchAgenda();

    }catch(err){

        console.error(err);

    }

};
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data.user);
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
            <Sidebar />

            <div className="dashboard-content">
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

        <div
            className="profile"
            onClick={() => window.location.href = "/profile"}
            style={{ cursor: "pointer" }}
        >

            <div className="profile-text">

                <h4>{user?.name || "User"}</h4>

                <span>{user?.role?.toUpperCase()}</span>

            </div>

<img
    src={
        user?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.name || "User"
        )}`
    }
    alt={user?.name || "Profile"}
    className="profile-image"
/>

        </div>

    </div>

</header>
                

                <div className="profile-container">

                    <h1 className="profile-title">👤 CEO Profile</h1>

                    <div className="profile-card">

                        <div className="profile-image-section">
<img
    src={
        user?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.name || "User"
        )}`
    }
    alt={user?.name || "Profile"}
    className="profile-image"
/>

                            <button
                                className="edit-profile-btn"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </button>

                            <button className="change-password-btn">
                                Change Password
                            </button>
                        </div>

                        <div className="profile-details">

                            <div className="profile-field">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={user?.name || ""}
                                    readOnly={!isEditing}
                                />
                            </div>

                            <div className="profile-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    readOnly={!isEditing}
                                />
                            </div>

                            <div className="profile-field">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={user?.phone || ""}
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
                                <button className="save-profile-btn">
                                    Save Changes
                                </button>
                            )}

                        </div>

                    </div>
                    {/* Calendar & Schedule */}

                    <div className="calendar-section">

                        <h2>📅 Calendar & Schedule</h2>

                        <div className="calendar-card">

                            <div className="calendar-header">

                                <h3>My Planner</h3>

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

                            <div className="selected-date">

                                <h3>
                                    Selected Date
                                </h3>

                                <p>{date.toDateString()}</p>

                            </div>

                        </div>

                    </div>
                    <div className="events-section">

                        <h3>Today's Schedule</h3>

                        {events.length === 0 ? (

                            <p>No events added yet.</p>

                        ) : (

                            events.map((event, index) => (

<div className="event-card" key={event._id}>

    <div className="event-header">

        <div>
            <h4>{event.title}</h4>
            <span>{event.type}</span>
        </div>

        <div className="event-actions">

            <button className="edit-btn">
                ✏
            </button>

            <button
                className="delete-btn"
                onClick={() => handleDelete(event._id)}
            >
                🗑
            </button>

        </div>

    </div>

    <p>
    📅 {new Date(event.date).toLocaleDateString()}
</p>

    <p>🕒 {event.time}</p>

    <p>{event.description}</p>

</div>

                            ))

                        )}

                    </div>
                    {/* Quick Stats */}

                    <div className="quick-stats-section">

                        <h2>📊 Quick Stats</h2>

                        <div className="quick-stats-grid">

                            <div className="stat-card">
                                <h3>18</h3>
                                <p>Active Projects</p>
                            </div>

                            <div className="stat-card">
                                <h3>24</h3>
                                <p>Employees</p>
                            </div>

                            <div className="stat-card">
                                <h3>12</h3>
                                <p>Clients</p>
                            </div>

                            <div className="stat-card">
                                <h3>₹6.1 Lakh</h3>
                                <p>Monthly Revenue</p>
                            </div>

                        </div>

                    </div>

                </div>
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