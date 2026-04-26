<script setup lang="ts">
import { useStorage } from "@vueuse/core";
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
const retryTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const retryInFlight = ref(false);
const pendingRetryPlaintexts = ref<string[]>([]);
const claimCache = ref(
  new Map<string, { at: number; bundles: ClaimedPrekey[] }>(),
);
const retryBackoffMs = ref(10_000);
const retryPausedUntil = ref(0);
const CLAIM_DEDUPE_MS = 8_000;
const RETRY_BACKOFF_MAX_MS = 40_000;
const OUTBOUND_CACHE_MAX = 500;
const INBOUND_CACHE_MAX = 1000;

/**
 * Plaintext cache for outbound messages keyed by `chatId`. The server does
 * not echo an envelope addressed to the sender (the sender cannot decrypt its
 * own outbound Olm message anyway), so we stash the plaintext locally to
 * render the "my own" bubble without a round-trip.
 */
const outboundPlaintextStorage = useStorage<Record<string, string>>(
  "afovid-chat-outbound-plaintext-v1",
  {},
);
const outboundPlaintext = reactive(new Map<string, string>());
const inboundPlaintextStorage = useStorage<Record<string, string>>(
  "afovid-chat-inbound-plaintext-v1",
  {},
);
const inboundPlaintext = reactive(new Map<string, string>());

function restoreOutboundPlaintext() {
  for (const [chatId, plaintext] of Object.entries(
    outboundPlaintextStorage.value ?? {},
  )) {
    if (!chatId || typeof plaintext !== "string" || plaintext.length === 0) {
      continue;
    }
    outboundPlaintext.set(chatId, plaintext);
  }
}

function restoreInboundPlaintext() {
  for (const [envelopeId, plaintext] of Object.entries(
    inboundPlaintextStorage.value ?? {},
  )) {
    if (
      !envelopeId ||
      typeof plaintext !== "string" ||
      plaintext.length === 0
    ) {
      continue;
    }
    inboundPlaintext.set(envelopeId, plaintext);
  }
}

function persistOutboundPlaintext(chatId: string, plaintext: string) {
  if (!chatId) return;
  outboundPlaintext.set(chatId, plaintext);
  const next = {
    ...(outboundPlaintextStorage.value ?? {}),
    [chatId]: plaintext,
  };
  const ids = Object.keys(next);
  if (ids.length > OUTBOUND_CACHE_MAX) {
    for (const staleId of ids.slice(0, ids.length - OUTBOUND_CACHE_MAX)) {
      delete next[staleId];
      outboundPlaintext.delete(staleId);
    }
  }
  outboundPlaintextStorage.value = next;
}

function persistInboundPlaintext(envelopeId: string, plaintext: string) {
  if (!envelopeId) return;
  inboundPlaintext.set(envelopeId, plaintext);
  const next = {
    ...(inboundPlaintextStorage.value ?? {}),
    [envelopeId]: plaintext,
  };
  const ids = Object.keys(next);
  if (ids.length > INBOUND_CACHE_MAX) {
    for (const staleId of ids.slice(0, ids.length - INBOUND_CACHE_MAX)) {
      delete next[staleId];
      inboundPlaintext.delete(staleId);
    }
  }
  inboundPlaintextStorage.value = next;
}

function normalizeIncomingChat(
  incoming: Chat & { chatId?: string; envelope?: ChatEnvelope | null },
): Chat {
  return {
    ...incoming,
    id: (incoming.id ?? incoming.chatId) as string,
    envelopes:
      Array.isArray(incoming.envelopes) && incoming.envelopes.length > 0
        ? incoming.envelopes
        : incoming.envelope
          ? [incoming.envelope]
          : [],
  };
}

