"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, CircleHelp } from "lucide-react";
import api from "@/lib/api";
import { getAvatarUrl } from "@/lib/utils";

export default function Navbar({
    user: propUser,
    searchQuery = "",
    setSearchQuery,
    placeholder = "Search enterprise data...",
    helpText = "TeamFlow Enterprise Suite — Manage workspace data, active projects, workforce metrics, and performance insights."
}) {
    const [user, setUser] = useState(propUser || null);

    useEffect(() => {
        if (propUser) {
            setUser(propUser);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data.user);
            } catch (error) {
                console.error("Navbar user fetch error:", error);
            }
        };

        fetchUser();
    }, [propUser]);

    return (
        <header className="topbar">
            <div className="search-box">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                />
            </div>

            <div className="header-right">
                <div className="icons" title="Notifications">
                    <Bell size={20} />
                </div>

                <div className="icons help-tooltip-wrapper">
                    <CircleHelp size={20} />
                    {helpText && (
                        <div className="help-tooltip-popover">
                            {helpText}
                        </div>
                    )}
                </div>

                <Link href="/profile" style={{ textDecoration: "none" }}>
                    <div className="profile" style={{ cursor: "pointer" }}>
                        <div className="profile-text">
                            <h4>{user?.name || "User"}</h4>
                            <span>{user?.role ? user.role.toUpperCase() : "ADMINISTRATOR"}</span>
                        </div>
                        <img
                            src={getAvatarUrl(user)}
                            alt={user?.name || "Profile"}
                        />
                    </div>
                </Link>
            </div>
        </header>
    );
}
