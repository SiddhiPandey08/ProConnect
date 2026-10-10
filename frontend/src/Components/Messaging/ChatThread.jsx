import React, { useEffect, useRef } from "react";
import { BASE_URL } from "@/config/index.jsx";
import { PostSkeleton } from "../Skeleton/postSkeleton";
import Composer from "./Composer";
import MessageBubble from "./MessageBubble";
import styles from "./styles.module.css";

const avatarUrl = (user) =>
  user?.profilePicture
    ? `${BASE_URL}/${user.profilePicture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "User",
      )}&background=0a66c2&color=fff&size=80`;

const sameDay = (first, second) =>
  first &&
  second &&
  new Date(first).toDateString() === new Date(second).toDateString();

const dayLabel = (date) => {
  const value = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (value.toDateString() === today.toDateString()) return "Today";
  if (value.toDateString() === yesterday.toDateString()) return "Yesterday";
  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ChatThread({
  user,
  messages,
  loading,
  loadingOlder,
  hasMore,
  online,
  typing,
  sending,
  onSend,
  onRetry,
  onLoadOlder,
  onBack,
  currentUserId,
  socketClient,
}) {
  const listRef = useRef(null);
  const shouldScroll = useRef(true);

  useEffect(() => {
    if (shouldScroll.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      shouldScroll.current = false;
    }
  }, [messages.length, user?._id]);

  useEffect(() => {
    shouldScroll.current = true;
  }, [user?._id]);

  const handleScroll = () => {
    if (listRef.current?.scrollTop < 60 && hasMore && !loadingOlder) {
      onLoadOlder(listRef.current.scrollHeight);
    }
  };

  if (!user) {
    return <div className={styles.noThread}>Select a conversation to begin.</div>;
  }

  return (
    <section className={styles.thread}>
      <header className={styles.threadHeader}>
        <button className={styles.backButton} onClick={onBack}>
          ←
        </button>
        <img src={avatarUrl(user)} alt={user.name} />
        <div>
          <h2>{user.name}</h2>
          <span>{typing ? "Typing..." : online ? "Online" : "Offline"}</span>
        </div>
      </header>
      <div className={styles.messageList} ref={listRef} onScroll={handleScroll}>
        {loading ? (
          <PostSkeleton />
        ) : (
          <>
            {loadingOlder && <span className={styles.loadingOlder}>Loading...</span>}
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const next = messages[index + 1];
              const senderId = message.sender?._id || message.sender;
              const previousSenderId = previous?.sender?._id || previous?.sender;
              const nextSenderId = next?.sender?._id || next?.sender;
              const groupedWithNext =
                next &&
                String(senderId) === String(nextSenderId) &&
                sameDay(message.createdAt, next.createdAt);
              const showDaySeparator =
                !previous || !sameDay(previous.createdAt, message.createdAt);

              return (
                <React.Fragment key={message._id || message.clientId}>
                  {showDaySeparator && message.createdAt && (
                    <div className={styles.daySeparator}>{dayLabel(message.createdAt)}</div>
                  )}
                  <MessageBubble
                    message={message}
                    isMine={String(senderId) === String(currentUserId)}
                    status={sending[message.clientId]}
                    showTime={!groupedWithNext}
                    grouped={
                      Boolean(previous) &&
                      String(senderId) === String(previousSenderId) &&
                      sameDay(previous.createdAt, message.createdAt)
                    }
                    onRetry={() => onRetry(message)}
                  />
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>
      <Composer
        userId={user._id}
        onSend={onSend}
        disabled={loading}
        socketClient={socketClient}
      />
    </section>
  );
}
