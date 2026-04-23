<script setup lang="ts">
import app_routes from "~/utils/routes";
import { useRoomStore } from "~/store/room";
import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";
import type { Room } from "~/types/chat";
import { useTimeAgo } from "~/composables/useComposables";

interface Props {
  room: Room;
}

const props = defineProps<Props>();

const router = useRouter();
const roomStore = useRoomStore();
const authStore = useAuthStore();
const cryptoStore = useCryptoStore();
const { user } = storeToRefs(authStore);
const { deviceId } = storeToRefs(cryptoStore);
const { roomId } = storeToRefs(roomStore);
const { t } = useI18n();

const participants = computed(() => {
  return (props.room.participants ?? []).filter((userOrId) => {
    if (typeof userOrId === "string") {
      return userOrId !== authStore.user.id;
    }
    if (userOrId && typeof userOrId === "object") {
      return userOrId.id !== authStore.user.id;
    }
    return false;
  });
});

onMounted(() => {
  roomStore.cacheRoom(props.room);
});

watch(
  () => props.room,
  (room) => roomStore.cacheRoom(room),
);

const preview = ref("");

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

const participantName = computed(() => participantForAvatar.value?.name ?? "");

const participantUsername = computed(
  () => participantForAvatar.value?.username ?? "",
);

async function decryptPreview() {
  const last = props.room?.chats?.[0];
  const myEnvelope = last?.envelopes?.find(
    (e) => e.recipientDeviceId === deviceId.value,
  );
  if (!last || !myEnvelope || !user.value?.id) {
    // Sender side: the server does not echo envelopes back to the sender, so
    // the inbox preview for our own latest message falls back to a generic
    // marker rather than attempting a decrypt that cannot possibly succeed.
    if (last && last.senderUserId === user.value?.id) {
      return t("security.message_sent");
    }
    return "";
  }

  const senderDevice = props.room.participants
    ?.find((p) => p.id === last.senderUserId)
    ?.devices?.find((d) => d.id === last.senderDeviceId);
  if (!senderDevice) return t("security.message_unreadable");

  try {
    return await cryptoStore.decrypt({
      senderDeviceId: last.senderDeviceId,
      senderIdentityKeyCurve25519: senderDevice.identityKeyCurve25519,
      ciphertext: myEnvelope.ciphertext,
      messageType: myEnvelope.messageType,
    });
  } catch {
    return t("security.message_unreadable");
  }
}

onMounted(async () => {
  preview.value = await decryptPreview();
});
</script>

<template>
  <NuxtLink
    :to="app_routes.messages.room(props.room?.id)"
    :aria-label="`Open conversation with ${
      props.room?.name ?? participants[participants.length - 1]?.name ?? 'user'
    }`"
    class="bg-base-white mb-4 flex items-center space-x-4 rounded-lg px-3 py-4 transition-colors hover:bg-base-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:bg-slate-800 dark:hover:bg-slate-700"
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
      <div class="text-main flex items-center space-x-2 dark:text-slate-100">
        <span v-if="props.room?.name" class="font-medium">
          {{ props.room.name }}
        </span>
        <template v-else>
          <span class="font-medium">{{ participantName }}</span>
          <span
            v-if="participantUsername"
            class="text-muted text-sm dark:text-slate-400"
          >
            @{{ participantUsername }}
          </span>
        </template>
      </div>
      <div class="flex items-center space-x-2">
        <div
          class="text-muted h-6 w-11/12 overflow-x-hidden truncate text-ellipsis dark:text-slate-400"
        >
          <div>{{ preview }}</div>
        </div>
        <div
          v-if="props.room.chats?.[0]?.createdAt"
          class="text-muted ml-auto text-xs dark:text-slate-400"
        >
          {{ useTimeAgo(props.room.chats[0].createdAt) }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
