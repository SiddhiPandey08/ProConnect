import { createSlice } from "@reduxjs/toolkit";
import {
  fetchConversations,
  fetchMessages,
  markMessagesRead,
  sendMessage,
} from "../../action/messageAction";

const initialState = {
  conversations: [],
  messagesByUser: {},
  loadingConversations: false,
  loadingMessages: {},
  sending: {},
  nextCursors: {},
  hasMore: {},
  onlineUsers: {},
  typingUsers: {},
  unreadTotal: 0,
  error: null,
};

const getMessageId = (message) => message._id || message.clientId;

const recalculateUnread = (conversations) =>
  conversations.reduce(
    (total, conversation) => total + (conversation.unreadCount || 0),
    0,
  );

const messageReducer = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addOptimisticMessage: (state, action) => {
      const { userId, message } = action.payload;
      state.messagesByUser[userId] = [
        ...(state.messagesByUser[userId] || []),
        message,
      ];
      state.sending[message.clientId] = "pending";
    },
    markMessageFailed: (state, action) => {
      state.sending[action.payload] = "failed";
    },
    replaceOptimisticMessage: (state, action) => {
      const { userId, clientId, message } = action.payload;
      const messages = state.messagesByUser[userId] || [];
      state.messagesByUser[userId] = messages.map((item) =>
        item.clientId === clientId ? message : item,
      );
      delete state.sending[clientId];
    },
    addIncomingMessage: (state, action) => {
      const { userId, message } = action.payload;
      const messages = state.messagesByUser[userId] || [];
      if (!messages.some((item) => getMessageId(item) === message._id)) {
        state.messagesByUser[userId] = [...messages, message];
      }
    },
    setConversationRead: (state, action) => {
      const conversation = state.conversations.find(
        (item) => item.user?._id === action.payload,
      );
      if (conversation) {
        conversation.unreadCount = 0;
        state.unreadTotal = recalculateUnread(state.conversations);
      }
    },
    setUserOnline: (state, action) => {
      state.onlineUsers[action.payload.userId] = action.payload.online;
    },
    setUserTyping: (state, action) => {
      state.typingUsers[action.payload.userId] = action.payload.typing;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload;
        state.unreadTotal = recalculateUnread(action.payload);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload?.message || "Unable to load conversations";
      })
      .addCase(fetchMessages.pending, (state, action) => {
        state.loadingMessages[action.meta.arg.userId] = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { userId, messages, nextCursor, older } = action.payload;
        state.loadingMessages[userId] = false;
        state.nextCursors[userId] = nextCursor;
        state.hasMore[userId] = Boolean(nextCursor);
        state.messagesByUser[userId] = older
          ? [...messages.reverse(), ...(state.messagesByUser[userId] || [])]
          : messages.reverse();
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages[action.payload?.userId] = false;
        state.error = action.payload?.error?.message || "Unable to load messages";
      })
      .addCase(sendMessage.pending, (state, action) => {
        state.sending[action.meta.arg.clientId] = "pending";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { userId, clientId, message } = action.payload;
        const messages = state.messagesByUser[userId] || [];
        state.messagesByUser[userId] = messages.map((item) =>
          item.clientId === clientId ? message : item,
        );
        delete state.sending[clientId];
        const conversation = state.conversations.find(
          (item) => item.user?._id === userId,
        );
        if (conversation) conversation.latestMessage = message;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const { clientId } = action.payload || {};
        if (clientId) state.sending[clientId] = "failed";
        state.error = action.payload?.error?.message || "Message failed to send";
      })
      .addCase(markMessagesRead.fulfilled, (state, action) => {
        const conversation = state.conversations.find(
          (item) => item.user?._id === action.payload,
        );
        if (conversation) {
          conversation.unreadCount = 0;
          state.unreadTotal = recalculateUnread(state.conversations);
        }
      });
  },
});

export const {
  addIncomingMessage,
  addOptimisticMessage,
  markMessageFailed,
  replaceOptimisticMessage,
  setConversationRead,
  setUserOnline,
  setUserTyping,
} = messageReducer.actions;

export default messageReducer.reducer;
