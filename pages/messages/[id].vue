<script setup lang="ts">
import type { Chat } from "~/types/chat";
import { useGlobalStore } from "~/store/global";
import { useChatStore } from "~/store/chats";
import { useStorage } from "@vueuse/core";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const route = useRoute();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const chatsStore = useChatStore();
const { getMessages } = chatsStore;
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
      media: "https://picsum.photos/200/300",
      mediaType: "image",
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

onBeforeMount(() => {
  // fetchMessages();
  page_title.value = t("chat.page_title");
});
</script>

<template>
  <div>
    <ChatsChatParser v-for="message in messages" :key="message.id" :message="message" />
  </div>
</template>
