import styles from "./styles.module.css";

export function PostSkeleton() {
  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
        <div className={`${styles.shimmer} ${styles.avatar}`} />
        <div className={styles.userInfo}>
          <div
            className={`${styles.shimmer} ${styles.line} ${styles.nameLine}`}
          />
          <div
            className={`${styles.shimmer} ${styles.line} ${styles.usernameLine}`}
          />
        </div>
      </div>
      <div className={styles.postBody}>
        <div
          className={`${styles.shimmer} ${styles.line} ${styles.fullLine}`}
        />
        <div
          className={`${styles.shimmer} ${styles.line} ${styles.fullLine}`}
        />
        <div
          className={`${styles.shimmer} ${styles.line} ${styles.halfLine}`}
        />
      </div>
      <div className={styles.postFooter}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${styles.shimmer} ${styles.actionBtn}`} />
        ))}
      </div>
    </div>
  );
}

export function CreatePostSkeleton() {
  return (
    <div className={styles.createCard}>
      <div className={`${styles.shimmer} ${styles.avatar}`} />
      <div className={`${styles.shimmer} ${styles.createInput}`} />
      <div className={`${styles.shimmer} ${styles.fabSkeleton}`} />
    </div>
  );
}
