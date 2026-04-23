import { getChatSocket } from "~/composables/chatSocketSingleton";
import { useAuthStore } from "~/store/auth";
import { useChatUnreadStore } from "~/store/chatUnread";
import { useRoomStore } from "~/store/room";
import type { Chat, Room } from "~/types/chat";

let inboxSocketListenersAttached = false;

function peerSenderId(chat: Chat): string | undefined {
  return chat.senderUserId;
}

export function useChatInboxListener() {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  const chatUnread = useChatUnreadStore();
  const roomStore = useRoomStore();
  const route = useRoute();

  const inboxReceive = (chat: Chat) => {
    const me = authStore.user?.id;
    if (!me) return;
    const from = peerSenderId(chat);
    if (!from || from === me) return;
    if (!chat.roomId) return;
    if (
      route.path === "/messages/room" &&
      route.query.r === String(chat.roomId)
    ) {
      return;
    }
    chatUnread.setIncomingPeerMessage();
  };

  const rejoinInbox = async () => {
    const me = authStore.user?.id;
    if (!me) return;
    try {
      const pageSize = 50;
      const maxPages = 20;
      const s = getChatSocket();
      let accumulated: Room[] = [];
      // Walk all pages so heavy users with more than 50 threads still get
      // live events on every room.
      for (let page = 0; page < maxPages; page += 1) {
        const rooms: Room[] = await roomStore.getRooms(accumulated, {
          cursor: undefined,
          skip: page * pageSize,
          take: pageSize,
        });
        const newly = rooms.filter(
          (r) => !accumulated.some((a) => a.id === r.id),
        );
        accumulated = rooms;
        for (const r of newly) {
          s.emit("join-room", { roomId: r.id, userId: me });
        }
        if (newly.length < pageSize) break;
      }
    } catch {
      // ignore: rooms not loaded (offline, etc.)
    }
  };

  const onConnect = () => {
    void rejoinInbox();
  };

  const setupInbox = () => {
    if (!authStore.isAuthenticated) return;
    if (inboxSocketListenersAttached) {
      void rejoinInbox();
      return;
    }
    const s = getChatSocket();
    s.on("connect", onConnect);
    s.on("receive-message", inboxReceive);
    inboxSocketListenersAttached = true;
    s.connect();
    void rejoinInbox();
  };

  const teardownInbox = () => {
    if (!inboxSocketListenersAttached) {
      return;
    }
    const s = getChatSocket();
    s.off("connect", onConnect);
    s.off("receive-message", inboxReceive);
    s.disconnect();
    inboxSocketListenersAttached = false;
  };

  watch(
    () => authStore.isAuthenticated,
    (signedIn) => {
      if (signedIn) setupInbox();
      else {
        chatUnread.clearUnread();
        teardownInbox();
      }
    },
    { immediate: true },
  );

  watch(
    () => route.path,
    (p) => {
      if (p === "/messages/rooms") {
        chatUnread.clearUnread();
      }
    },
  );
}
