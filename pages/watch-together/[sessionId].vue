<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { Post } from "~/types/post";
import { FetchMethod, type Error as ApiErr } from "~/types/types";
import { useApiConnect } from "~/composables/useApiConnect";
import { pickFirstWatchTogetherVideo } from "~/composables/pickFirstWatchTogetherVideo";
import {
  useWatchTogether,
  type WatchParticipantPayload,
  type WatchParticipantUser,
  type WatchSessionChatMessage,
} from "~/composables/useWatchTogether";
import { useAuthStore } from "~/store/auth";
import { usePostsStore } from "~/store/posts";
import { useGlobalStore } from "~/store/global";
import api_routes from "~/utils/api_routes";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const globalStore = useGlobalStore();
const { addSnack } = globalStore;
const ff = useFeatureFlags();

const ffHostApproval = computed(() =>
  ff.enabled("social.watchTogetherHostApproval"),
);
const ffChat = computed(() => ff.enabled("social.watchTogetherSessionChat"));
const ffReact = computed(() =>
  ff.enabled("social.watchTogetherSessionReactions"),
);

const sessionId = computed(() =>
  typeof route.params.sessionId === "string" ? route.params.sessionId : "",
);

type WatchSessionParticipantRow = {
  id: string;
  sessionId: string;
  userId: string;
  status: string;
  user: WatchParticipantUser;
};

type WatchSessionResponse = {
  id: string;
  postId: string;
  hostId: string;
  status: string;
  requireHostApproval?: boolean;
  viewerParticipantStatus?: "PENDING" | "APPROVED";
  post: { id: string };
  participants?: WatchSessionParticipantRow[];
  pendingParticipants?: Array<{
    id: string;
    userId: string;
    user: WatchParticipantUser;
  }>;
  host?: WatchParticipantUser;
};

const session = ref<WatchSessionResponse | null>(null);
const post = ref<Post | null>(null);
const loadError = ref<string | null>(null);
const connecting = ref(true);
const participants = ref<WatchParticipantPayload | null>(null);
const videoPlayerRef = ref<{
  getUnderlyingVideo?: () => HTMLVideoElement | null;
} | null>(null);
const waitingForApproval = ref(false);
const socketJoinedOk = ref(false);
const chatMessages = ref<WatchSessionChatMessage[]>([]);
const chatDraft = ref("");
const chatScrollRef = ref<HTMLElement | null>(null);
const reactionBubbles = ref<
  Array<{ id: string; emoji: string; leftPct: number; topPct: number }>
>([]);
let reactionBubbleSeq = 0;

const quickReactionEmojis = ["👍", "🔥", "❤️", "😂", "👏"];

const { access_token } = storeToRefs(authStore);
const { user } = storeToRefs(authStore);

const isHost = computed(
  () =>
    !!session.value?.hostId &&
    !!user.value?.id &&
    session.value.hostId === user.value.id,
);

const sessionApproved = computed(() => {
  if (!session.value) return false;
  if (isHost.value) return true;
  return session.value.viewerParticipantStatus !== "PENDING";
});

const hostPendingJoiners = computed(() => {
  if (!isHost.value || !session.value?.participants?.length) return [];
  return session.value.participants.filter((p) => p.status === "PENDING");
});

const videoUrl = computed(() => {
  if (!sessionApproved.value || !post.value) return "";
  const tok = access_token.value ?? "";
  const picked = pickFirstWatchTogetherVideo(post.value, tok);
  return picked?.url ?? "";
});

function pushReactionBubble(emoji: string) {
  const id = `r-${++reactionBubbleSeq}`;
  const leftPct = 15 + Math.random() * 70;
  const topPct = 10 + Math.random() * 35;
  reactionBubbles.value = [
    ...reactionBubbles.value,
    { id, emoji, leftPct, topPct },
  ];
  window.setTimeout(() => {
    reactionBubbles.value = reactionBubbles.value.filter((b) => b.id !== id);
  }, 3200);
}

