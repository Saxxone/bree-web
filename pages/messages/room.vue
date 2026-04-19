<script setup lang="ts">
import type { Chat, Room } from "~/types/chat";
import { useGlobalStore } from "~/store/global";
import { useRoomStore } from "~/store/room";
import { useAuthStore } from "~/store/auth";
import { HTMLInputType } from "~/types/types";
import { state as SocketState, useSocket } from "~/composables/useSocket";
import { useCryptoStore } from "~/store/crypto";
import { encryptChatPayloadHybrid } from "~/composables/useE2EE";

definePageMeta({
  layout: "room",
});

const socket = useSocket();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const { addSnack } = useGlobalStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { logout } = authStore;
const roomStore = useRoomStore();
const { viewRoomChats, getRoom, findRoomByParticipantsOrCreate } = roomStore;
const cryptoStore = useCryptoStore();
const { algorithm, hash } = storeToRefs(cryptoStore);

const is_sending = ref(false);

const room = ref<Room | null>();
const messages = ref<Chat[]>([]);
const take = ref(10);
const skip = ref(0);
const message = ref("");
const rows = ref(1);

function sortChatsByCreatedAsc(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  });
}

const participants = computed(() => {
  return room.value?.participants.filter((userOrId) => {
    if (typeof userOrId === "string") {
      return userOrId !== authStore.user.id;
    } else if (typeof userOrId === "object") {
      return userOrId.id !== authStore.user.id;
    } else {
      return [];
    }
  });
});

const receiver = computed(() => {
  if (!room.value || !room.value.participants || !user.value) return null;

  return (
    room.value.participants.find((participant) => {
      if (typeof participant === "string") {
        return participant !== user.value.id;
      } else if (typeof participant === "object" && participant.id) {
        return participant.id !== user.value.id;
      }
      return false;
    }) || null
  );
});

async function fetchMessages() {
  if (!room.value) return;
  const merged = await viewRoomChats(messages.value, room.value.id as string, {
    cursor: messages.value?.[0]?.id,
    take: take.value,
    skip: skip.value,
  });
  messages.value = sortChatsByCreatedAsc(merged);
  scrollToChat(messages.value?.[messages.value?.length - 1]?.id as string);
}

async function getRoomData() {
  room.value = await getRoom(route.query.r as string);
  if (!room.value?.id || !user.value?.id) return;
  socket.emit(
    "join-room",
    { roomId: room.value.id, userId: user.value.id },
    () => {},
  );
}

async function messageParser(): Promise<Record<
  string,
  string | boolean
> | null> {
  if (!receiver.value?.id) return null;

  if (!user.value) {
    logout();
    return null;
  }

  if (!receiver.value.publicKey) {
    addSnack({ message: t("chat.missing_peer_key"), type: "error" });
    return null;
  }

  const hybrid = await encryptChatPayloadHybrid({
    sender_public_key: user.value.publicKey,
    receiver_public_key: receiver.value.publicKey as string,
    message: message.value,
    algorithm: algorithm.value,
    hash: hash.value,
  });

  if (!hybrid) {
    addSnack({ message: t("chat.encryption_failed"), type: "error" });
    return null;
  }

  return {
    senderEncryptedMessage: hybrid.senderEncryptedMessage,
    receiverEncryptedMessage: hybrid.receiverEncryptedMessage,
    encryptedPayload: hybrid.encryptedPayload,
    toUserId: receiver.value.id,
    read: false,
    roomId: room.value?.id as string,
    fromUserId: user.value.id,
  };
}

async function attemptSendMessage() {
  if (is_sending.value || !message.value.trim()) return;

  is_sending.value = true;
  try {
    const dm = await messageParser();
    if (!dm) return;
    resetChat();
    socket.emit("send-message", dm);
  } finally {
    is_sending.value = false;
  }
}

async function setupRoom() {
  const user1 = route.query.u as string;
  const user2 = user.value.id;

  room.value = await findRoomByParticipantsOrCreate(user1, user2);

  if (!room.value?.id) router.go(-1);
  else {
    socket.emit(
      "join-room",
      { roomId: room.value.id, userId: user2 },
      () => {},
    );
  }
}

function resetChat() {
  message.value = "";
  rows.value = 1;
}

function addRow() {
  if (rows.value < 4) rows.value++;
}

function scrollToChat(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }
}

function setupSockets() {
  socket.connect();

  socket.on("connect", () => {
    SocketState.connected = true;
  });

  socket.on("exception", (res: { message?: string }) => {
    addSnack({
      ...res,
      type: "error",
      message: res?.message ?? t("chat.send_failed"),
    });
  });

  socket.on("receive-message", (incoming: Chat) => {
    messages.value = sortChatsByCreatedAsc([...messages.value, incoming]);
    scrollToChat(incoming.id as string);
  });

  socket.on("disconnect", () => {
    SocketState.connected = false;
  });
}

function teardownSockets() {
  socket.off("connect");
  socket.off("exception");
  socket.off("receive-message");
  socket.off("disconnect");
  socket.disconnect();
}

onMounted(async () => {
  setupSockets();
  if (route.query.r) await getRoomData();
  else if (route.query.u) await setupRoom();
  await fetchMessages();
});

onBeforeUnmount(() => {
  teardownSockets();
});

onBeforeRouteLeave(() => {
  teardownSockets();
});

watch(
  () => receiver.value,
  () => {
    page_title.value = receiver.value?.name ?? t("chat.page_title");
  },
  { immediate: true },
);
</script>

<template>
  <div class="h-dhv mt-10 overflow-hidden">
    <div class="h-[calc(100dvh_-_12rem)] overflow-y-auto pb-4">
      <ChatsChatParser
        v-for="m in messages"
        :id="m.id"
        :key="m.id as string"
        :message="m"
      />
    </div>

    <FormsFormInput
      v-model="message"
      :rows="rows"
      :append-icon="
        is_sending ? 'line-md:loading-twotone-loop' : 'ic:twotone-send'
      "
      name="message"
      class="!mb-2 !p-2"
      :input-type="HTMLInputType.Textarea"
      :placeholder="t('chat.new')"
      @keyup.enter="addRow"
      @append-click="attemptSendMessage"
    />
  </div>
</template>
