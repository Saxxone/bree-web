import { io, type Socket } from "socket.io-client";
import api_routes from "~/utils/api_routes";
import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";

let shared: Socket | null = null;

/** Single chat Socket.IO client shared by the room page and the inbox tab badge listener. */
export function getChatSocket(): Socket {
  const authStore = useAuthStore();
  const cryptoStore = useCryptoStore();
  const token = authStore.access_token;
  const deviceId = cryptoStore.deviceId;

  if (!shared) {
    shared = io(api_routes.chats.base, {
      autoConnect: false,
      transports: ["websocket"],
      auth: {
        token,
        deviceId,
      },
    });
  } else {
    // Keep auth in sync so reconnects use the latest access token + deviceId.
    shared.auth = { token, deviceId };
  }
  return shared;
}
