<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
import { useChatStore } from "~/store/chats";
import { useStorage } from "@vueuse/core";
import type { Room } from "~/types/chat";
import { useAuthStore } from "~/store/auth";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const chatsStore = useChatStore();
const { getRooms } = chatsStore;

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const rooms = useStorage("rooms", [] as Room[], localStorage, {
  mergeDefaults: true,
});

const scroll_element = ref<HTMLElement | null>(null);
const take = ref(35);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);

const { reset } = useInfiniteScroll(
  scroll_element,
  async () => {
    // current_page.value++;
    // await useDynamicScroll(scroll_element.value as HTMLElement, fetchRooms);
  },
  { distance: 10000000 }
);

async function fetchRooms() {
  rooms.value = await getRooms(rooms.value, {
    cursor: rooms.value[0]?.id,
    take: take.value,
    skip: skip.value,
  });
}

onMounted(() => {
  page_title.value = t("messages.page_title");
  fetchRooms();
});
</script>

<template>
  <div ref="scroll_element" class="lg:pt-14">

    <ChatsRoomListItem :room="room" v-for="room in rooms" :key="room.id" />

    <ChatsStartChat />
  </div>
</template>
