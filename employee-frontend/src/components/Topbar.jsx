import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as notificationApi from "../api/notification.api";

export default function Topbar({ title = "WorkforceConnect" }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    notificationApi
      .listNotifications({ unread: "true" })
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllRead() {
    await notificationApi.markAllNotificationsRead();
    setNotifications([]);
  }

  return (
    <header className="flex justify-between items-center w-full px-6 md:px-margin-desktop py-4 sticky top-0 z-40 bg-surface shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="font-headline-md text-headline-md font-bold text-primary">{title}</h2>
        <div className="hidden lg:flex items-center bg-surface-container px-4 py-2 rounded-full border border-outline-variant focus-within:border-primary transition-all">
          <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-body-md w-64"
            placeholder="Search tasks or files..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="relative material-symbols-outlined text-primary-container cursor-pointer active:opacity-80"
            aria-label="Notifications"
          >
            notifications
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] leading-4 rounded-full bg-error text-on-error text-center">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant">
                <span className="font-label-md text-label-md text-primary">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-label-sm text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-label-md text-on-surface-variant">You're all caught up.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className="px-4 py-3 border-b border-outline-variant last:border-b-0">
                      <p className="font-label-md text-on-surface">{n.title}</p>
                      <p className="text-label-sm text-on-surface-variant">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link
          to="/profile"
          className="material-symbols-outlined text-primary-container cursor-pointer active:opacity-80"
          aria-label="Settings"
        >
          settings
        </Link>

        <Link
          to="/profile"
          className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest cursor-pointer active:scale-95 transition-transform border-2 border-primary flex items-center justify-center"
        >
          {user?.avatarUrl ? (
            <img className="w-full h-full object-cover" src={user.avatarUrl} alt={user.name} />
          ) : (
            <span className="font-label-md text-primary">{user?.name?.[0]?.toUpperCase() || "?"}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
