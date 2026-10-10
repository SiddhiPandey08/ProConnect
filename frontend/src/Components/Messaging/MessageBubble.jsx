import React from "react";
import styles from "./styles.module.css";

export default function MessageBubble({
  message,
  isMine,
  status,
  onRetry,
  showTime = true,
  grouped = false,
}) {
  const createdAt = message.createdAt ? new Date(message.createdAt) : null;

  return (
    <div
      className={`${styles.messageRow} ${isMine ? styles.mine : ""} ${
        grouped ? styles.groupedMessage : ""
      }`}
    >
      <div
        className={`${styles.messageBubble} ${
          status === "failed" ? styles.failedMessage : ""
        }`}
      >
        <p>{message.content}</p>
        <span className={styles.messageMeta}>
          {showTime &&
            createdAt?.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          {isMine && status === "pending" && "Sending…"}
          {isMine && status === "failed" && (
            <button
              type="button"
              onClick={onRetry}
              className={styles.retryButton}
            >
              Retry
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
