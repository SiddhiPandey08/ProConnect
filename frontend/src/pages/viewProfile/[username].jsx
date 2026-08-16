import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clientServer } from "@/config/index.jsx";
import UserLayout from "@/layouts";
import DashboardLayout from "@/layouts/DashboardLayout";
import styles from "./styles.module.css";
import { BASE_URL } from "@/config/index.jsx";
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
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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

function MutualConnections({ myConnections, theirConnections, myUserId }) {
  if (!myConnections || !theirConnections || !myUserId) return null;

  const extractOtherId = (conn, selfId) =>
    String(conn.fromUserId?._id) === String(selfId)
      ? conn.toUserId
      : conn.fromUserId;

  const myIds = new Set(
    myConnections
      .filter((c) => c.status_accepted === true)
      .map((c) => String(extractOtherId(c, myUserId)?._id)),
  );

  const mutuals = theirConnections
    .filter((c) => c.status_accepted === true)
    .map((c) => extractOtherId(c, myUserId))
    .filter((user) => user && myIds.has(String(user._id)));

  if (mutuals.length === 0) return null;

  const names = mutuals
    .slice(0, 2)
    .map((u) => u.name)
    .join(", ");
  const extra =
    mutuals.length > 2
      ? ` and ${mutuals.length - 2} other${mutuals.length - 2 > 1 ? "s" : ""}`
      : "";

  return (
    <p className={styles.mutualText}>
      Connected with {names}
      {extra}
    </p>
  );
}

export default function ViewProfileComponent({ userProfile }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const postReducer = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [currentUserInConnection, setCurrentUserInConnection] = useState(false);
  const [isAddEduOpen, setIsAddEduOpen] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [showStickyBar, setShowStickyBar] = useState(false);

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
    let filtered = postReducer.posts.filter(
      (post) => post.userId.username === router.query.username,
    );
    setUserPosts(filtered);
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

  useEffect(() => {
    getUserPosts();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 280);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleConnect = () => {
    dispatch(
      sendConnectionRequest({
        token: localStorage.getItem("token"),
        userId: userProfile.userId._id,
      }),
    ).then(() => {
      dispatch(
        showToast({ message: "Connection request sent", type: "success" }),
      );
    });
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {/* Sticky identity bar */}
        <div
          className={`${styles.stickyBar} ${
            showStickyBar ? styles.stickyBarVisible : ""
          }`}
        >
          <img
            src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
            className={styles.stickyAvatar}
            alt={userProfile.userId.name}
          />
          <span className={styles.stickyName}>{userProfile.userId.name}</span>
          {authState.user?.userId?._id !== userProfile.userId._id &&
            !currentUserInConnection && (
              <button
                className={styles.stickyConnectBtn}
                onClick={handleConnect}
              >
                Connect
              </button>
            )}
        </div>

        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              className={styles.backDrop}
              alt={userProfile.userId.name}
            />
          </div>

          <div className={styles.profileContainer_details}>
            <div className={styles.profileHeader}>
              <div className={styles.nameRow}>
                <h2>{userProfile.userId.name}</h2>
                <p className={styles.username}>
                  @{userProfile.userId.username}
                </p>
              </div>

              {userProfile.currentPosition && (
                <p className={styles.headline}>{userProfile.currentPosition}</p>
              )}

              {authState.user?.userId?._id !== userProfile.userId._id && (
                <div>
                  {currentUserInConnection ? (
                    <button
                      className={
                        isConnectionNull
                          ? styles.pendingBtn
                          : styles.connectedBtn
                      }
                    >
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      className={styles.connectBtn}
                      onClick={handleConnect}
                    >
                      Connect
                    </button>
                  )}
                </div>
              )}

              <MutualConnections
                myConnections={authState.myConnections}
                theirConnections={authState.connections}
                myUserId={authState.user?.userId?._id}
              />

              <div
                onClick={async () => {
                  const res = await clientServer.get(
                    `/download_resume?id=${userProfile._id}`,
                  );
                  window.open(`${BASE_URL}/${res.data.message}`, "_blank");
                }}
                className={styles.downloadResume}
              >
                <svg
                  style={{ width: "1.25rem" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                Download Profile
              </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabRow}>
              {["about", "experience", "activity"].map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${
                    activeTab === tab ? styles.tabBtnActive : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "about"
                    ? "About"
                    : tab === "experience"
                      ? "Experience"
                      : "Activity"}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className={styles.tabContent}>
              {activeTab === "about" && (
                <div key="about" className={styles.tabPanel}>
                  {userProfile.bio ? (
                    <TruncatedBio text={userProfile.bio} />
                  ) : (
                    <p className={styles.emptyText}>No bio added yet.</p>
                  )}
                </div>
              )}

              {activeTab === "experience" && (
                <div key="experience" className={styles.tabPanel}>
                  <div className={styles.workHistory}>
                    <h4>Work History</h4>
                    <div className={styles.workHistoryContent}>
                      {userProfile.pastWork?.length > 0 ? (
                        userProfile.pastWork.map((work, index) => (
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
                        ))
                      ) : (
                        <p className={styles.emptyText}>
                          No work history available.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={styles.workHistory}>
                    <h4>Education</h4>
                    <div className={styles.workHistoryContent}>
                      {userProfile.education?.length > 0 ? (
                        userProfile.education.map((edu, index) => (
                          <div key={index} className={styles.workHistoryItem}>
                            <p className={styles.workRole}>
                              <span className={styles.workCompany}>
                                {edu.school || "Institution"}
                              </span>
                              <span className={styles.workPosition}>
                                {" "}
                                · {edu.degree || "Degree"}
                              </span>
                            </p>
                            <p className={styles.workYears}>
                              {edu.fieldOfStudy}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className={styles.emptyText}>No education listed.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div key="activity" className={styles.tabPanel}>
                  {userPosts.length > 0 ? (
                    <div className={styles.activityGrid}>
                      {userPosts.map((post) => (
                        <div
                          key={post._id}
                          className={styles.postCard}
                          onClick={() => router.push(`/post/${post._id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {post.media && (
                            <div className={styles.cardMediaContainer}>
                              <img
                                src={`${BASE_URL}/${post.media}`}
                                className={styles.cardMedia}
                                alt="Post attachment"
                              />
                            </div>
                          )}

                          {post.body && (
                            <p className={styles.postBodyTruncated}>
                              {post.body}
                            </p>
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
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptyText}>No recent activity yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