const wt = useWatchTogether(
  () => sessionId.value || undefined,
  () => videoPlayerRef.value?.getUnderlyingVideo?.() ?? null,
  {
    onEnded: () => {
      addSnack({
        type: "info",
        message: t("watchTogether.sessionEnded"),
      });
      void router.push(app_routes.home);
    },
    onParticipants: (p) => {
      participants.value = p;
    },
    onInviteApproved: async () => {
      addSnack({
        type: "info",
        message: t("watchTogether.approvedYouCanWatch"),
      });
      await loadSessionAndPost();
      await nextTick();
      const ack = await wt.connect();
      socketJoinedOk.value = ack.ok;
      if (!ack.ok && ack.pendingApproval) {
        waitingForApproval.value = true;
      } else {
        waitingForApproval.value = false;
      }
      if (ack.ok && ffChat.value) {
        chatMessages.value = await wt.fetchChatHistory(100);
      }
      await nextTick();
      wt.bindHostListeners();
    },
    onKicked: () => {
      addSnack({
        type: "warning",
        message: t("watchTogether.kickedFromSession"),
      });
      void router.push(app_routes.home);
    },
    onJoinPending: async () => {
      if (isHost.value) {
        await loadSessionAndPost();
      }
    },
    onChatMessage: (m) => {
      if (!ffChat.value) return;
      chatMessages.value = [...chatMessages.value, m];
      void nextTick(() => {
        const el = chatScrollRef.value;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    onReaction: (p) => {
      if (!ffReact.value) return;
      pushReactionBubble(p.emoji);
    },
  },
);

async function loadSessionAndPost() {
  loadError.value = null;
  const id = sessionId.value;
  if (!id) {
    loadError.value = "Invalid session";
    return;
  }
  const s = await useApiConnect<undefined, WatchSessionResponse>(
    api_routes.watchTogether.get(id),
    FetchMethod.GET,
  );
  if ("message" in s) {
    addSnack({ ...(s as ApiErr) });
    loadError.value = (s as ApiErr).message;
    return;
  }
  session.value = s;
  if (s.viewerParticipantStatus === "PENDING") {
    post.value = null;
    waitingForApproval.value = true;
    return;
  }
  waitingForApproval.value = false;
  const p = await postsStore.findPostById(s.post.id, { network: true });
  post.value = p;
}

async function copyInviteLink() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const path = app_routes.watchTogether.session(sessionId.value);
  const url = `${origin}${path}`;
  try {
    await navigator.clipboard.writeText(url);
    addSnack({
      type: "success",
      message: t("watchTogether.linkCopied"),
    });
  } catch {
    addSnack({ type: "error", message: t("watchTogether.copyFailed") });
  }
}

async function shareViaDm() {
  await copyInviteLink();
  void router.push(app_routes.messages.new);
  addSnack({
    type: "info",
    message: t("watchTogether.pasteInDm"),
    timeout: 8000,
  });
}

async function endSession() {
  if (!sessionId.value) return;
  const res = await useApiConnect<undefined, { ended: boolean }>(
    api_routes.watchTogether.end(sessionId.value),
    FetchMethod.POST,
  );
  if ("message" in res) {
    addSnack({ ...(res as ApiErr) });
    return;
  }
  addSnack({
    type: "success",
    message: t("watchTogether.ended"),
  });
  void router.push(app_routes.home);
}

async function approveJoiner(participantUserId: string) {
  const id = sessionId.value;
  if (!id) return;
  const res: unknown = await useApiConnect<undefined, unknown>(
    api_routes.watchTogether.approve(id, participantUserId),
    FetchMethod.POST,
  );
  if (
    res &&
    typeof res === "object" &&
    "message" in res &&
    "type" in res &&
    (res as ApiErr).type === "error"
  ) {
    addSnack({ ...(res as ApiErr) });
    return;
  }
  await loadSessionAndPost();
}

async function rejectJoiner(participantUserId: string) {
  const id = sessionId.value;
  if (!id) return;
  const res: unknown = await useApiConnect<undefined, unknown>(
    api_routes.watchTogether.reject(id, participantUserId),
    FetchMethod.POST,
  );
  if (
    res &&
    typeof res === "object" &&
    "message" in res &&
    "type" in res &&
    (res as ApiErr).type === "error"
  ) {
    addSnack({ ...(res as ApiErr) });
    return;
  }
  await loadSessionAndPost();
}

function submitChat() {
  wt.sendChatMessage(chatDraft.value);
  chatDraft.value = "";
}

function sendQuickReaction(emoji: string) {
  wt.sendReaction(emoji);
}

onBeforeMount(() => {
  if (!ff.enabled("social.watchTogether")) {
    void router.replace(app_routes.home);
  }
});

onMounted(async () => {
  if (!ff.enabled("social.watchTogether")) return;
  connecting.value = true;
  try {
    await loadSessionAndPost();
    if (loadError.value || !session.value) return;
    await nextTick();
    await nextTick();
    const ack = await wt.connect();
    socketJoinedOk.value = ack.ok;
    if (!ack.ok && ack.pendingApproval) {
      waitingForApproval.value = true;
    }
    if (ack.ok && ffChat.value) {
      chatMessages.value = await wt.fetchChatHistory(100);
    }
    await nextTick();
    wt.bindHostListeners();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    loadError.value = msg;
    addSnack({ type: "error", message: msg });
  } finally {
    connecting.value = false;
  }
});

watch(
  () => [videoUrl.value, videoPlayerRef.value] as const,
  () => {
    void nextTick(() => wt.bindHostListeners());
  },
);
</script>

<template>
  <div
    class="mx-auto flex max-w-3xl flex-col gap-4 px-3 pb-8 pt-4 lg:pt-8"
    :aria-busy="connecting"
  >
    <header class="flex flex-wrap items-center gap-2">
      <h1
        class="text-heading text-base-900 dark:text-base-100 min-w-0 flex-1 text-lg font-semibold"
      >
        {{ t("watchTogether.title") }}
      </h1>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="focus-visible:ring-violet/60 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          @click="copyInviteLink"
        >
          <Icon icon="line-md:link" class="text-lg" aria-hidden="true" />
          {{ t("watchTogether.copyLink") }}
        </button>
        <button
          type="button"
          class="focus-visible:ring-violet/60 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          @click="shareViaDm"
        >
          <Icon icon="line-md:chat-bubble" class="text-lg" aria-hidden="true" />
          {{ t("watchTogether.shareDm") }}
        </button>
        <button
          v-if="isHost"
          type="button"
          class="focus-visible:ring-violet/60 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 focus-visible:outline focus-visible:ring-2 dark:border-red-900 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950/40"
          @click="endSession"
        >
          <Icon
            icon="line-md:close-circle"
            class="text-lg"
            aria-hidden="true"
          />
          {{ t("watchTogether.endSession") }}
        </button>
      </div>
    </header>

    <section
      v-if="
        isHost && ffHostApproval && hostPendingJoiners.length && sessionApproved
      "
      class="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40"
      :aria-label="t('watchTogether.pendingRequests')"
    >
      <p class="text-sub mb-2 text-xs font-medium uppercase tracking-wide">
        {{ t("watchTogether.pendingRequests") }}
      </p>
      <ul class="flex flex-col gap-2">
        <li
          v-for="row in hostPendingJoiners"
          :key="row.userId"
          class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-2 dark:bg-gray-900"
        >
          <span class="flex items-center gap-2 text-sm font-medium">
            <img
              :src="row.user.img"
              :alt="row.user.name ?? row.user.username ?? ''"
              class="h-8 w-8 rounded-full object-cover"
              width="32"
              height="32"
            />
            {{ row.user.name?.trim() || `@${row.user.username}` }}
          </span>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
              @click="approveJoiner(row.userId)"
            >
              {{ t("watchTogether.approve") }}
            </button>
            <button
              type="button"
              class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-200"
              @click="rejectJoiner(row.userId)"
            >
              {{ t("watchTogether.reject") }}
            </button>
          </div>
        </li>
      </ul>
    </section>

    <section
      v-if="participants?.participants?.length"
      class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50"
      :aria-label="t('watchTogether.participants')"
    >
      <p class="text-sub mb-2 text-xs font-medium uppercase tracking-wide">
        {{ t("watchTogether.participants") }}
      </p>
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="u in participants.participants"
          :key="u.id"
          class="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-sm dark:bg-gray-800"
        >
          <img
            :src="u.img"
            :alt="u.name ?? u.username ?? ''"
            class="h-8 w-8 rounded-full object-cover"
            width="32"
            height="32"
          />
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ u.name?.trim() || `@${u.username}` }}
          </span>
          <span
            v-if="u.id === participants.hostId"
            class="text-violet dark:text-violet-300 text-xs font-semibold"
          >
            {{ t("watchTogether.host") }}
          </span>
        </li>
      </ul>
    </section>

    <div
      v-if="loadError"
      class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
      role="alert"
    >
      {{ loadError }}
    </div>

    <div
      v-else-if="waitingForApproval && !isHost"
      class="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/50"
      role="status"
    >
      <Icon
        icon="svg-spinners:ring-resize"
        class="text-violet mx-auto mb-3 text-3xl"
        aria-hidden="true"
      />
      <p class="text-base-900 dark:text-base-100 font-medium">
        {{ t("watchTogether.waitingForHost") }}
      </p>
      <p class="text-sub mt-2 text-sm">
        {{ t("watchTogether.waitingHint") }}
      </p>
    </div>

    <div
      v-else-if="videoUrl"
      class="bg-base-white relative aspect-video w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10"
    >
      <AppVideoRender
        ref="videoPlayerRef"
        :video="videoUrl"
        :controls="true"
        :autoplay="false"
        :loop-video="false"
        class="h-full w-full"
      />
      <div
        class="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <span
          v-for="b in reactionBubbles"
          :key="b.id"
          class="absolute animate-bounce text-3xl drop-shadow-md"
          :style="{
            left: `${b.leftPct}%`,
            top: `${b.topPct}%`,
            transform: 'translate(-50%, -50%)',
          }"
        >
          {{ b.emoji }}
        </span>
      </div>
      <div
        v-if="ffReact && socketJoinedOk && sessionApproved"
        class="pointer-events-auto absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/45 px-2 py-1"
      >
        <button
          v-for="em in quickReactionEmojis"
          :key="em"
          type="button"
          class="rounded-full px-2 py-0.5 text-lg hover:bg-white/20"
          :aria-label="em"
          @click="sendQuickReaction(em)"
        >
          {{ em }}
        </button>
      </div>
    </div>

    <AppEmptyData
      v-else-if="post && !videoUrl && sessionApproved"
      :message="t('watchTogether.noVideo')"
    />

    <section
      v-if="ffChat && socketJoinedOk && sessionApproved"
      class="rounded-xl border border-gray-200 dark:border-gray-700"
      :aria-label="t('watchTogether.chatTitle')"
    >
      <p
        class="text-sub border-b border-gray-200 px-3 py-2 text-xs font-medium uppercase dark:border-gray-700"
      >
        {{ t("watchTogether.chatTitle") }}
      </p>
      <div
        ref="chatScrollRef"
        class="max-h-48 overflow-y-auto px-3 py-2"
        tabindex="-1"
      >
        <p class="sr-only" aria-live="polite">
          {{ t("watchTogether.newChatMessage") }}
        </p>
        <ul class="flex flex-col gap-2">
          <li
            v-for="m in chatMessages"
            :key="m.id"
            class="text-sm text-gray-900 dark:text-gray-100"
          >
            <span class="font-semibold text-violet-600 dark:text-violet-400">
              {{ m.user.name?.trim() || `@${m.user.username}` }}:
            </span>
            {{ m.body }}
          </li>
        </ul>
      </div>
      <form
        class="flex gap-2 border-t border-gray-200 p-2 dark:border-gray-700"
        @submit.prevent="submitChat"
      >
        <input
          v-model="chatDraft"
          type="text"
          class="focus:ring-violet/60 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          :placeholder="t('watchTogether.chatPlaceholder')"
          maxlength="2000"
          autocomplete="off"
        />
        <button
          type="submit"
          class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          {{ t("watchTogether.chatSend") }}
        </button>
      </form>
    </section>

    <div
      v-if="connecting"
      class="text-sub flex items-center justify-center gap-2 py-8"
      role="status"
    >
      <Icon
        icon="svg-spinners:ring-resize"
        class="text-violet text-2xl"
        aria-hidden="true"
      />
      {{ t("common.loading") }}
    </div>
  </div>
</template>
