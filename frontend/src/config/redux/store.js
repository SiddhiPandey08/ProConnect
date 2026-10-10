/**
 * STEPS FOR STATE MANAGEMENT
 * Submit action
 * handle action in its redcucer
 * register here -> Reducer
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";
import notificationReducer from "./reducer/notificationReducer";
import toastReducer from "./reducer/toastReducer";
import messageReducer from "./reducer/messageReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    notifications: notificationReducer,
    toast: toastReducer,
    messages: messageReducer,
  },
});

export { store };
