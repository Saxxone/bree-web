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

const profile_pic_url = ref("https://pbs.bree.social/bree-pfp.svg");
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

async function getPfP() {
  const imgUrl = participants.value?.[participants.value.length - 1]?.img;

  if (!imgUrl) return "https://pbs.bree.social/bree-pfp.svg";

  if (!imgUrl.startsWith("file://")) {
    try {
      const { status } = await useFetch(imgUrl, { method: "HEAD" });
      if (Number(status.value) === 200) {
        return imgUrl;
      }
    } catch (error) {
      console.error("Error checking image URL:", error);
    }
  }

  return "https://pbs.bree.social/bree-pfp.svg";
}

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
  profile_pic_url.value = await getPfP();
  decrypted_message.value = await decryptMessage();
});
</script>

<template>
  <div
    class="bg-base-white mb-4 flex items-center space-x-4 rounded-lg px-3 py-4"
    @click="goToRoom(props.room?.id)"
  >
    <div class="w-10 shrink-0">
      <NuxtImg :src="profile_pic_url" class="avatar h-10 w-10" />
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
