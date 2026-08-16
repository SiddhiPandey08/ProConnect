import {
  getConnectionRequestsForMe,
  AcceptConnectionRequest,
  getConnectionsRequest,
} from "@/config/redux/action/authAction";
import UserLayout from "@/layouts";
import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "@/config/index.jsx";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      dispatch(getConnectionRequestsForMe({ token })),
      dispatch(getConnectionsRequest({ token })),
    ]).finally(() => setLoading(false));
  }, [dispatch]);

  const handleAccept = (connectionReqId) => {
    const token = localStorage.getItem("token");

    dispatch(
      AcceptConnectionRequest({
        connectionReqId,
        token,
        action: "accept",
      }),
    ).then(() => {
      dispatch(getConnectionRequestsForMe({ token }));
    });
  };

  const handleReject = (connectionReqId) => {
    const token = localStorage.getItem("token");

    dispatch(
      AcceptConnectionRequest({
        connectionReqId,
        token,
        action: "reject",
      }),
    ).then(() => {
      dispatch(getConnectionRequestsForMe({ token }));
    });
  };

  const pendingRequests = authState.connectionRequests.filter(
    (c) => c.status_accepted === null,
  );

  const acceptedConnections = authState.connectionRequests.filter(
    (c) => c.status_accepted === true,
  );

  // Connections you sent that were accepted
  const sentAndAccepted = authState.connections.filter(
    (c) => c.status_accepted === true,
  );

  const allConnections = [...acceptedConnections, ...sentAndAccepted];

  return (
    <UserLayout>
      <DashboardLayout>
        {/* ── Section 1: Connection Requests ── */}
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>
            Connection Requests
            {pendingRequests.length > 0 && (
              <span className={styles.badge}>{pendingRequests.length}</span>
            )}
          </h1>

          {loading ? (
            <div className={styles.emptyStateContainer}>
              <div className={styles.spinner} />
              <p>Fetching your pending requests...</p>
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className={styles.connectionContainer}>
              {pendingRequests.map((conn) => (
                <div
                  key={conn._id}
                  className={styles.connectionCard}
                  onClick={() =>
                    router.push(`/viewProfile/${conn.fromUserId.username}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.leftSection}>
                    <img
                      src={`${BASE_URL}/${conn.fromUserId.profilePicture}`}
                      className={styles.profilePicture}
                      alt={conn.fromUserId.name}
                    />

                    <div className={styles.userInfo}>
                      <h2>{conn.fromUserId.name}</h2>
                      <p>{conn.fromUserId.email}</p>
                    </div>
                  </div>

                  <div
                    className={styles.actionButtons}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={styles.acceptBtn}
                      onClick={() => handleAccept(conn._id)}
                    >
                      Accept
                    </button>

                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleReject(conn._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyStateContainer}>
              <div className={styles.iconCircle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={styles.emptyIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <h3>You’re all caught up!</h3>
              <p>You have no pending connection requests at the moment.</p>
            </div>
          )}
        </section>

        {/* ── Section 2: My Network ── */}
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>My Network</h1>

          {loading ? (
            <div className={styles.emptyStateContainer}>
              <div className={styles.spinner} />
              <p>Fetching your connections...</p>
            </div>
          ) : allConnections.length > 0 ? (
            <div className={styles.connectionContainer}>
              {allConnections.map((conn) => {
                const myUserId =
                  authState.user?.userId?._id ?? authState.user?.userId;

                const isSentByMe =
                  String(conn.fromUserId?._id) === String(myUserId);
                const displayUser = isSentByMe
                  ? conn.toUserId
                  : conn.fromUserId;

                return (
                  <div
                    key={conn._id}
                    className={styles.connectionCard}
                    onClick={() =>
                      router.push(`/viewProfile/${displayUser.username}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.leftSection}>
                      <img
                        src={`${BASE_URL}/${displayUser.profilePicture}`}
                        className={styles.profilePicture}
                        alt={displayUser.name}
                      />

                      <div className={styles.userInfo}>
                        <h2>{displayUser.name}</h2>
                        <p>{displayUser.email}</p>
                      </div>
                    </div>
                    <div className={styles.connectedBadge}>Connected</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyStateContainer}>
              <div className={styles.iconCircle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={styles.emptyIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.97 5.97 0 00-.942 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h3>No connections yet</h3>
              <p>
                Start growing your professional network by discovering people.
              </p>
              <button
                className={styles.discoverBtn}
                onClick={() => router.push("/discover")}
              >
                Discover People
              </button>
            </div>
          )}
        </section>
      </DashboardLayout>
    </UserLayout>
  );
}
