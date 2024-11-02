import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: [],
});

export const useSocket = () => {
  const socket = io(apiRoutes.chats.base, { autoConnect: false });

  return socket;
};
