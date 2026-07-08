import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  getAllPosts,
  createPost,
  deletePost,
  likePost,
  getAllComments,
  createComment,
  updatePost,
} from "@/config/redux/action/postAction/index.js";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser } from "@/config/redux/action/authAction/index.js";
import UserLayout from "@/layouts";
import DashboardLayout from "@/layouts/DashboardLayout";
import styles from "./index.module.css";
import { BASE_URL } from "@/config/index.jsx";
import { resetPostId } from "@/config/redux/reducer/postReducer/index.js";
import { showToast } from "@/config/redux/reducer/toastReducer";
import {
  PostSkeleton,
  CreatePostSkeleton,
} from "@/Components/Skeleton/postSkeleton";

export default function dashboardComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (authState.isTokenPresent) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
  }, [authState.isTokenPresent]);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);

  const [commentContent, setCommentContent] = useState("");

  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleEditPost = async (postId) => {
    await dispatch(updatePost({ postId, body: editContent }));
    dispatch(showToast({ message: "Post updated", type: "success" }));

    await dispatch(getAllPosts());
    setEditingPostId(null);
    setEditContent("");
  };

  const postState = useSelector((state) => state.posts);
  const handlePost = async () => {
    await dispatch(
      createPost({
        file: fileContent,
        body: postContent,
      }),
    );

    await dispatch(getAllPosts());
    dispatch(
      showToast({ message: "Post shared successfully", type: "success" }),
    );

    setPostContent("");
    setFileContent(null);
  };
  const handleComment = async (postId) => {
    if (!commentContent.trim()) return;
    await dispatch(createComment({ postId, body: commentContent }));
    await dispatch(getAllComments(postId));
    setCommentContent("");
  };
  const sharePost = async (post) => {
    const shareUrl = `${window.location.origin}/post/${post._id}`;

    if (navigator.share) {
      await navigator.share({
        title: "ProConnect Post",
        text: post.body,
        url: shareUrl,
      });
    } else {
      const text = `${post.body} — shared from ProConnect`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, "_blank");
    }
  };
  if (authState.profileFetched && authState.user?.userId) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.homeComponent}>
            <h4>Create Post</h4>

            <div className={styles.createPostContainer}>
              <img
                className={styles.userProfileImage}
                width={100}
                src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
                alt="Profile"
              />

              <textarea
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Content"
                value={postContent}
              />
              <label htmlFor="file-upload" className={styles.customFileUpload}>
                <div className={styles.Fab}>
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
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
              </label>
              <input
                onChange={(e) => setFileContent(e.target.files[0])}
                hidden
                id="file-upload"
                type="file"
              />
              {postContent.length > 0 && (
                <button onClick={handlePost} className={styles.postButton}>
                  Post
                </button>
              )}
            </div>
            <h4>Posts</h4>

            <div className={styles.postsContainer}>
              {postState.isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : (
                Array.isArray(postState.posts) &&
                postState.posts
                  .filter((post) => post.userId) // drop posts with unpopulated/deleted user
                  .map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.postHeader}>
                        <img
                          className={styles.userProfileImage}
                          src={`${BASE_URL}/${post.userId.profilePicture}`}
                          alt=""
                        />

                        <div className={styles.userInfo}>
                          <div className={styles.name}>{post.userId.name}</div>

                          <div className={styles.username}>
                            @{post.userId.username}
                          </div>
                        </div>

                        {post.userId._id === authState.user.userId._id && (
                          <div className={styles.postActions}>
                            <div
                              className={styles.editButton}
                              onClick={() => {
                                if (editingPostId === post._id) {
                                  setEditingPostId(null);
                                } else {
                                  setEditingPostId(post._id);
                                  setEditContent(post.body);
                                }
                              }}
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
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                                />
                              </svg>
                            </div>
                            <div
                              className={styles.deleteButton}
                              onClick={async () => {
                                await dispatch(deletePost(post._id));
                                await dispatch(getAllPosts());
                                dispatch(
                                  showToast({
                                    message: "Post deleted",
                                    type: "info",
                                  }),
                                );
                              }}
                            >
                              <svg
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  color: "red",
                                }}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {editingPostId === post._id ? (
                        <div className={styles.editContainer}>
                          <textarea
                            className={styles.editTextarea}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                          <div className={styles.editActions}>
                            <button
                              className={styles.cancelEditBtn}
                              onClick={() => setEditingPostId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className={styles.saveEditBtn}
                              onClick={() => handleEditPost(post._id)}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={styles.postBody}>{post.body}</p>
                      )}
                      {post.media && (
                        <img
                          className={styles.postMedia}
                          src={`${BASE_URL}/${post.media}`}
                          alt=""
                        />
                      )}
                      <div className={styles.optionsContainer}>
                        <div
                          onClick={async () => {
                            await dispatch(likePost(post._id));
                          }}
                          className={styles.singleOption_optionsContainer}
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
                              d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                            />
                          </svg>
                          <p>{post.likes}</p>
                        </div>
                        <div
                          onClick={() => {
                            if (postState.postId === post._id) {
                              dispatch(resetPostId()); // close if already open
                            } else {
                              dispatch(getAllComments(post._id)); // open for this post
                            }
                          }}
                          className={styles.singleOption_optionsContainer}
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
                              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                            />
                          </svg>
                        </div>
                        <div className={styles.singleOption_optionsContainer}>
                          <svg
                            onClick={() => {
                              sharePost(post);
                            }}
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
                              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                            />
                          </svg>
                        </div>
                      </div>
                      {postState.postId === post._id && (
                        <div className={styles.commentsSection}>
                          <div className={styles.commentsList}>
                            {postState.comments.length === 0 ||
                            postState.comments.length === 0 ? (
                              <p
                                style={{
                                  fontSize: "13px",
                                  color: "#6b7280",
                                  margin: 0,
                                }}
                              >
                                No comments yet.
                              </p>
                            ) : (
                              Array.isArray(postState.comments) &&
                              postState.comments
                                .filter((comment) => comment.userId)
                                .map((comment) => (
                                  <div
                                    key={comment._id}
                                    className={styles.commentCard}
                                  >
                                    <img
                                      className={styles.commentAvatar}
                                      src={`${BASE_URL}/${comment.userId?.profilePicture}`}
                                      alt=""
                                    />
                                    <div className={styles.commentBody}>
                                      <span className={styles.commentName}>
                                        {comment.userId?.name}
                                      </span>
                                      <p className={styles.commentText}>
                                        {comment.body}
                                      </p>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>

                          <div className={styles.commentInputRow}>
                            <input
                              className={styles.commentInput}
                              type="text"
                              placeholder="Write a comment…"
                              value={commentContent}
                              onChange={(e) =>
                                setCommentContent(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleComment(post._id);
                              }}
                            />
                            <div
                              className={styles.commentSubmitBtn}
                              disabled={
                                !commentContent.trim() || postState.isLoading
                              }
                              onClick={() => handleComment(post._id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6"
                              >
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.homeComponent}>
            <h4>Create Post</h4>
            <CreatePostSkeleton />
            <h4>Posts</h4>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }
}
