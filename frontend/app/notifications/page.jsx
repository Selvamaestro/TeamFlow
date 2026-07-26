"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import "./notification.css";

import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/services/notificationService";

export default function NotificationsPage() {
    const router = useRouter();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationAsRead(id);

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification._id === id
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read: true,
                }))
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenNotification = async (notification) => {
        try {
            if (!notification.read) {
                await markNotificationAsRead(notification._id);

                setNotifications((prev) =>
                    prev.map((item) =>
                        item._id === notification._id
                            ? { ...item, read: true }
                            : item
                    )
                );
            }

            if (notification.link) {
                router.push(notification.link);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    return (
        <div className="notifications-page">
            <div className="page-top">
                <button
                    className="back-btn"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
            </div>
            <div className="notifications-header">
                <div>
                    <h1>🔔 Notifications</h1>

                    <p>
                        Keep track of your latest updates and activities.
                    </p>
                </div>

                {notifications.length > 0 && (
                    <button
                        className="mark-all-btn"
                        onClick={handleMarkAllRead}
                    >
                        Mark All as Read
                    </button>
                )}
            </div>
            <div className="notification-summary">

                <div className="summary-card unread-card">
                    <h3>{unreadCount}</h3>
                    <p>Unread</p>
                </div>

                <div className="summary-card">
                    <h3>{notifications.length}</h3>
                    <p>Total</p>
                </div>

                <div className="summary-card read-card">
                    <h3>{notifications.length - unreadCount}</h3>
                    <p>Read</p>
                </div>

            </div>

            {loading ? (
                <div className="loading">
                    Loading notifications...
                </div>
            ) : notifications.length === 0 ? (
                <div className="empty-state">
                    <h3>No Notifications</h3>
                    <p>You don't have any notifications yet.</p>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`notification-card ${notification.read ? "read" : "unread"
                                }`}
                        >
                            <div
                                className="notification-content"
                                onClick={() =>
                                    handleOpenNotification(notification)
                                }
                            >
                                <div className="notification-top">
                                    <h3>{notification.title}</h3>

                                    {!notification.read && (
                                        <span className="status-dot"></span>
                                    )}
                                </div>

                                <p>{notification.body}</p>

                                <span className="notification-date">
                                    {new Date(
                                        notification.createdAt
                                    ).toLocaleString()}
                                </span>
                            </div>

                            {!notification.read && (
                                <button
                                    className="read-btn"
                                    onClick={() =>
                                        handleMarkRead(notification._id)
                                    }
                                >
                                    Mark Read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}