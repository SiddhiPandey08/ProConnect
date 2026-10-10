import { io } from "socket.io-client";

export const socketUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9090";

export const createSocket = (token) =>
  io(socketUrl, {
    auth: { token },
  });

const socket = io(socketUrl, { autoConnect: false });

export default socket;
