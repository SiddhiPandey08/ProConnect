import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

export default function Composer({ userId, onSend, disabled, socketClient }) {
  const [content, setContent] = useState("");
  const typingTimeout = useRef(null);

  useEffect(
    () => () => clearTimeout(typingTimeout.current),
    [],
  );

  const handleChange = (event) => {
    const value = event.target.value;
    setContent(value);
    if (!userId || !socketClient?.connected) return;

    socketClient.emit("typing", { receiverId: userId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketClient.emit("typing", { receiverId: userId, typing: false });
    }, 700);
  };

  const submit = (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setContent("");
  };

  return (
    <form className={styles.composer} onSubmit={submit}>
      <textarea
        value={content}
        onChange={handleChange}
        maxLength={2000}
        rows={1}
        placeholder="Write a message..."
        disabled={disabled}
        aria-label="Message"
      />
      <button type="submit" disabled={disabled || !content.trim()}>
        Send
      </button>
    </form>
  );
}
