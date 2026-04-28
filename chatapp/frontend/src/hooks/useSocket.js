import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null; // singleton - one socket per session

const useSocket = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ["websocket"],
      });
    }

    socketRef.current = socketInstance;
    socketInstance.emit("user:online", userId);

    return () => {
      // Keep socket alive during session
    };
  }, [userId]);

  return socketRef.current || socketInstance;
};

export default useSocket;
