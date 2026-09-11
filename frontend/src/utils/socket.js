import { io } from "socket.io-client";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

let socketInstance = null;

export function getSocket() {
  if (socketInstance) return socketInstance;

  socketInstance = io(SERVER_URL, {
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socketInstance;
}

export default getSocket;
