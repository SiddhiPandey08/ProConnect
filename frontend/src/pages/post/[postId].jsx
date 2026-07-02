import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BASE_URL, clientServer } from "@/config/index.jsx";
import styles from "./styles.module.css";

const PostPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!postId) return;
    clientServer
      .get(`/get_post/${postId}`)
      .then((res) => {
        setPost(res.data.post);
      })
      .catch(() => {
        setNotFound(true);
      });
  }, [postId]);

  if (notFound) {
    return (
      <div className={styles.notFoundWrap}>
        <p className={styles.notFoundText}>This post couldn't be found.</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonAvatar} />
            <div style={{ flex: 1 }}>
              <div
                className={styles.skeletonLine}
                style={{ width: "40%", marginBottom: 8 }}
              />
              <div className={styles.skeletonLine} style={{ width: "25%" }} />
            </div>
          </div>
          <div
            className={styles.skeletonLine}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <div className={styles.skeletonLine} style={{ width: "80%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img
            src={
              post.userId.profilePicture
                ? `${BASE_URL}/${post.userId.profilePicture}`
                : `https://ui-avatars.com/api/?name=${post.userId.name}`
            }
            alt={post.userId.name}
            className={styles.avatar}
          />
          <div className={styles.headerText}>
            <span className={styles.name}>{post.userId.name}</span>
            <span className={styles.username}>@{post.userId.username}</span>
          </div>
        </div>

        <p className={styles.body}>{post.body}</p>

        {post.media && (
          <img
            src={`${BASE_URL}/${post.media}`}
            alt="Post media"
            className={styles.media}
          />
        )}

        <div className={styles.footer}>
          <span className={styles.badge}>ProConnect</span>
          <span>· Shared post</span>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
