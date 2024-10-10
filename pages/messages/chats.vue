<script setup lang="ts">
import app_routes from "~/utils/routes";
import type { Chat } from "~/types/chat";
import { useGlobalStore } from "~/store/global";
import { useChatStore } from "~/store/chats";
import { useStorage } from "@vueuse/core";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const chatsStore = useChatStore();
const { getChats } = chatsStore;
const chats = useStorage(
  "chats",
  [
    {
      id: "1",
      to: {
        id: "user1",
        name: "John Doe",
        img: "https://picsum.photos/200/300",
      },
      text: "Hey there! How are you doing?",
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
      createdAt: "2023-10-27T10:10:00.000Z",
    },
  ],
  localStorage,
  {
    mergeDefaults: true,
  },
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
  { distance: 10000000 },
);

async function fetchChats() {
  await getChats(chats.value, {
    cursor: chats.value[0]?.id,
    take: take.value,
    skip: skip.value,
  });
}

onBeforeMount(() => {
  page_title.value = t("messages.page_title");
  // fetchChats();
});
</script>

<template>
  <div ref="scroll_element" class="lg:pt-14">
    <NuxtLink
      :to="app_routes.messages.chat(chat.id)"
      v-for="chat in chats"
      :key="chat.id"
      class="flex items-center space-x-4 mb-4 bg-base-white rounded-lg py-4 px-3"
    >
      <div class="w-10 shrink-0">
        <NuxtImg :src="chat.to.img" class="avatar h-10 w-10" />
      </div>
      <div>
        <div class="text-main">{{ chat.to.name }}</div>
        <div
          class="truncate w-11/12 text-muted text-ellipsis overflow-x-hidden"
        >
          {{ chat.text }}
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
