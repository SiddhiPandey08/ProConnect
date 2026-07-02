import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/config/redux/store.js";
import { useEffect } from "react";
import socket from "@/config/socket.js";
import Toast from "@/components/Toast";
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
export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <SocketInitializer />
      <Toast />
      <Component {...pageProps} />
    </Provider>
  );
}
