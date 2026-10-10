import React from "react";
import { BASE_URL } from "@/config/index.jsx";
import { PostSkeleton } from "../Skeleton/postSkeleton";
import styles from "./styles.module.css";

const avatarUrl = (user) =>
  user?.profilePicture
    ? `${BASE_URL}/${user.profilePicture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "User",
      )}&background=0a66c2&color=fff&size=80`;

export default function ConversationList({
  conversations,
  activeUserId,
  loading,
  onlineUsers,
  onSelect,
}) {
  if (loading) {
    return (
      <div className={styles.conversationList}>
        {[1, 2, 3].map((item) => (
          <PostSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return <div className={styles.emptyList}>No conversations yet.</div>;
  }

  return (
    <div className={styles.conversationList}>
      {conversations.map((conversation) => {
        const user = conversation.user;
        return (
          <button
            key={user._id}
            className={`${styles.conversation} ${
              activeUserId === user._id ? styles.activeConversation : ""
            }`}
            onClick={() => onSelect(user._id)}
          >
            <span className={styles.avatarWrap}>
              <img src={avatarUrl(user)} alt={user.name} />
              {onlineUsers[user._id] && <span className={styles.onlineDot} />}
            </span>
            <span className={styles.conversationCopy}>
              <span className={styles.conversationTop}>
                <strong>{user.name}</strong>
                <span className={styles.conversationMeta}>
                  <time dateTime={conversation.latestMessage?.createdAt}>
                    {conversation.latestMessage?.createdAt &&
                      new Date(conversation.latestMessage.createdAt).toLocaleTimeString(
                        [],
                        { hour: "numeric", minute: "2-digit" },
                      )}
                  </time>
                  {conversation.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      {conversation.unreadCount}
                    </span>
                  )}
                </span>
              </span>
              <span className={styles.preview}>
                {conversation.latestMessage?.content}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
