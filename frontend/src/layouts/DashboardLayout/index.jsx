import React, { useState, useMemo, useEffect } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { setIsTokenPresent } from "@/config/redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config/index.jsx";
import socket from "@/config/socket.js";
import {
  fetchNotifications,
  markNotificationsRead,
} from "@/config/redux/action/notificationAction";
import { addNotification } from "@/config/redux/reducer/notificationReducer";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState(null); // 'notifications' | 'search' | null

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      router.push("/login");
    }
    dispatch(setIsTokenPresent());
    dispatch(getAllUsers());
  }, []);

  // ── Search filter ───────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    if (!authState.all_users_fetched) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return authState.all_users;
    return authState.all_users.filter((user) => {
      const name = user.userId?.name?.toLowerCase() ?? "";
      const username = user.userId?.username?.toLowerCase() ?? "";
      return name.includes(q) || username.includes(q);
    });
  }, [searchQuery, authState.all_users, authState.all_users_fetched]);

  const notificationState = useSelector((state) => state.notifications);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchNotifications({ token }));
    }

    socket.on("new_notification", (notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  const handleMarkRead = () => {
    const token = localStorage.getItem("token");
    dispatch(markNotificationsRead({ token }));
  };
  const renderNotifications = () => (
    <>
      <div className={styles.notifHeader}>
        <h2 className={styles.sidebarHeading}>Notifications</h2>
        {notificationState.unreadCount > 0 && (
          <button className={styles.markReadBtn} onClick={handleMarkRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.notifList}>
        {notificationState.notifications.filter((n) => !n.isRead).length ===
        0 ? (
          <p className={styles.noResults}>No notifications yet.</p>
        ) : (
          notificationState.notifications
            .filter((n) => !n.isRead)
            .map((notif) => (
              <div
                key={notif._id}
                className={`${styles.notifItem} ${
                  !notif.isRead ? styles.notifUnread : ""
                }`}
              >
                <img
                  className={styles.notifAvatar}
                  src={
                    notif.fromUserId?.profilePicture
                      ? `${BASE_URL}/${notif.fromUserId.profilePicture}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          notif.fromUserId?.name ?? "U",
                        )}&background=0077b5&color=fff&size=64`
                  }
                  alt={notif.fromUserId?.name}
                />

                <div className={styles.notifBody}>
                  <p className={styles.notifMessage}>{notif.message}</p>

                  <span className={styles.notifTime}>
                    {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {!notif.isRead && <span className={styles.unreadDot} />}
              </div>
            ))
        )}
      </div>
    </>
  );

  const renderSearch = () => (
    <>
      <h2 className={styles.sidebarHeading}>Top Profiles</h2>

      <div className={styles.searchWrapper}>
        <svg
          className={styles.searchIcon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search people…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className={styles.searchClear}
            onClick={() => setSearchQuery("")}
            aria-label="Clear"
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.userList}>
        {authState.all_users_fetched && filteredUsers.length === 0 && (
          <p className={styles.noResults}>No users found.</p>
        )}
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className={styles.userRow}
            onClick={() => {
              router.push(`/viewProfile/${user.userId.username}`);
              setMobilePanel(null);
            }}
          >
            <img
              className={styles.userAvatar}
              src={`${BASE_URL}/${user.userId.profilePicture}`}
              alt={user.userId?.name ?? "User"}
            />
            <div className={styles.userRowInfo}>
              <span className={styles.userRowName}>{user.userId?.name}</span>
              <span className={styles.userRowEmail}>{user.userId?.email}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.homeContainer}>
          {/* ── Left sidebar ── */}
          <div className={styles.homeContainer_left}>
            <div
              onClick={() => router.push("/dashboard")}
              className={styles.sideBarOption}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <p>Home</p>
            </div>
            <div
              onClick={() => router.push("/discover")}
              className={styles.sideBarOption}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>

              <p>Discover</p>
            </div>
            <div
              onClick={() => router.push("/my_connections")}
              className={styles.sideBarOption}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
              </svg>
              <p>My Connections</p>
            </div>
          </div>

          {/* ── Feed ── */}
          <div className={styles.feedContainer}>{children}</div>

          {/* ── Right sidebar ── */}
          <div className={styles.extracontainer}>
            {/* ── Notifications ── */}
            <div className={styles.sidebarCard}>{renderNotifications()}</div>

            {/* ── Top Profiles ── */}
            <div className={styles.sidebarCard}>{renderSearch()}</div>
          </div>

          {/* Mobile nav */}
          <div className={styles.mobileNav}>
            {/* Home */}
            <div
              className={`${styles.mobileNavItem} ${
                router.pathname === "/dashboard" ? styles.active : ""
              }`}
              onClick={() => router.push("/dashboard")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <span>Home</span>
            </div>

            {/* Discover */}
            <div
              className={`${styles.mobileNavItem} ${
                router.pathname === "/discover" ? styles.active : ""
              }`}
              onClick={() => router.push("/discover")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>

              <span>Discover</span>
            </div>

            {/* Search */}
            <div
              className={styles.mobileNavItem}
              onClick={() =>
                setMobilePanel(mobilePanel === "search" ? null : "search")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 1 0-10.607 0 7.5 7.5 0 0 0 10.607 0Z"
                />
              </svg>
              <span>Search</span>
            </div>

            {/* Notifications */}
            <div
              className={styles.mobileNavItem}
              onClick={() =>
                setMobilePanel(
                  mobilePanel === "notifications" ? null : "notifications",
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path d="M4.214 3.227a.75.75 0 0 0-1.156-.955 8.97 8.97 0 0 0-1.856 3.825.75.75 0 0 0 1.466.316 7.47 7.47 0 0 1 1.546-3.186ZM16.942 2.272a.75.75 0 0 0-1.157.955 7.47 7.47 0 0 1 1.547 3.186.75.75 0 0 0 1.466-.316 8.971 8.971 0 0 0-1.856-3.825Z" />
                <path
                  fillRule="evenodd"
                  d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6Zm0 14.5a2 2 0 0 1-1.95-1.557 33.54 33.54 0 0 0 3.9 0A2 2 0 0 1 10 16.5Z"
                  clipRule="evenodd"
                />
              </svg>

              {notificationState.unreadCount > 0 && (
                <span className={styles.mobileNavBadge} />
              )}

              <span>Notifications</span>
            </div>

            {/* Connections */}
            <div
              className={`${styles.mobileNavItem} ${
                router.pathname === "/my_connections" ? styles.active : ""
              }`}
              onClick={() => router.push("/my_connections")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
              </svg>
              <span>Connections</span>
            </div>
          </div>

          {/* Mobile Overlay */}
          {mobilePanel && (
            <div
              className={styles.mobileOverlay}
              onClick={() => setMobilePanel(null)}
            >
              <div
                className={styles.mobileOverlayPanel}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.mobileOverlayClose}
                  onClick={() => setMobilePanel(null)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {mobilePanel === "notifications"
                  ? renderNotifications()
                  : renderSearch()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
