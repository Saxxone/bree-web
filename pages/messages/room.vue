<script setup lang="ts">
import type { Chat, Room } from "~/types/chat";
import { useGlobalStore } from "~/store/global";
import { useChatStore } from "~/store/chats";
import { useAuthStore } from "~/store/auth";
import { useUsersStore } from "~/store/users";
import { HTMLInputType } from "~/types/types";
import { state as SocketState, useSocket } from "~/composables/useSocket";
import { useEncrypt, useGenerateKeyPair } from "~/composables/useE2EE";
import { useCryptoStore } from "~/store/crypto";

definePageMeta({
  layout: "base",
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
const chatsStore = useChatStore();
const { viewRoomChats, getRoom, findRoomByParticipantsOrCreate } = chatsStore;
const userStore = useUsersStore();
const { savePublicKey } = userStore;
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

  const sender = room.value?.participants.find(
    (userOrId) => typeof userOrId === "object" && userOrId.id === user.value.id,
  );

  if (!sender) return null;

  //TODO check for public key on room and not sender
  if (!sender.publicKey) {
    const { public_key, private_key } = await useGenerateKeyPair(
      algorithm.value,
      hash.value,
    );

    await savePublicKey(sender.id, public_key);
    await getRoomData();
    localStorage.setItem("private_key", JSON.stringify(private_key));
  }

  const encrypted_message = await encryptMessage(
    JSON.parse(JSON.stringify(sender.publicKey)),
  );

  if (!encrypted_message) return null; // Encryption failed

  return {
    ...(encrypted_message.text && { text: encrypted_message.text }),
    ...(encrypted_message.media && { media: encrypted_message.media }),
    ...(encrypted_message.mediaType && {
      mediaType: encrypted_message.mediaType,
    }),
    toUserId: participants.value?.[participants.value?.length - 1]
      ?.id as string,
    read: false,
    roomId: room.value?.id as string,
    fromUserId: user.value.id,
  };
}

async function encryptMessage(
  sender_public_key: JsonWebKey | string | undefined,
): Promise<Partial<Chat> | null> {
  if (!sender_public_key) {
    console.error("Recipient public key is missing!");
    return null;
  }

  try {
    const encoded_message = new TextEncoder().encode(message.value);
    const encrypted = await useEncrypt(
      algorithm.value,
      hash.value,
      encoded_message,
      JSON.parse(sender_public_key),
    );

    return { text: encrypted };
  } catch (error) {
    console.error("Encryption error:", algorithm.value, hash.value, error);
    addSnack({
      statusCode: 500,
      message: "Failed to encrypt message.",
      type: "error",
    });
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
    const { public_key, private_key } = await useGenerateKeyPair(
      algorithm.value,
      hash.value,
    );

    await savePublicKey(sender.id, public_key);
    localStorage.setItem("private_key", JSON.stringify(private_key));
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
