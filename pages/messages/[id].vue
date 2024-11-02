<script setup lang="ts">
import type { Chat } from "~/types/chat";
import { useGlobalStore } from "~/store/global";
import { useChatStore } from "~/store/chats";
import { useStorage } from "@vueuse/core";
import { HTMLInputType } from "~/types/types";
import { state as SocketState, useSocket } from "~/composables/useSocket";

definePageMeta({
  layout: "base",
});

const socket = useSocket();
socket.off();

const { t } = useI18n();
const route = useRoute();

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const chatsStore = useChatStore();
const { viewMessages, sendMessage } = chatsStore;
const { roomId } = storeToRefs(chatsStore);
// const messages = useStorage(`messages-from-${route.params.id}`, [] as Chat[], localStorage, {
//   mergeDefaults: true,
// });
let messages = reactive<Chat[]>([]);
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

async function fetchMessages() {
  messages =
    (await viewMessages(messages, route.params.id as string, {
      cursor: messages?.[0]?.id,
      take: take.value,
      skip: skip.value,
    })) ?? [];
}

async function messageParser(): Promise<Chat> {
  return {
    ...encryptMessage(),
    toUserId: route.params.id as string,
    read: false,
    roomId: roomId.value as string,
  };
}

function encryptMessage(): Partial<Chat> {
  return { text: message.value as string };
}

async function attemptSendMessage() {
  const dm = await messageParser();

  socket.on("connect", () => {
    socket.emit("chat", dm, (res: any) => {
      console.log(res);
    });
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