function isThrottle429(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; message?: string };
  if (e.status === 429) return true;
  return /too many requests|throttlerexception/i.test(e.message ?? "");
}

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
  room.value = await getRoom(route.query.r as string, selfDeviceId.value);
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
  preclaimed?: Record<string, ClaimedPrekey[]>,
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
  const claims: Record<string, ClaimedPrekey[]> = preclaimed ?? {};
  if (!preclaimed) {
    const now = Date.now();
    await Promise.all(
      recipients.map(async (uid) => {
        const cached = claimCache.value.get(uid);
        if (cached && now - cached.at < CLAIM_DEDUPE_MS) {
          claims[uid] = cached.bundles;
          return;
        }
        const bundles = await cryptoStore.claimPrekeys(uid);
        claims[uid] = bundles;
        claimCache.value.set(uid, { at: Date.now(), bundles });
      }),
    );
  }

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

async function emitEncryptedMessage(
  plaintext: string,
  preclaimed?: Record<string, ClaimedPrekey[]>,
): Promise<boolean> {
  if (!room.value?.id || !selfDeviceId.value) return false;
  const envelopes = await buildEnvelopes(plaintext, preclaimed);
  if (envelopes.length === 0) return false;
  const payload = {
    roomId: room.value.id,
    senderDeviceId: selfDeviceId.value,
    envelopes,
  };
  socket.emit("send-message", payload, (ack: Chat | undefined) => {
    if (!ack?.id) return;
    persistOutboundPlaintext(ack.id as string, plaintext);
    if (messages.value.some((m) => m.id === ack.id)) return;
    messages.value = sortChatsByCreatedAsc([...messages.value, ack]);
    scrollToChat(ack.id as string);
  });
  // Opportunistic OTK replenish after a successful send so long-running
  // chats do not starve the server pool.
  void cryptoStore.replenishOtksIfNeeded();
  return true;
}

function schedulePendingRetry(delayMs = 10_000) {
  if (retryTimer.value) clearTimeout(retryTimer.value);
  retryTimer.value = setTimeout(() => {
    retryTimer.value = null;
    if (retryInFlight.value) return;
    retryInFlight.value = true;
    void (async () => {
      try {
        const now = Date.now();
        if (retryPausedUntil.value > now) {
          schedulePendingRetry(retryPausedUntil.value - now);
          return;
        }
        if (
          !room.value?.id ||
          !selfDeviceId.value ||
          pendingRetryPlaintexts.value.length === 0
        ) {
          return;
        }
        const recipients = (room.value.participants ?? [])
          .filter((p) => p && typeof p === "object" && p.id)
          .map((p) => p.id as string);
        const preclaimed: Record<string, ClaimedPrekey[]> = {};
        const claimNow = Date.now();
        await Promise.all(
          recipients.map(async (uid) => {
            const cached = claimCache.value.get(uid);
            if (cached && claimNow - cached.at < CLAIM_DEDUPE_MS) {
              preclaimed[uid] = cached.bundles;
              return;
            }
            const bundles = await cryptoStore.claimPrekeys(uid);
            preclaimed[uid] = bundles;
            claimCache.value.set(uid, { at: Date.now(), bundles });
          }),
        );
        const stillPending: string[] = [];
        let deliveredCount = 0;
        for (const plaintext of pendingRetryPlaintexts.value) {
          try {
            const delivered = await emitEncryptedMessage(plaintext, preclaimed);
            if (delivered) deliveredCount += 1;
            else stillPending.push(plaintext);
          } catch {
            stillPending.push(plaintext);
          }
        }
        pendingRetryPlaintexts.value = stillPending;
        retryBackoffMs.value = 10_000;
        retryPausedUntil.value = 0;
        if (deliveredCount > 0) {
          addSnack({
            type: "success",
            message:
              deliveredCount === 1
                ? "Queued message delivered."
                : `${deliveredCount} queued messages delivered.`,
          });
        }
        if (pendingRetryPlaintexts.value.length > 0) {
          schedulePendingRetry();
        }
      } catch (e) {
        if (isThrottle429(e)) {
          const pause = retryBackoffMs.value;
          retryPausedUntil.value = Date.now() + pause;
          retryBackoffMs.value = Math.min(pause * 2, RETRY_BACKOFF_MAX_MS);
          schedulePendingRetry(pause);
          return;
        }
        schedulePendingRetry();
      } finally {
        retryInFlight.value = false;
      }
    })();
  }, delayMs);
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
  const plaintext = message.value.trim();
  resetChat();
  try {
    const delivered = await emitEncryptedMessage(plaintext);
    if (!delivered) {
      pendingRetryPlaintexts.value.push(plaintext);
      addSnack({
        type: "info",
        message:
          "No recipient devices yet. Message queued and will auto-send when a device appears.",
      });
      schedulePendingRetry(3_000);
      return;
    }
  } finally {
    is_sending.value = false;
  }
}

