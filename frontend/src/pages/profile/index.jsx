import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clientServer } from "@/config/index.jsx";
import UserLayout from "@/layouts";
import DashboardLayout from "@/layouts/DashboardLayout";
import styles from "./index.module.css";
import { BASE_URL } from "@/config/index.jsx";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction/index.js";
import { showToast } from "@/config/redux/reducer/toastReducer";
import { getAboutUser } from "@/config/redux/action/authAction/index.js";

export default function ProfilPageComponent() {
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.posts);

  const dispatch = useDispatch();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [isAddEduOpen, setIsAddEduOpen] = useState(false);
  const [newEdu, setNewEdu] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
  });

  const [newWork, setNewWork] = useState({
    company: "",
    position: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    current: false,
  });
  const handleAddWork = async () => {
    if (!newWork.company || !newWork.position) return;

    const updatedPastWork = [
      ...userProfile.pastWork,
      {
        company: newWork.company,
        position: newWork.position,
        startMonth: newWork.startMonth,
        startYear: Number(newWork.startYear),
        endMonth: newWork.endMonth,
        endYear: Number(newWork.endYear) || null,
        current: newWork.current,
      },
    ].sort((a, b) => {
      // current jobs first, then by startYear desc, then startMonth desc
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      if (b.startYear !== a.startYear)
        return (b.startYear || 0) - (a.startYear || 0);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.indexOf(b.startMonth) - months.indexOf(a.startMonth);
    });

    setUserProfile({ ...userProfile, pastWork: updatedPastWork });

    try {
      await clientServer.post(`/update_profile_data`, {
        token: localStorage.getItem("token"),
        name: userProfile.userId.name,
        bio: userProfile.bio,
        pastWork: updatedPastWork,
        currentPosition: userProfile.currentPosition,
        education: userProfile.education,
      });
      await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      dispatch(
        showToast({ message: "Work experience added", type: "success" }),
      );
    } catch (err) {
      console.error("Failed to save work entry:", err);
      dispatch(
        showToast({ message: "Failed to add work experience", type: "error" }),
      );
    }

    setNewWork({
      company: "",
      position: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      current: false,
    });
    setIsAddWorkOpen(false);
  };
  const handleAddEdu = async () => {
    if (!newEdu.school && !newEdu.degree) return;

    const updatedEducation = [
      ...(userProfile.education || []),
      {
        school: newEdu.school,
        degree: newEdu.degree,
        fieldOfStudy: newEdu.fieldOfStudy,
      },
    ];

    setUserProfile({ ...userProfile, education: updatedEducation });

    try {
      await clientServer.post(`/update_profile_data`, {
        token: localStorage.getItem("token"),
        name: userProfile.userId.name,
        bio: userProfile.bio,
        pastWork: userProfile.pastWork,
        currentPosition: userProfile.currentPosition,
        education: updatedEducation,
      });
      await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      dispatch(showToast({ message: "Education added", type: "success" }));
    } catch (err) {
      dispatch(
        showToast({ message: "Failed to add education", type: "error" }),
      );
      console.error("Failed to save education:", err);
    }

    setNewEdu({ school: "", degree: "", fieldOfStudy: "" });
    setIsAddEduOpen(false);
  };

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());
  }, []);
  useEffect(() => {
    if (!authState.user) return;

    // only update if something actually changed
    if (JSON.stringify(authState.user) !== JSON.stringify(userProfile)) {
      setUserProfile(authState.user);
    }

    if (authState.user.userId) {
      const posts = postReducer.posts.filter(
        (post) => post.userId?.username === authState.user.userId.username,
      );
      setUserPosts(posts);
    }
  }, [authState.user, postReducer.posts]);

  const updateProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("token", localStorage.getItem("token"));
    try {
      const response = await clientServer.post(
        `/upload_profile_picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      dispatch(
        showToast({ message: "Profile picture updated", type: "success" }),
      );
    } catch (error) {
      dispatch(showToast({ message: "Something went wrong", type: "error" }));

      console.error("Error updating profile image:", error);
    }
  };

  const updateProfileData = async () => {
    try {
      await clientServer.post(`/update_profile`, {
        token: localStorage.getItem("token"),
        username: userProfile.userId.username,
        email: userProfile.userId.email,
      });

      await clientServer.post(`/update_profile_data`, {
        token: localStorage.getItem("token"),
        name: userProfile.userId.name,
        bio: userProfile.bio,
        pastWork: userProfile.pastWork,
        currentPosition: userProfile.currentPosition,
        education: userProfile.education,
      });

      // Wait for the dispatch to complete before updating local state
      const result = await dispatch(
        getAboutUser({ token: localStorage.getItem("token") }),
      );

      // Directly update local state from the fresh response
      if (result?.payload?.user) {
        setUserProfile(result.payload.user);
      }
      dispatch(
        showToast({ message: "Profile updated successfully", type: "success" }),
      );
    } catch (error) {
      dispatch(
        showToast({ message: "Failed to update profile", type: "error" }),
      );
      console.error("Error updating profile data:", error);
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile.userId && (
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <label
                htmlFor="profile-image"
                className={styles.backDrop_overlay}
              >
                <p>Edit Profile Image</p>
              </label>
              <input
                hidden
                type="file"
                id="profile-image"
                style={{ display: "none" }}
                onChange={(e) => updateProfileImage(e.target.files[0])}
              />
              <img
                src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                className={styles.backDrop}
              />
            </div>
            <div className={styles.profileContainer_details}>
              <div className={styles.profileBody}>
                <div className={styles.leftCol}>
                  <div className={styles.nameRow}>
                    <input
                      className={styles.nameEdit}
                      type="text"
                      value={userProfile.userId.name}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          userId: {
                            ...userProfile.userId,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                    <p style={{ color: "gray" }}>
                      @{userProfile.userId.username}
                    </p>
                  </div>
                  <textarea
                    style={{ width: "100%", resize: "none" }}
                    className={styles.headlineEdit}
                    type="text"
                    value={userProfile.currentPosition || ""}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        currentPosition: e.target.value,
                      })
                    }
                  />
                  <textarea
                    className={styles.bioEdit}
                    value={userProfile.bio || ""}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        bio: e.target.value,
                      })
                    }
                    style={{ width: "100%", resize: "none" }}
                    rows={Math.max(
                      3,
                      Math.ceil((userProfile.bio || "").length / 80),
                    )}
                  />{" "}
                  {userProfile != authState.user && (
                    <div
                      onClick={() => {
                        updateProfileData();
                      }}
                      className={styles.updateProfileButton}
                    >
                      Update Profile
                    </div>
                  )}
                  <div className={styles.workHistory}>
                    <h4>Work History</h4>
                    <div className={styles.workHistoryContent}>
                      {(userProfile.pastWork || []).map((work, index) => (
                        <div key={index} className={styles.workHistoryItem}>
                          <p className={styles.workRole}>
                            {work.company} · {work.position}
                          </p>
                          <p className={styles.workYears}>
                            {work.startMonth && work.startYear
                              ? `${work.startMonth} ${work.startYear} – ${
                                  work.current
                                    ? "Present"
                                    : work.endMonth && work.endYear
                                      ? `${work.endMonth} ${work.endYear}`
                                      : "—"
                                }`
                              : work.years
                                ? `${work.years} year${work.years !== 1 ? "s" : ""}`
                                : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      className={styles.addWorkButton}
                      onClick={() => setIsAddWorkOpen(true)}
                    >
                      + Add Work
                    </button>
                    {/* Add Work Modal — place just before closing </div> of container */}
                    {isAddWorkOpen && (
                      <div
                        className={styles.modalBackdrop}
                        onClick={() => setIsAddWorkOpen(false)}
                      >
                        <div
                          className={styles.modal}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={styles.modalHeader}>
                            <h3>Add Work Experience</h3>
                            <button
                              className={styles.modalClose}
                              onClick={() => setIsAddWorkOpen(false)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6"
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
                                Company
                              </label>
                              <input
                                className={styles.fieldInput}
                                type="text"
                                value={newWork.company}
                                onChange={(e) =>
                                  setNewWork({
                                    ...newWork,
                                    company: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>
                                Position
                              </label>
                              <input
                                className={styles.fieldInput}
                                type="text"
                                value={newWork.position}
                                onChange={(e) =>
                                  setNewWork({
                                    ...newWork,
                                    position: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>
                                Start Date
                              </label>
                              <div className={styles.dateRow}>
                                <select
                                  className={styles.fieldInput}
                                  value={newWork.startMonth}
                                  onChange={(e) =>
                                    setNewWork({
                                      ...newWork,
                                      startMonth: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">Month</option>
                                  {[
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec",
                                  ].map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  className={styles.fieldInput}
                                  type="number"
                                  placeholder="Year"
                                  min="1980"
                                  max={new Date().getFullYear()}
                                  value={newWork.startYear}
                                  onChange={(e) =>
                                    setNewWork({
                                      ...newWork,
                                      startYear: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>
                                End Date
                              </label>
                              <div className={styles.dateRow}>
                                <select
                                  className={styles.fieldInput}
                                  value={newWork.endMonth}
                                  disabled={newWork.current}
                                  onChange={(e) =>
                                    setNewWork({
                                      ...newWork,
                                      endMonth: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">Month</option>
                                  {[
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec",
                                  ].map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  className={styles.fieldInput}
                                  type="number"
                                  placeholder="Year"
                                  min="1980"
                                  max={new Date().getFullYear() + 1}
                                  value={newWork.endYear}
                                  disabled={newWork.current}
                                  onChange={(e) =>
                                    setNewWork({
                                      ...newWork,
                                      endYear: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <label className={styles.currentLabel}>
                                <input
                                  type="checkbox"
                                  checked={newWork.current}
                                  onChange={(e) =>
                                    setNewWork({
                                      ...newWork,
                                      current: e.target.checked,
                                      endMonth: "",
                                      endYear: "",
                                    })
                                  }
                                />
                                I currently work here
                              </label>
                            </div>
                          </div>

                          <div className={styles.modalFooter}>
                            <button
                              className={styles.cancelBtn}
                              onClick={() => setIsAddWorkOpen(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className={styles.saveBtn}
                              onClick={handleAddWork}
                              disabled={!newWork.company || !newWork.position}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                    <button
                      className={styles.addWorkButton}
                      onClick={() => setIsAddEduOpen(true)}
                    >
                      + Add Education
                    </button>{" "}
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
                              <input
                                className={styles.fieldInput}
                                type="text"
                                placeholder="e.g. MIT"
                                value={newEdu.school}
                                onChange={(e) =>
                                  setNewEdu({
                                    ...newEdu,
                                    school: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>
                                Degree
                              </label>
                              <input
                                className={styles.fieldInput}
                                type="text"
                                placeholder="e.g. B.Tech"
                                value={newEdu.degree}
                                onChange={(e) =>
                                  setNewEdu({
                                    ...newEdu,
                                    degree: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>
                                Field of Study
                              </label>
                              <input
                                className={styles.fieldInput}
                                type="text"
                                placeholder="e.g. Computer Engineering"
                                value={newEdu.fieldOfStudy}
                                onChange={(e) =>
                                  setNewEdu({
                                    ...newEdu,
                                    fieldOfStudy: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className={styles.modalFooter}>
                            <button
                              className={styles.cancelBtn}
                              onClick={() => setIsAddEduOpen(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className={styles.saveBtn}
                              onClick={handleAddEdu}
                              disabled={!newEdu.school && !newEdu.degree}
                            >
                              Save
                            </button>
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
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
