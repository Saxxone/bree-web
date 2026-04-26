<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";
import { useRoomStore } from "~/store/room";
import type { Chat, DateString } from "~/types/chat";

interface Props {
  message: Chat;
}

const props = defineProps<Props>();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const cryptoStore = useCryptoStore();
const { deviceId } = storeToRefs(cryptoStore);
const roomStore = useRoomStore();

/**
 * Map<chatId, plaintext> provided by `pages/messages/room.vue`. The sender
 * never gets an envelope addressed to itself, so we read the plaintext out
 * of this cache instead of trying to decrypt an envelope that does not exist.
 */
const outboundPlaintext = inject<Map<string, string>>(
  "outboundPlaintext",
  new Map(),
);

const dir = computed(() =>
  props.message.senderUserId === user.value?.id ? "ltr" : "rtl",
);

const isMine = computed(() => props.message.senderUserId === user.value?.id);

const myPlaintext = computed(() => {
  const id = props.message.id as string | undefined;
  return id ? outboundPlaintext.get(id) : undefined;
});

const envelopeForMe = computed(() => {
  const list = props.message.envelopes ?? [];
  if (list.length === 1) return list[0];
  return (
    list.find((e) => e.recipientDeviceId === deviceId.value) ?? list[0] ?? null
  );
});

const senderIdentityKeyCurve25519 = computed(() => {
  if (props.message.senderIdentityKeyCurve25519) {
    return props.message.senderIdentityKeyCurve25519;
  }
  const rid = props.message.roomId;
  const room = roomStore.activeRoomsById.get(rid);
  if (!room) return null;
  for (const p of room.participants ?? []) {
    const senderDevice = p.devices?.find(
      (d) => d.id === props.message.senderDeviceId,
    );
    if (senderDevice) return senderDevice.identityKeyCurve25519;
  }
  return null;
});

const failed = ref(false);
</script>

<template>
  <div class="my-4">
    <div
      class="w-fit max-w-xs overflow-hidden rounded-lg"
      :class="{
        'bg-base-white text-main ms-auto': dir === 'ltr',
        'bg-base-dark-gray text-main-contrast me-auto': dir === 'rtl',
      }"
    >
      <p
        v-if="isMine && myPlaintext"
        class="text-wrap break-words m-0 px-3 py-2"
      >
        {{ myPlaintext }}
      </p>
      <ChatsChatText
        v-else-if="envelopeForMe"
        :envelope="envelopeForMe"
        :sender-device-id="props.message.senderDeviceId"
        :sender-identity-key-curve25519="senderIdentityKeyCurve25519"
        :meta="{ created_at: props.message.createdAt as DateString }"
        @error="failed = true"
      />
    </div>
    <div
      class="text-muted pt-0.5 text-xxs"
      :class="{
        'text-right': dir === 'ltr',
        'text-left': dir === 'rtl',
      }"
    >
      {{ useDateFormat(message.createdAt, "HH:mm") }}
    </div>
  </div>
</template>