async function setupRoom() {
  const user1 = route.query.u as string;
  const user2 = user.value.id;

  room.value = await findRoomByParticipantsOrCreate(
    user1,
    user2,
    selfDeviceId.value,
  );

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
  const normalized = normalizeIncomingChat(
    incoming as Chat & { chatId?: string; envelope?: ChatEnvelope | null },
  );
  if (normalized.roomId && normalized.roomId !== activeRoomId) return;
  if (normalized.id && messages.value.some((m) => m.id === normalized.id))
    return;
  messages.value = sortChatsByCreatedAsc([...messages.value, normalized]);
  scrollToChat(normalized.id as string);
  // Ack the envelope so the server can mark it delivered for our device.
  if (selfDeviceId.value) {
    socket.emit("ack-envelopes", {
      chatIds: [normalized.id],
      deviceId: selfDeviceId.value,
    });
  }
}

function onSocketDisconnect() {
  SocketState.connected = false;
}

function onRecipientDevicesAvailable(evt: {
  roomId?: string;
  recipientUserId?: string;
}) {
  if (!evt?.recipientUserId || evt.recipientUserId !== receiver.value?.id)
    return;
  if (evt.roomId && evt.roomId !== room.value?.id) return;
  if (pendingRetryPlaintexts.value.length === 0) return;
  schedulePendingRetry(300);
}

function setupSockets() {
  socket.on("connect", onSocketConnect);
  socket.on("exception", onSocketException);
  socket.on("receive-message", onSocketReceiveMessage);
  socket.on("recipient-devices-available", onRecipientDevicesAvailable);
  socket.on("disconnect", onSocketDisconnect);
  socket.auth = { deviceId: selfDeviceId.value };
  socket.connect();
}

function teardownSockets() {
  socket.off("connect", onSocketConnect);
  socket.off("exception", onSocketException);
  socket.off("receive-message", onSocketReceiveMessage);
  socket.off("recipient-devices-available", onRecipientDevicesAvailable);
  socket.off("disconnect", onSocketDisconnect);
}

provide("outboundPlaintext", outboundPlaintext);
provide("inboundPlaintext", inboundPlaintext);
provide("persistInboundPlaintext", persistInboundPlaintext);

onMounted(async () => {
  restoreOutboundPlaintext();
  restoreInboundPlaintext();
  await cryptoStore.init();
  if (!isRegistered.value) return;
  setupSockets();
  if (route.query.r) await getRoomData();
  else if (route.query.u) await setupRoom();
  await fetchMessages();
  void cryptoStore.replenishOtksIfNeeded();
});

onBeforeUnmount(() => {
  if (retryTimer.value) clearTimeout(retryTimer.value);
  teardownSockets();
});

onBeforeRouteLeave(() => {
  if (retryTimer.value) clearTimeout(retryTimer.value);
  teardownSockets();
});

watch(
  () => [
    room.value?.id,
    selfDeviceId.value,
    pendingRetryPlaintexts.value.length,
  ],
  () => {
    if (
      !room.value?.id ||
      !selfDeviceId.value ||
      pendingRetryPlaintexts.value.length === 0
    ) {
      return;
    }
    schedulePendingRetry(1_000);
  },
);

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
