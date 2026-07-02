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
export default function viewProfileComponent({ userProfile }) {
  const searchParams = useSearchParams();

  const router = useRouter();
  const dispatch = useDispatch();
  const postReducer = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);
  const [userPosts, setUserPosts] = useState([]);
  const [currentUserInConnection, setCurrentUserInConnection] = useState(false);
  const [isAddEduOpen, setIsAddEduOpen] = useState(false);

  console.log("userProfile", userProfile);

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

  const [isConnectionNull, setIsConnectionNull] = useState(true);
  useEffect(() => {
    let userPosts = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(userPosts);
  }, [postReducer.posts]);

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
  }, [authState.connections, authState.connectionRequests]);
  useEffect(() => {
    getUserPosts();
    setCurrentUserInConnection(false);
    setIsConnectionNull(true);
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              className={styles.backDrop}
            />
          </div>
          <div className={styles.profileContainer_details}>
            <div className={styles.profileBody}>
              <div className={styles.leftCol}>
                <div className={styles.nameRow}>
                  <h2>{userProfile.userId.name}</h2>
                  <p className={styles.username}>
                    @{userProfile.userId.username}
                  </p>
                </div>
                {/* headline right here */}
                {userProfile.currentPosition && (
                  <p className={styles.headline}>
                    {userProfile.currentPosition}
                  </p>
                )}
                {authState.user?.userId?._id !== userProfile.userId._id && (
                  <>
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
                    style={{ width: "1.5rem" }}
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  Download Profile
                </div>

                <p className={styles.bio}>{userProfile.bio}</p>

                <div className={styles.workHistory}>
                  <h4>Work History</h4>
                  <div className={styles.workHistoryContent}>
                    {userProfile.pastWork.map((work, index) => (
                      <div key={index} className={styles.workHistoryItem}>
                        <p className={styles.workRole}>
                          {work.company} · {work.position}
                        </p>
                        <p className={styles.workYears}>{work.years}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.workHistory}>
                  <h4>Education</h4>
                  <div className={styles.workHistoryContent}>
                    {(userProfile.education || []).map((edu, index) => (
                      <div key={index} className={styles.workHistoryItem}>
                        <p className={styles.workRole}>
                          {edu.school || "Institution"} ·{" "}
                          {edu.degree || "Degree"}
                        </p>
                        <p className={styles.workYears}>{edu.fieldOfStudy}</p>
                      </div>
                    ))}
                  </div>

                  {isAddEduOpen && (
                    <div
                      className={styles.modalBackdrop}
                      onClick={() => setIsAddEduOpen(false)}
                    >
                      <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.modalHeader}>
                          <h3>Add Education</h3>
                          <button
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
                </div>
              </div>
              <div className={styles.activitySection}>
                <h3>Recent Activity</h3>
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        {post.media ? (
                          <div className={styles.card_profileContainer}>
                            <img
                              src={`${BASE_URL}/${post.media}`}
                              className={styles.card_profile}
                            />
                          </div>
                        ) : (
                          <p className={styles.postContent}>{post.body}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No recent activity.</p>
                )}
              </div>
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
