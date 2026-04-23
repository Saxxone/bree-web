<script setup lang="ts">
import { getChatSocket } from "~/composables/chatSocketSingleton";
import { state as SocketState } from "~/composables/useSocket";
import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";
import { useGlobalStore } from "~/store/global";
import { useRoomStore } from "~/store/room";
import type { Chat, ChatEnvelope, ClaimedPrekey, Room } from "~/types/chat";
import { HTMLInputType } from "~/types/types";

definePageMeta({
  layout: "room",
});

const socket = getChatSocket();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const { addSnack } = useGlobalStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { logout } = authStore;
const roomStore = useRoomStore();
const { viewRoomChats, getRoom, findRoomByParticipantsOrCreate } = roomStore;
const cryptoStore = useCryptoStore();
const { deviceId: selfDeviceId, isRegistered } = storeToRefs(cryptoStore);

const is_sending = ref(false);
const room = ref<Room | null>();
const messages = ref<Chat[]>([]);
const take = ref(10);
const skip = ref(0);
const message = ref("");
const rows = ref(1);

/**
 * Plaintext cache for outbound messages keyed by `chatId`. The server does
 * not echo an envelope addressed to the sender (the sender cannot decrypt its
 * own outbound Olm message anyway), so we stash the plaintext locally to
 * render the "my own" bubble without a round-trip.
 */
const outboundPlaintext = reactive(new Map<string, string>());

function sortChatsByCreatedAsc(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  });
}

const receiver = computed(() => {
  if (!room.value || !room.value.participants || !user.value) return null;
  return (
    room.value.participants.find((participant) => {
      if (typeof participant === "string") {
        return participant !== user.value.id;
      } else if (typeof participant === "object" && participant.id) {
        return participant.id !== user.value.id;
      }
      return false;
    }) || null
  );
});

async function fetchMessages() {
  if (!room.value || !selfDeviceId.value) return;
  const merged = await viewRoomChats(
    messages.value,
    room.value.id as string,
    { cursor: messages.value?.[0]?.id, take: take.value, skip: skip.value },
    selfDeviceId.value,
  );
  messages.value = sortChatsByCreatedAsc(merged);
  scrollToChat(messages.value?.[messages.value?.length - 1]?.id as string);
}

async function getRoomData() {
  room.value = await getRoom(route.query.r as string);
  if (!room.value?.id || !user.value?.id) return;
  roomStore.cacheRoom(room.value);
  socket.emit(
    "join-room",
    { roomId: room.value.id, userId: user.value.id },
    () => {},
  );
}

/**
 * Build the full per-recipient-device fanout for a plaintext message:
 *
 *   1. For every participant (including the sender's other devices) claim a
 *      prekey bundle from the server.
 *   2. Ask the worker to encrypt the plaintext once per target device using
 *      either an existing Olm session or the freshly claimed prekey bundle.
 *   3. Return the envelopes array the gateway expects.
 *
 * The sender's own current device is skipped — Olm cannot decrypt its own
 * outbound ciphertext, and the server rejects self-envelopes anyway.
 */
async function buildEnvelopes(
  plaintext: string,
): Promise<
  Pick<
    ChatEnvelope,
    "recipientUserId" | "recipientDeviceId" | "ciphertext" | "messageType"
  >[]
> {
  if (!room.value || !user.value || !selfDeviceId.value) return [];
  const recipients = (room.value.participants ?? [])
    .filter((p) => p && typeof p === "object" && p.id)
    .map((p) => p.id as string);

  const envelopes: Array<{
    recipientUserId: string;
    recipientDeviceId: string;
    ciphertext: string;
    messageType: 0 | 1;
  }> = [];

  // Claim prekey bundles for *all* participants in parallel (incl. self).
  const claims: Record<string, ClaimedPrekey[]> = {};
  await Promise.all(
    recipients.map(async (uid) => {
      claims[uid] = await cryptoStore.claimPrekeys(uid);
    }),
  );

  for (const uid of recipients) {
    for (const bundle of claims[uid] ?? []) {
      if (uid === user.value.id && bundle.deviceId === selfDeviceId.value) {
        continue;
      }
      try {
        const env = await cryptoStore.encrypt({
          recipientDeviceId: bundle.deviceId,
          recipientIdentityKeyCurve25519: bundle.identityKeyCurve25519,
          recipientIdentityKeyEd25519: bundle.identityKeyEd25519,
          signedPrekey: {
            keyId: bundle.signedPrekey.keyId,
            publicKey: bundle.signedPrekey.publicKey,
            signature: bundle.signedPrekey.signature,
          },
          plaintext,
        });
        envelopes.push({
          recipientUserId: uid,
          recipientDeviceId: bundle.deviceId,
          ciphertext: env.ciphertext,
          messageType: env.messageType,
        });
      } catch (err) {
        console.error("Failed to encrypt envelope", { uid, bundle, err });
      }
    }
  }
  return envelopes;
}

