import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://pm-backend-f3b6.onrender.com";

export function useSocket(userId) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      return undefined;
    }

    const nextSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") },
    });
    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [userId]);

  return socket;
}
