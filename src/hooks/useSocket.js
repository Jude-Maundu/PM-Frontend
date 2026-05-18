import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://pm-backend-f3b6.onrender.com";

export function useSocket(userId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current.emit("join", `user_${userId}`);
    return () => { socketRef.current?.disconnect(); };
  }, [userId]);

  return socketRef.current;
}
