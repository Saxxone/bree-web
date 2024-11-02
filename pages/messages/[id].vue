<script setup lang="ts">
import type { Chat } from "~/types/chat";
import { useGlobalStore } from "~/store/global";
import { useChatStore } from "~/store/chats";
import { useStorage } from "@vueuse/core";
import { useAuthStore } from "~/store/auth";
import { HTMLInputType } from "~/types/types";
import type { Room } from "~/types/chat";
import { state as SocketState, useSocket } from "~/composables/useSocket";

definePageMeta({
  layout: "base",
});

const socket = useSocket();
socket.disconnect();
socket.off("chat");

const { t } = useI18n();
const route = useRoute();

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const { addSnack } = useGlobalStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const chatsStore = useChatStore();
const { viewRoomChats, getRoom } = chatsStore;
const { roomId } = storeToRefs(chatsStore);
const room = ref<Room | null>();
// const messages = useStorage(`${route.params.id}-room`, [] as Chat[], localStorage, {
//   mergeDefaults: true,
// });
const messages = ref<Chat[]>([]);
const scroll_element = ref<HTMLElement | null>(null);
const take = ref(35);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);

const message = ref("");
const rows = ref(1);
const { reset } = useInfiniteScroll(
  scroll_element,
  async () => {
    // current_page.value++;
    // await useDynamicScroll(scroll_element.value as HTMLElement, fetchChats);
  },
  { distance: 10000000 }
);
const participants = computed(() => {
  const authStore = useAuthStore();

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
  messages.value = await viewRoomChats(messages.value, route.params.id as string, {
    cursor: messages.value?.[0]?.id,
    take: take.value,
    skip: skip.value,
  });
}

async function getRoomData() {
  room.value = await getRoom(route.params.id as string);
}

async function messageParser(): Promise<Chat | null> {
  if (!participants.value?.[participants.value?.length - 1].id) return null;
  const enc = encryptMessage();
  return {
    ...(enc.text && { text: enc.text }),
    ...(enc.media && { media: enc.media }),
    ...(enc.mediaType && { mediaType: enc.mediaType }),
    toUserId: participants.value?.[participants.value?.length - 1].id as string,
    read: false,
    roomId: roomId.value as string,
    fromUserId: user.value.id,
  };
}

function encryptMessage(): Partial<Chat> {
  return { text: message.value as string };
}

async function attemptSendMessage() {
  const dm = await messageParser();

  if (!dm) return;

  socket.emit("chat", dm, (res: any) => {
    messages.value.push(res);
  });

  socket.on("exception", (res) => {
    addSnack({ ...res, type: "error" });
  });

  resetChat();
}

function resetChat() {
  message.value = "";
  rows.value = 1;
}

function addRow() {
  if (rows.value < 4) rows.value++;
}

onBeforeMount(() => {
  getRoomData();
  fetchMessages();
  page_title.value = t("chat.page_title");

  socket.connect();

  socket.on("connect", () => {
    SocketState.connected = true;
  });

  socket.on("connection", (s) => {
    console.log("connected", s);
  });

  socket.on("disconnect", () => {
    SocketState.connected = false;
  });
});

onBeforeUnmount(() => {
  socket.disconnect();
});

onBeforeRouteLeave(() => {
  socket.disconnect();
  socket.off("chat");
});
</script>

<template>
  <div class="h-dhv overflow-hidden mt-10">
    <div class="h-[calc(100dvh_-_12rem)] overflow-y-auto pb-4">
      <ChatsChatParser v-for="message in messages" :key="message.id" :message="message" />
    </div>

    <FormsFormInput
      @keyup.enter="addRow"
      :rows="rows"
      append-icon="send"
      name="message"
      class="!mb-2 !p-2"
      :input-type="HTMLInputType.Textarea"
      @append-click="attemptSendMessage"
      v-model="message"
      :placeholder="t('chat.new')" />
  </div>
</template>
