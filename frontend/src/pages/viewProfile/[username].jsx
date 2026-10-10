import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clientServer, BASE_URL } from "@/config/index.jsx";
import UserLayout from "@/layouts";
import DashboardLayout from "@/layouts/DashboardLayout";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction/index.js";
import {
  getConnectionsRequest,
  getConnectionRequestsForMe,
  sendConnectionRequest,
} from "@/config/redux/action/authAction/index.js";
import { showToast } from "@/config/redux/reducer/toastReducer";

function timeAgo(dateString) {
  if (!dateString) return "";

  const now = new Date();
  const posted = new Date(dateString);
  const seconds = Math.floor((now - posted) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return posted.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: posted.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function TruncatedBio({ text, maxLines = 4 }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <div>
      <p
        className={styles.bioText}
        style={
          !expanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {text}
      </p>

      {text.length > 180 && (
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export default function ViewProfileComponent({ userProfile }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const postReducer = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [currentUserInConnection, setCurrentUserInConnection] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);
  const [isAddEduOpen, setIsAddEduOpen] = useState(false);

  const getUserPosts = async () => {
    dispatch(getAllPosts());
    dispatch(
      getConnectionsRequest({
        token: localStorage.getItem("token"),
        userId: userProfile.userId._id,
      }),
    );
    dispatch(
      getConnectionRequestsForMe({
        token: localStorage.getItem("token"),
      }),
    );
  };

  useEffect(() => {
    getUserPosts();
  }, []);

  useEffect(() => {
    const posts = postReducer.posts.filter(
      (post) => post.userId.username === router.query.username,
    );
    setUserPosts(posts);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    const sentConnection = authState.connections.find(
      (c) => c.toUserId._id === userProfile.userId._id,
    );
    const receivedConnection = authState.connectionRequests.find(
      (c) => c.fromUserId._id === userProfile.userId._id,
    );

    const connection = sentConnection || receivedConnection;

    if (connection && connection.status_accepted !== false) {
      setCurrentUserInConnection(true);
      setIsConnectionNull(connection.status_accepted !== true);
    } else {
      setCurrentUserInConnection(false);
      setIsConnectionNull(true);
    }
  }, [
    authState.connections,
    authState.connectionRequests,
    userProfile.userId._id,
  ]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          {/* Header Banner */}
          <div className={styles.backDropContainer}>
            <img
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt={userProfile.userId.name}
              className={styles.profileAvatar}
            />
          </div>

          {/* Profile Details */}
          <div className={styles.profileContainer_details}>
            <div className={styles.profileBody}>
              {/* Left Column */}
              <div className={styles.leftCol}>
                <div className={styles.nameRow}>
                  <h2>{userProfile.userId.name}</h2>
                  <span className={styles.username}>
                    @{userProfile.userId.username}
                  </span>
                </div>

                {userProfile.currentPosition && (
                  <p className={styles.headline}>
                    {userProfile.currentPosition}
                  </p>
                )}

                {/* Actions Row */}
                <div className={styles.actionsRow}>
                  {authState.user?.userId?._id !== userProfile.userId._id && (
                    <>
                      {currentUserInConnection ? (
                        <>
                          <button
                            className={
                              isConnectionNull
                                ? styles.pendingBtn
                                : styles.connectedBtn
                            }
                          >
                            {isConnectionNull ? "Pending" : "Connected"}
                          </button>
                          {!isConnectionNull && (
                            <button
                              className={styles.messageBtn}
                              onClick={() =>
                                router.push(
                                  `/messages?user=${userProfile.userId._id}`,
                                )
                              }
                            >
                              Message
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          className={styles.connectBtn}
                          onClick={() => {
                            dispatch(
                              sendConnectionRequest({
                                token: localStorage.getItem("token"),
                                userId: userProfile.userId._id,
                              }),
                            ).then(() => {
                              dispatch(
                                showToast({
                                  message: "Connection request sent",
                                  type: "success",
                                }),
                              );
                            });
                          }}
                        >
                          Connect
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    className={styles.downloadResume}
                    onClick={async () => {
                      const res = await clientServer.get(
                        `/download_resume?id=${userProfile._id}`,
                      );
                      window.open(`${BASE_URL}/${res.data.message}`, "_blank");
                    }}
                  >
                    <svg
                      style={{ width: "1.25rem", height: "1.25rem" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.75}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                    Download Profile
                  </button>
                </div>

                {/* About Section */}
                {userProfile.bio && (
                  <div className={styles.sectionBlock}>
                    <h4>About</h4>
                    <TruncatedBio text={userProfile.bio} />
                  </div>
                )}

                {/* Work History */}
                <div className={styles.sectionBlock}>
                  <h4>Work History</h4>
                  <div className={styles.workHistoryContent}>
                    {userProfile.pastWork.map((work, index) => (
                      <div key={index} className={styles.workHistoryItem}>
                        <p className={styles.workRole}>
                          <span className={styles.workCompany}>
                            {work.company}
                          </span>
                          <span className={styles.workPosition}>
                            {" "}
                            · {work.position}
                          </span>
                        </p>
                        <p className={styles.workYears}>{work.years}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className={styles.sectionBlock}>
                  <h4>Education</h4>
                  <div className={styles.workHistoryContent}>
                    {(userProfile.education || []).map((edu, index) => (
                      <div key={index} className={styles.workHistoryItem}>
                        <p className={styles.workRole}>
                          <span className={styles.workCompany}>
                            {edu.school || "Institution"}
                          </span>
                          <span className={styles.workPosition}>
                            · {edu.degree || "Degree"}
                          </span>
                        </p>
                        <p className={styles.workYears}>{edu.fieldOfStudy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.activitySection}>
                <h3>Recent Activity</h3>
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div
                        className={styles.card}
                        onClick={() => router.push(`/?postId=${post._id}`)} // Or '/dashboard?postId=' depending on your route
                      >
                        {post.media && (
                          <div className={styles.card_profileContainer}>
                            <img
                              src={`${BASE_URL}/${post.media}`}
                              alt="Post attachment"
                              className={styles.card_profile}
                            />
                          </div>
                        )}

                        {post.body && (
                          <p className={styles.postContent}>{post.body}</p>
                        )}

                        <div className={styles.activityMeta}>
                          <span>{timeAgo(post.createdAt)}</span>
                          <span>·</span>
                          <span>
                            {Array.isArray(post.likes)
                              ? post.likes.length
                              : post.likes || 0}{" "}
                            likes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noActivity}>No recent activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Window */}
        {isAddEduOpen && (
          <div
            className={styles.modalBackdrop}
            onClick={() => setIsAddEduOpen(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Add Education</h3>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setIsAddEduOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    School / Institution
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const { username } = context.params;
  try {
    const request = await clientServer.get(`/get_user_by_username`, {
      params: { username },
    });
    return { props: { userProfile: request.data.profile } };
  } catch (error) {
    return { notFound: true };
  }
}
