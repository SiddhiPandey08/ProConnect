import {
  getConnectionRequestsForMe,
  AcceptConnectionRequest,
  getConnectionsRequest,
} from "@/config/redux/action/authAction";
import UserLayout from "@/layouts";
import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "@/config/index.jsx";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(getConnectionRequestsForMe({ token }));
    dispatch(getConnectionsRequest({ token }));
  }, []);

  const handleAccept = (connectionReqId) => {
    const token = localStorage.getItem("token");
    dispatch(
      AcceptConnectionRequest({ connectionReqId, token, action: "accept" }),
    ).then(() => {
      dispatch(getConnectionRequestsForMe({ token }));
    });
  };

  const handleReject = (connectionReqId) => {
    const token = localStorage.getItem("token");
    dispatch(
      AcceptConnectionRequest({ connectionReqId, token, action: "reject" }),
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
  // connections you sent that were accepted
  const sentAndAccepted = authState.connections.filter(
    (c) => c.status_accepted === true,
  );

  const allConnections = [...acceptedConnections, ...sentAndAccepted];

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

          {pendingRequests.length > 0 ? (
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
            <div className={styles.emptyState}>
              <p>No pending connection requests.</p>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>My Network</h1>

          {allConnections.length > 0 ? (
            <div className={styles.connectionContainer}>
              {allConnections.map((conn) => {
                // figure out which user to display
                const isSentByMe = conn.fromUserId?._id === authState.user?._id;
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
            <div className={styles.emptyState}>
              <p>No connections yet.</p>
            </div>
          )}
        </section>
      </DashboardLayout>
    </UserLayout>
  );
}
