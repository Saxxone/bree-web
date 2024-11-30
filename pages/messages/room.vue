<script setup lang="ts">
import type { Chat, Room } from "~/types/chat";
import { useGlobalStore } from "~/store/global";
import { useRoomStore } from "~/store/room";
import { useAuthStore } from "~/store/auth";
import { HTMLInputType } from "~/types/types";
import { state as SocketState, useSocket } from "~/composables/useSocket";
import { useEncrypt } from "~/composables/useE2EE";
import { useCryptoStore } from "~/store/crypto";

definePageMeta({
  layout: "room",
});

const socket = useSocket();
socket.disconnect();
socket.off("send-message");

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
// const messages = useStorage(`${route.params.id}-room`, [] as Chat[], localStorage, {
//   mergeDefaults: true,
// });
const messages = ref<Chat[]>([]);
const take = ref(35);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);
const message = ref("");
const rows = ref(1);

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
  messages.value = await viewRoomChats(
    messages.value,
    room.value.id as string,
    {
      cursor: messages.value?.[0]?.id,
      take: take.value,
      skip: skip.value,
    },
  );
  scrollToChat(messages.value?.[messages.value?.length - 1]?.id as string);
}

async function getRoomData() {
  room.value = await getRoom(route.query.r as string);
  socket.emit(
    "join-room",
    { roomId: room.value?.id, userId: user.value.id },
    () => {
      // console.log(res);
    },
  );
}

async function messageParser(): Promise<Chat | null> {
  if (!participants.value?.[participants.value?.length - 1]?.id) return null;

  if (!user.value) logout();

  const encrypted_message = await doubleEncrypt();

  if (!encrypted_message) return null; // Encryption failed

  return {
    ...(encrypted_message.senderEncryptedMessage && {
      senderEncryptedMessage: encrypted_message.senderEncryptedMessage,
    }),
    ...(encrypted_message.receiverEncryptedMessage && {
      receiverEncryptedMessage: encrypted_message.receiverEncryptedMessage,
    }),
    // ...(encrypted_message.media && { media: encrypted_message.media }),
    // ...(encrypted_message.mediaType && {
    //   mediaType: encrypted_message.mediaType,
    // }),
    toUserId: participants.value?.[participants.value?.length - 1]
      ?.id as string,
    read: false,
    roomId: room.value?.id as string,
    fromUserId: user.value.id,
  };
}

async function doubleEncrypt(): Promise<{
  senderEncryptedMessage: ArrayBuffer | null;
  receiverEncryptedMessage: ArrayBuffer | null;
}> {
  if (!user.value.publicKey)
    return { receiverEncryptedMessage: null, senderEncryptedMessage: null };
  if (!receiver.value?.publicKey)
    return { receiverEncryptedMessage: null, senderEncryptedMessage: null };

  const s = await encryptMessage(user.value.publicKey);
  const r = await encryptMessage(receiver.value?.publicKey);

  return { receiverEncryptedMessage: r, senderEncryptedMessage: s };
}

async function encryptMessage(
  public_key: JsonWebKey | string | undefined,
): Promise<ArrayBuffer | null> {
  if (!user.value.publicKey) {
    console.error("Recipient public key is missing!");
    return null;
  }

  try {
    const encoded_message = new TextEncoder().encode(message.value);
    const encrypted = await useEncrypt(
      algorithm.value,
      hash.value,
      encoded_message,
      JSON.parse(public_key as string),
    );

    return encrypted;
  } catch (error) {
    console.error("Encryption error:", algorithm.value, hash.value, error);
    return null;
  }
}

async function attemptSendMessage() {
  if (is_sending.value) return;

  is_sending.value = true;

  const dm = await messageParser();

  if (!dm) return;

  socket.emit("send-message", dm, () => {
    // console.log(res.roomId);
  });

  is_sending.value = false;

  socket.on("exception", (res) => {
    addSnack({ ...res, type: "error" });
  });

  resetChat();
}

async function setupRoom() {
  const user1 = route.query.u;
  const user2 = user.value.id;

  room.value = await findRoomByParticipantsOrCreate(
    user1 as string,
    user2 as string,
  );

  if (!room.value?.id) router.go(-1);
  else {
    socket.emit(
      "join-room",
      { roomId: room.value?.id, userId: user1, publicKey: "" },
      () => {
        // console.log(res);
      },
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

  socket.on("receive-message", (message: Chat) => {
    messages.value.push(message);
    scrollToChat(message.id as string);
  });

  socket.on("connection", (s) => {
    console.log("connected", s);
  });

  socket.on("disconnect", () => {
    SocketState.connected = false;
  });
}

onBeforeMount(async () => {
  setupSockets();
  if (route.query.r) await getRoomData();
  else if (route.query.u) await setupRoom();
  fetchMessages();
  page_title.value = t("chat.page_title");
});

onBeforeUnmount(() => {
  socket.disconnect();
});

onBeforeRouteLeave(() => {
  socket.disconnect();
  socket.off("send-message");
});
</script>

<template>
  <div class="h-dhv overflow-hidden mt-10">
    <div class="h-[calc(100dvh_-_12rem)] overflow-y-auto pb-4">
      <ChatsChatParser
        v-for="m in messages"
        :id="m.id"
        :key="m.id"
        :message="m"
      />
    </div>

    <FormsFormInput
      v-model="message"
      :rows="rows"
      :append-icon="is_sending ? 'progress_activity' : 'send'"
      name="message"
      class="!mb-2 !p-2"
      :input-type="HTMLInputType.Textarea"
      :placeholder="t('chat.new')"
      @keyup.enter="addRow"
      @append-click="attemptSendMessage"
    />
  </div>
</template>
