<script setup lang="ts">
import app_routes from "~/utils/routes";
import { useGlobalStore } from "~/store/global";
import { useChatStore } from "~/store/chats";
import { useStorage } from "@vueuse/core";
import type { Room } from "~/types/chat";
import { useAuthStore } from "~/store/auth";
import type { User } from "~/types/user";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const router = useRouter();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const chatsStore = useChatStore();
const { getRooms } = chatsStore;
const { roomId } = storeToRefs(chatsStore);
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
  await getRooms(rooms.value, {
    cursor: rooms.value[0]?.id,
    take: take.value,
    skip: skip.value,
  });
}

function participants(participants: User[] | string[]): (User | string)[] {
  const authStore = useAuthStore();

  return participants.filter((userOrId) => {
    if (typeof userOrId === "string") {
      return userOrId !== authStore.user.id;
    } else if (typeof userOrId === "object") {
      return userOrId.id !== authStore.user.id;
    } else {
      return [];
    }
  });
}

function goToRoom(id: string) {
  roomId.value = id;
  router.push(app_routes.messages.chat(id));
}

onBeforeMount(() => {
  page_title.value = t("messages.page_title");
  fetchRooms();
});
</script>

<template>
  <div ref="scroll_element" class="lg:pt-14">
    <div @click="goToRoom(room.id)" v-for="room in rooms" :key="room.id" class="flex items-center space-x-4 mb-4 bg-base-white rounded-lg py-4 px-3">
      <div class="w-10 shrink-0">
        <NuxtImg :src="participants(room.participants)[participants.length - 1]" class="avatar h-10 w-10" />
      </div>
      <div>
        <div class="text-main">{{ room.name || participants(room.participants)[participants.length - 1] }}</div>
        <div class="truncate w-11/12 text-muted text-ellipsis overflow-x-hidden">
          {{ room.latestMessage.text }}
        </div>
      </div>
    </div>

    <ChatsStartChat />
  </div>
</template>
