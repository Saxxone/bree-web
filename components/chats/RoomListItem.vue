<script setup lang="ts">
import app_routes from "~/utils/routes";
import { useRoomStore } from "~/store/room";
import { useAuthStore } from "~/store/auth";
import type { Room } from "~/types/chat";
import { useTimeAgo } from "~/composables/useComposables";
import { useCryptoStore } from "~/store/crypto";

interface Props {
  room: Room;
}

const props = defineProps<Props>();

const router = useRouter();
const roomStore = useRoomStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { roomId } = storeToRefs(roomStore);

const cryptoStore = useCryptoStore();
const { algorithm, hash } = storeToRefs(cryptoStore);

const participants = computed(() => {
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

const decrypted_message = ref("");

function goToRoom(id: string) {
  roomId.value = id;
  router.push(app_routes.messages.room(id));
}

const participantForAvatar = computed(() => {
  const list = participants.value;
  const last = list?.[list.length - 1];
  if (last && typeof last === "object") return last;
  return null;
});

const participantAvatarSrc = computed(
  () => participantForAvatar.value?.img ?? null,
);

const participantAvatarAlt = computed(
  () => participantForAvatar.value?.name ?? "",
);

async function decryptMessage() {
  const message = props.room?.chats[0]?.userEncryptedMessages?.find(
    (message) => {
      return message.userId === user.value.id;
    },
  )?.encryptedMessage;

  if (!message) return "";

  try {
    const storedKey = localStorage.getItem("private_key");

    const private_key = storedKey
      ? (JSON.parse(storedKey) as JsonWebKey)
      : null;

    if (!private_key || !message) return "Message decryption failed.";

    return useDecryptMessage({
      message,
      algorithm: algorithm.value,
      hash: hash.value,
      private_key: private_key,
    });
  } catch (error) {
    console.error("Error retrieving/parsing private key:", error);
    return "Message decryption failed.";
  }
}

onMounted(async () => {
  decrypted_message.value = await decryptMessage();
});
</script>

<template>
  <div
    class="bg-base-white mb-4 flex items-center space-x-4 rounded-lg px-3 py-4"
    @click="goToRoom(props.room?.id)"
  >
    <div class="w-10 shrink-0">
      <AppUserAvatar
        :src="participantAvatarSrc"
        :alt="participantAvatarAlt"
        :width="40"
        :height="40"
        img-class="avatar h-10 w-10"
      />
    </div>
    <div class="w-full">
      <div class="text-main">
        {{ props.room?.name ?? participants[participants.length - 1]?.name }}
      </div>
      <div class="flex items-center space-x-2">
        <div
          class="text-muted h-6 w-11/12 overflow-x-hidden truncate text-ellipsis"
        >
          <div>{{ decrypted_message }}</div>
        </div>
        <div
          v-if="props.room.chats[0] && props.room.chats[0]?.createdAt"
          class="text-muted ml-auto text-xs"
        >
          {{ useTimeAgo(props.room.chats[0].createdAt) }}
        </div>
      </div>
    </div>
  </div>
</template>
