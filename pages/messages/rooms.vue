<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
import { useRoomStore } from "~/store/room";
import type { Room } from "~/types/chat";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "room",
});

const { t } = useI18n();

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const roomStore = useRoomStore();
const { getRooms } = roomStore;

const rooms = ref<Room[]>([]);

const take = ref(10);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);

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
    <ChatsRoomListItem v-for="room in rooms" :key="room.id" :room="room" />

    <AppFloatingActionButton
      icon="line-md:edit-full-twotone"
      :to="app_routes.messages.new"
    />
  </div>
</template>
