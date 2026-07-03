import "@/styles/globals.css";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/config/redux/store.js";
import { useEffect } from "react";
import socket from "@/config/socket.js";
import Toast from "@/Components/Toast";
import { getAboutUser } from "@/config/redux/action/authAction";

function SocketInitializer() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    socket.connect();
    socket.emit("join_room", userId);

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
}

function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
    }
  }, []);

  return null;
}

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <SocketInitializer />
      <Toast />
      <Component {...pageProps} />
    </Provider>
  );
}
