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
      console.log(JSON.stringify(authState.user)),
    ]).finally(() => setLoading(false));
  }, []);

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

  useEffect(() => {
    if (!authState.user) return;
    allConnections.forEach((conn) => {
      console.log("authState.user at render:", authState.user);
      console.log({
        connId: conn._id,
        me: authState.user._id,
        fromId: conn.fromUserId?._id,
        toId: conn.toUserId?._id,
        isSentByMe:
          String(conn.fromUserId?._id) === String(authState.user?._id),
        displayName: (String(conn.fromUserId?._id) ===
        String(authState.user?._id)
          ? conn.toUserId
          : conn.fromUserId
        )?.name,
      });
    });
  }, [allConnections, authState.user]);
  return (
    <UserLayout>
      <DashboardLayout>
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>
            Connection Requests
            {pendingRequests.length > 0 && (
              <span className={styles.badge}>{pendingRequests.length}</span>
            )}
          </h1>

          {loading ? (
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyStateIcon}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                width="40"
                height="40"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
              <p className={styles.emptyStateTitle}>Your network is empty</p>
              <p className={styles.emptyStateSubtext}>
                Head to Discover to start connecting with people.
              </p>
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
            // Pending requests empty state
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyStateIcon}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                width="40"
                height="40"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <p className={styles.emptyStateTitle}>You're all caught up</p>
              <p className={styles.emptyStateSubtext}>
                No pending connection requests right now.
              </p>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>My Network</h1>

          {loading ? (
            <div className={styles.emptyState}>
              <p>Loading connections...</p>
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
                    <div
                      className={styles.connectionActions}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className={styles.connectedBadge}>Connected</div>
                      <button
                        className={styles.messageBtn}
                        onClick={() =>
                          router.push(`/messages?user=${displayUser._id}`)
                        }
                      >
                        Message
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No connections yet.</p>
            </div>
          )}
        </section>
      </DashboardLayout>
    </UserLayout>
  );
}
