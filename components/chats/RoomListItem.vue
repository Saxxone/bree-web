<script setup lang="ts">
import app_routes from "~/utils/routes";
import { useRoomStore } from "~/store/room";
import { useAuthStore } from "~/store/auth";
import type { Room } from "~/types/chat";
import { useTimeAgo } from "@vueuse/core";

interface Props {
  room: Room;
}

const props = defineProps<Props>();

const router = useRouter();
const roomStore = useRoomStore();
const { roomId } = storeToRefs(roomStore);
const participants = computed(() => {
  const authStore = useAuthStore();

  return props.room.participants.filter((userOrId) => {
    if (typeof userOrId === "string") {
      return userOrId !== authStore.user.id;
    } else if (typeof userOrId === "object") {
      return userOrId.id !== authStore.user.id;
    } else {
      return [];
    }
  });
});

function goToRoom(id: string) {
  roomId.value = id;
  router.push(app_routes.messages.room(id));
}
</script>

<template>
  <div
    class="flex items-center space-x-4 mb-4 bg-base-white rounded-lg py-4 px-3"
    @click="goToRoom(props.room?.id)"
  >
    <div class="w-10 shrink-0">
      <!-- <NuxtImg :src="participants[participants.length - 1].img" class="avatar h-10 w-10" /> -->
    </div>
    <div class="w-full">
      <div class="text-main">
        {{ props.room?.name ?? participants[participants.length - 1]?.name }}
      </div>
      <div class="flex items-center space-x-2">
        <div
          class="truncate w-11/12 text-muted text-ellipsis overflow-x-hidden"
        >
          {{ props.room?.chats[0]?.text }}
        </div>
        <div
          v-if="props.room.chats[0] && props.room.chats[0]?.createdAt"
          class="ml-auto text-muted text-xs"
        >
          {{ useTimeAgo(props.room.chats[0].createdAt) }}
        </div>
      </div>
    </div>
  </div>
</template>
