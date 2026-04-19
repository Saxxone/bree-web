import { io } from "socket.io-client";
import apiRoutes from "~/utils/api_routes";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: [],
});

export const useSocket = () => {
  const socket = io(apiRoutes.chats.base, { autoConnect: false });

  return socket;
};
