"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CircleHelp } from "lucide-react";
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
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (propUser) {
            setUser(propUser);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me");
                const currentUser = response.data.user;
                const allowedAdminRoles = ["manager", "hr", "ceo"];

                if (currentUser?.role && !allowedAdminRoles.includes(currentUser.role.toLowerCase())) {
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("token");
                        localStorage.removeItem("teamflow_token");
                        localStorage.removeItem("user");
                        window.location.href = "/login";
                    }
                    return;
                }

                setUser(currentUser);
            } catch (error) {
                console.error("Navbar user fetch error:", error);
            }
        };

        fetchUser();
    }, [propUser]);

    useEffect(() => {
        api.get("/notifications")
            .then(res => {
                const list = res.data?.notifications || [];
                setUnreadCount(list.filter(n => !n.read).length);
            })
            .catch(() => null);
    }, []);

    return (
        <header className="topbar">
            <div className="header-right">
                <Link href="/notification" className="icons" title="Notifications" style={{ textDecoration: "none", color: "inherit", position: "relative" }}>
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            background: "#ef4444",
                            color: "white",
                            fontSize: "10px",
                            fontWeight: "bold",
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Link>

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