async function attemptSendMessage() {
  if (is_sending.value || !message.value.trim()) return;
  if (!user.value) {
    logout();
    return;
  }
  if (!isRegistered.value || !selfDeviceId.value) {
    addSnack({ type: "error", message: t("security.device_not_registered") });
    return;
  }
  if (!receiver.value?.id || !room.value?.id) return;

  is_sending.value = true;
  const plaintext = message.value;
  try {
    const envelopes = await buildEnvelopes(plaintext);
    if (envelopes.length === 0) {
      addSnack({ type: "error", message: t("security.no_peer_devices") });
      return;
    }
    const payload = {
      roomId: room.value.id,
      senderDeviceId: selfDeviceId.value,
      envelopes,
    };
    resetChat();
    socket.emit("send-message", payload, (ack: Chat | undefined) => {
      if (!ack?.id) return;
      outboundPlaintext.set(ack.id as string, plaintext);
      if (messages.value.some((m) => m.id === ack.id)) return;
      messages.value = sortChatsByCreatedAsc([...messages.value, ack]);
      scrollToChat(ack.id as string);
    });
    // Opportunistic OTK replenish after a successful send so long-running
    // chats do not starve the server pool.
    void cryptoStore.replenishOtksIfNeeded();
  } finally {
    is_sending.value = false;
  }
}

async function setupRoom() {
  const user1 = route.query.u as string;
  const user2 = user.value.id;

  room.value = await findRoomByParticipantsOrCreate(user1, user2);

  if (!room.value?.id) router.go(-1);
  else {
    roomStore.cacheRoom(room.value);
    socket.emit(
      "join-room",
      { roomId: room.value.id, userId: user2 },
      () => {},
    );
    await router.replace({
      query: { ...route.query, u: undefined, r: room.value.id },
    });
  }
}

function resetChat() {
  message.value = "";
  rows.value = 1;
}

function addRow() {
  if (rows.value < 4) rows.value++;
}

function scrollToChat(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}

function onSocketConnect() {
  SocketState.connected = true;
  if (room.value?.id && user.value?.id) {
    socket.emit(
      "join-room",
      { roomId: room.value.id, userId: user.value.id },
      () => {},
    );
  }
}

function onSocketException(res: { message?: string }) {
  addSnack({
    ...res,
    type: "error",
    message: res?.message ?? t("chat.send_failed"),
  });
}

function onSocketReceiveMessage(incoming: Chat) {
  const activeRoomId = room.value?.id;
  if (!activeRoomId) return;
  if (incoming.roomId && incoming.roomId !== activeRoomId) return;
  if (incoming.id && messages.value.some((m) => m.id === incoming.id)) return;
  messages.value = sortChatsByCreatedAsc([...messages.value, incoming]);
  scrollToChat(incoming.id as string);
  // Ack the envelope so the server can mark it delivered for our device.
  if (selfDeviceId.value) {
    socket.emit("ack-envelopes", {
      chatIds: [incoming.id],
      deviceId: selfDeviceId.value,
    });
  }
}

function onSocketDisconnect() {
  SocketState.connected = false;
}

function setupSockets() {
  socket.on("connect", onSocketConnect);
  socket.on("exception", onSocketException);
  socket.on("receive-message", onSocketReceiveMessage);
  socket.on("disconnect", onSocketDisconnect);
  socket.auth = { deviceId: selfDeviceId.value };
  socket.connect();
}

function teardownSockets() {
  socket.off("connect", onSocketConnect);
  socket.off("exception", onSocketException);
  socket.off("receive-message", onSocketReceiveMessage);
  socket.off("disconnect", onSocketDisconnect);
}

provide("outboundPlaintext", outboundPlaintext);

onMounted(async () => {
  await cryptoStore.init();
  if (!isRegistered.value) return;
  setupSockets();
  if (route.query.r) await getRoomData();
  else if (route.query.u) await setupRoom();
  await fetchMessages();
  void cryptoStore.replenishOtksIfNeeded();
});

onBeforeUnmount(() => {
  teardownSockets();
});

onBeforeRouteLeave(() => {
  teardownSockets();
});

watch(
  () => receiver.value,
  () => {
    const r = receiver.value;
    const name = r?.name?.trim();
    const handle = r?.username ? `@${r.username}` : "";
    page_title.value = name || handle || t("chat.page_title");
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-5rem)]">
    <div class="flex-1 overflow-y-auto">
      <ChatsChatParser
        v-for="m in messages"
        :id="m.id"
        :key="m.id as string"
        :message="m"
      />
    </div>
    <FormsFormInput
      v-model="message"
      :rows="rows"
      variant="chat"
      :append-icon="
        is_sending ? 'line-md:loading-twotone-loop' : 'ic:twotone-send'
      "
      name="message"
      class="!mb-0"
      :input-type="HTMLInputType.Textarea"
      :placeholder="t('chat.new')"
      @keydown.enter.exact.prevent="attemptSendMessage"
      @keydown.shift.enter="addRow"
      @append-click="attemptSendMessage"
    />
  </div>
</template>
