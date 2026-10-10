import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import UserLayout from "@/layouts";
import DashboardLayout from "@/layouts/DashboardLayout";
import { createSocket } from "@/config/socket";
import { showToast } from "@/config/redux/reducer/toastReducer";
import {
  addIncomingMessage,
  addOptimisticMessage,
  setConversationRead,
  setUserOnline,
  setUserTyping,
} from "@/config/redux/reducer/messageReducer";
import {
  fetchConversations,
  fetchMessages,
  markMessagesRead,
  sendMessage,
} from "@/config/redux/action/messageAction";
import ConversationList from "@/Components/Messaging/ConversationList";
import ChatThread from "@/Components/Messaging/ChatThread";
import styles from "./styles.module.css";

const currentUserId = (user) => user?.userId?._id || user?.userId || user?._id;

export default function MessagesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const messageState = useSelector((state) => state.messages);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [socketClient] = useState(() =>
    typeof window === "undefined"
      ? null
      : createSocket(localStorage.getItem("token")),
  );
  const queryUserId =
    typeof router.query.user === "string" ? router.query.user : null;
  const activeUserId = selectedUserId || queryUserId;
  const mobileThread = Boolean(activeUserId);
  const activeUserRef = React.useRef(activeUserId);
  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    activeUserRef.current = activeUserId;
  }, [activeUserId]);

  const activeConversation = useMemo(
    () =>
      messageState.conversations.find(
        (conversation) => conversation.user?._id === activeUserId,
      ),
    [activeUserId, messageState.conversations],
  );

  const activeUser = useMemo(() => {
    if (activeConversation?.user) return activeConversation.user;
    if (!activeUserId) return null;

    const knownUsers = [
      ...authState.all_users.map((item) => item.userId || item),
      ...authState.connections.flatMap((connection) => [
        connection.fromUserId,
        connection.toUserId,
      ]),
      ...authState.connectionRequests.flatMap((connection) => [
        connection.fromUserId,
        connection.toUserId,
      ]),
    ];

    return (
      knownUsers.find((user) => String(user?._id) === String(activeUserId)) || {
        _id: activeUserId,
        name: "New conversation",
      }
    );
  }, [
    activeConversation,
    activeUserId,
    authState.all_users,
    authState.connections,
    authState.connectionRequests,
  ]);

  useEffect(() => {
    dispatch(fetchConversations());
    const authenticatedSocket = socketClient;
    if (!authenticatedSocket) return undefined;

    authenticatedSocket.on("new_message", (message) => {
      const senderId = message.sender?._id || message.sender;
      dispatch(addIncomingMessage({ userId: senderId, message }));
      dispatch(fetchConversations());
      if (senderId === activeUserRef.current) {
        dispatch(markMessagesRead(senderId));
        dispatch(setConversationRead(senderId));
      } else {
        dispatch(
          showToast({
            message: `New message from ${message.sender?.name || "a connection"}`,
            type: "info",
          }),
        );
      }
    });

    authenticatedSocket.on("presence", (presence) => {
      dispatch(setUserOnline(presence));
    });

    const typingTimers = {};
    authenticatedSocket.on("typing", ({ userId }) => {
      dispatch(setUserTyping({ userId, typing: true }));
      clearTimeout(typingTimers[userId]);
      typingTimers[userId] = setTimeout(
        () => dispatch(setUserTyping({ userId, typing: false })),
        1200,
      );
    });

    authenticatedSocket.connect();
    return () => {
      Object.values(typingTimers).forEach(clearTimeout);
      authenticatedSocket.disconnect();
      authenticatedSocket.removeAllListeners();
    };
  }, [dispatch, socketClient]);

  useEffect(() => {
    if (activeUserId) {
      dispatch(fetchMessages({ userId: activeUserId }));
      dispatch(markMessagesRead(activeUserId));
      dispatch(setConversationRead(activeUserId));
    }
  }, [activeUserId, dispatch]);

  const selectConversation = (userId) => {
    setSelectedUserId(userId);
    router.replace({ pathname: "/messages", query: { user: userId } }, undefined, {
      shallow: true,
    });
  };

  const send = (content, retryMessage) => {
    const userId = activeUserId;
    const clientId =
      retryMessage?.clientId ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (!retryMessage) {
      dispatch(
        addOptimisticMessage({
          userId,
          message: {
            clientId,
            content,
            sender: currentUserId(authState.user),
            receiver: userId,
            createdAt: new Date().toISOString(),
          },
        }),
      );
    }
    dispatch(
      sendMessage({
        userId,
        content: retryMessage?.content || content,
        clientId,
      }),
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        dispatch(fetchConversations());
      }
    });
  };

  const loadOlder = async (previousHeight) => {
    setLoadingOlder(true);
    try {
      const result = await dispatch(
        fetchMessages({
          userId: activeUserId,
          cursor: messageState.nextCursors[activeUserId],
        }),
      );
      if (result.meta.requestStatus === "fulfilled") {
        requestAnimationFrame(() => {
          const element = document.querySelector(`.${styles.messageList}`);
          if (element) element.scrollTop = element.scrollHeight - previousHeight;
        });
      }
    } finally {
      setLoadingOlder(false);
    }
  };

  return (
    <UserLayout>
      <DashboardLayout hideRightSidebar>
        <main className={styles.page}>
          <section
            className={`${styles.sidebar} ${
              mobileThread ? styles.mobileHidden : ""
            }`}
          >
            <h1>Messages</h1>
            <div className={styles.conversationPane}>
              <ConversationList
                conversations={messageState.conversations}
                activeUserId={activeUserId}
                loading={messageState.loadingConversations}
                onlineUsers={messageState.onlineUsers}
                onSelect={selectConversation}
              />
            </div>
          </section>
          <div
            className={`${styles.threadPanel} ${
              !mobileThread ? styles.mobileHidden : ""
            }`}
          >
            <ChatThread
              user={activeUser}
              messages={messageState.messagesByUser[activeUserId] || []}
              loading={Boolean(messageState.loadingMessages[activeUserId])}
              loadingOlder={loadingOlder}
              hasMore={Boolean(messageState.hasMore[activeUserId])}
              online={Boolean(messageState.onlineUsers[activeUserId])}
              typing={Boolean(messageState.typingUsers[activeUserId])}
              sending={messageState.sending}
              currentUserId={currentUserId(authState.user)}
              onBack={() => {
                setSelectedUserId(null);
                router.replace("/messages", undefined, { shallow: true });
              }}
              onLoadOlder={loadOlder}
              onSend={(content) => send(content)}
              onRetry={(message) => send(message.content, message)}
              socketClient={socketClient}
            />
          </div>
        </main>
      </DashboardLayout>
    </UserLayout>
  );
}
