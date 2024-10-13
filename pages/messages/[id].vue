<script setup lang="ts">
import type { Chat } from "~/types/chat";
import { useGlobalStore } from "~/store/global";
import { useChatStore } from "~/store/chats";
import { useStorage } from "@vueuse/core";
import { HTMLInputType } from "~/types/types";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const route = useRoute();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const chatsStore = useChatStore();
const { getMessages, sendMessage } = chatsStore;
const messages = useStorage(
  `messages-from-${route.params.id}`,
  [
    {
      id: "1",
      to: {
        id: "user1",
        name: "John Doe",
        img: "https://picsum.photos/200/300",
      },
      text: "Hey there! How are you doing?",
      media: "https://picsum.photos/200/300",
      mediaType: "image",
      createdAt: "2023-10-27T10:00:00.000Z",
    },
    {
      id: "2",
      to: {
        id: "user2",
        name: "Jane Smith",
        img: "https://picsum.photos/200/300",
      },
      text: "I'm doing well, thanks for asking. How are you?",
      media: "https://picsum.photos/200/300",
      mediaType: "image",
      createdAt: "2023-10-27T10:05:00.000Z",
    },
    {
      id: "3",
      to: {
        id: "user1",
        name: "John Doe",
        img: "https://picsum.photos/200/300",
      },
      text: "I'm great! Just working on this awesome project.",
      media: "/assets/file_example_MP3_2MG.mp3",
      mediaType: "audio",
      createdAt: "2023-10-27T10:10:00.000Z",
    },
  ],
  localStorage,
  {
    mergeDefaults: true,
  }
);
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
  await getMessages(messages.value, {
    cursor: messages.value[0]?.id,
    take: take.value,
    skip: skip.value,
  });
}

function messageParser(): Chat {}

async function attemptSendMessage() {
  messages.value = (await sendMessage(messageParser(), "id", messages.value)) ?? messages.value;
  message.value = "";
  rows.value = 1;
}

function addRow() {
  if (rows.value < 4) rows.value++;
}

onBeforeMount(() => {
  // fetchMessages();
  page_title.value = t("chat.page_title");
});
</script>

<template>
  <div class="h-dhv overflow-hidden">
    <div class="h-[calc(100dvh_-_10rem)] overflow-y-auto pb-4">
      <ChatsChatParser v-for="message in messages" :key="message.id" :message="message" />
    </div>

    <FormsFormInput
      @keyup.enter="addRow"
      :rows="rows"
      append-icon="send"
      name="message"
      class="!mb-2"
      :input-type="HTMLInputType.Textarea"
      @append-click="attemptSendMessage"
      v-model="message" />
  </div>
</template>
