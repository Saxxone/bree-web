import { getChatSocket } from "~/composables/chatSocketSingleton";
import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";

export type WatchParticipantUser = {
  id: string;
  name: string;
  username: string;
  img: string;
  verified?: boolean;
  email?: string;
};

export type WatchParticipantPayload = {
  hostId: string;
  participants: WatchParticipantUser[];
};

export type WatchJoinPendingSocketUser = WatchParticipantUser;

export type WatchSessionChatMessage = {
  id: string;
  sessionId: string;
  userId: string;
  body: string;
  createdAt: string;
  user: WatchParticipantUser;
};

export type WatchJoinAck = {
  sessionId: string;
  ok: boolean;
  pendingApproval?: boolean;
  position: number;
  isPlaying: boolean;
  hostId: string;
};

const SYNC_TOLERANCE_SEC = 2;

export function useWatchTogether(
  getSessionId: () => string | undefined,
  getVideoEl: () => HTMLVideoElement | null,
  callbacks: {
    onEnded?: () => void;
    onParticipants?: (p: WatchParticipantPayload) => void;
    onInviteApproved?: () => void;
    onKicked?: () => void;
    onJoinPending?: (p: {
      sessionId: string;
      user: WatchJoinPendingSocketUser;
    }) => void;
    onChatMessage?: (m: WatchSessionChatMessage) => void;
    onReaction?: (p: {
      sessionId: string;
      userId: string;
      emoji: string;
      clientTs: number;
    }) => void;
  } = {},
) {
  let hostCleanup: (() => void) | undefined;
  let detachSocket: (() => void) | undefined;
  let lastPlaybackEmit = 0;

  const authStore = useAuthStore();

  function applyRemote(
    position: number,
    playing: boolean,
    updatedByUserId?: string,
  ) {
    const selfId = authStore.user?.id;
    if (updatedByUserId && selfId && updatedByUserId === selfId) return;
    const el = getVideoEl();
    if (!el) return;
    if (
      Number.isFinite(position) &&
      Math.abs(el.currentTime - position) > SYNC_TOLERANCE_SEC
    ) {
      try {
        el.currentTime = position;
      } catch {
        /* seek may fail before metadata */
      }
    }
    if (playing && el.paused) void el.play().catch(() => {});
    if (!playing && !el.paused) el.pause();
  }

  async function waitForSocketConnect(
    s: ReturnType<typeof getChatSocket>,
    ms: number,
  ): Promise<void> {
    if (s.connected) return;
    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(
        () => reject(new Error("Socket connect timeout")),
        ms,
      );
      s.once("connect", () => {
        window.clearTimeout(t);
        resolve();
      });
      s.connect();
    });
  }

  function refreshSocketAuthHandshake(): void {
    const cryptoStore = useCryptoStore();
    const s = getChatSocket();
    s.auth = {
      token: authStore.access_token ?? "",
      deviceId: cryptoStore.deviceId ?? "",
    };
  }

  async function resyncPlaybackFromServer(): Promise<void> {
    const sid = getSessionId();
    if (!sid) return;
    const s = getChatSocket();
    if (!s.connected) return;
    try {
      const row = await s
        .timeout(12_000)
        .emitWithAck("watch:state-request", { sessionId: sid });
      if (
        row &&
        typeof row === "object" &&
        "position" in row &&
        "isPlaying" in row
      ) {
        const r = row as { position: number; isPlaying: boolean };
        applyRemote(Number(r.position), Boolean(r.isPlaying));
      }
    } catch {
      /* socket busy or transient */
    }
  }

  function scheduleJoinPlaybackSync(ack: WatchJoinAck): void {
    const apply = () => applyRemote(ack.position, ack.isPlaying);
    apply();
    requestAnimationFrame(() => {
      apply();
      requestAnimationFrame(apply);
    });
    window.setTimeout(apply, 200);
    window.setTimeout(() => {
      apply();
      void resyncPlaybackFromServer();
    }, 650);
    window.setTimeout(() => {
      apply();
      void resyncPlaybackFromServer();
    }, 1700);
  }

  async function emitWatchJoinAck(
    s: ReturnType<typeof getChatSocket>,
    sid: string,
  ): Promise<WatchJoinAck> {
    const ack = await s
      .timeout(20_000)
      .emitWithAck("watch:join", { sessionId: sid });
    if (ack && typeof ack === "object" && "ok" in ack) {
      const raw = ack as WatchJoinAck & { pendingApproval?: boolean };
      if (raw.ok) {
        return raw;
      }
      if (raw.pendingApproval) {
        return {
          sessionId: sid,
          ok: false,
          pendingApproval: true,
          position: Number(raw.position ?? 0),
          isPlaying: Boolean(raw.isPlaying),
          hostId: String(raw.hostId ?? ""),
        };
      }
    }
    throw new Error("watch:join failed");
  }

  function bindPlaybackListeners() {
    hostCleanup?.();
    hostCleanup = undefined;
    const el = getVideoEl();
    if (!el) return;

    const emit = (playing: boolean) => {
      const id = getSessionId();
      if (!id) return;
      const s = getChatSocket();
      if (!s.connected) return;
      const now = Date.now();
      if (now - lastPlaybackEmit < 90) return;
      lastPlaybackEmit = now;
      s.emit("watch:playback", {
        sessionId: id,
        position: el.currentTime,
        isPlaying: playing,
      });
    };

    const onPlay = () => emit(true);
    const onPause = () => emit(false);
    const onSeeked = () => emit(!el.paused);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("seeked", onSeeked);
    hostCleanup = () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("seeked", onSeeked);
    };
  }

  function attachSocketListeners() {
    const s = getChatSocket();
    const sid = getSessionId();
    if (!sid) return () => {};

    const onState = (payload: {
      sessionId: string;
      position: number;
      isPlaying: boolean;
      updatedByUserId?: string;
    }) => {
      if (payload.sessionId !== sid) return;
      applyRemote(payload.position, payload.isPlaying, payload.updatedByUserId);
    };
    const onPart = (p: WatchParticipantPayload) => {
      callbacks.onParticipants?.(p);
    };
    const onEnded = (payload: { sessionId: string }) => {
      if (payload.sessionId !== sid) return;
      callbacks.onEnded?.();
    };
    const onInviteApproved = (payload: { sessionId: string }) => {
      if (payload.sessionId !== sid) return;
      callbacks.onInviteApproved?.();
    };
    const onKicked = (payload: { sessionId: string }) => {
      if (payload.sessionId !== sid) return;
      callbacks.onKicked?.();
    };
    const onJoinPending = (payload: {
      sessionId: string;
      user: WatchJoinPendingSocketUser;
    }) => {
      if (payload.sessionId !== sid) return;
      callbacks.onJoinPending?.(payload);
    };
    const onChatMessage = (msg: WatchSessionChatMessage) => {
      if (msg.sessionId !== sid) return;
      callbacks.onChatMessage?.(msg);
    };
    const onReaction = (payload: {
      sessionId: string;
      userId: string;
      emoji: string;
      clientTs: number;
    }) => {
      if (payload.sessionId !== sid) return;
      callbacks.onReaction?.(payload);
    };

    s.on("watch:state", onState);
    s.on("watch:participant-update", onPart);
    s.on("watch:ended", onEnded);
    s.on("watch:invite-approved", onInviteApproved);
    s.on("watch:kicked", onKicked);
    s.on("watch:join-pending", onJoinPending);
    s.on("watch:chat-message", onChatMessage);
    s.on("watch:reaction", onReaction);

    return () => {
      s.off("watch:state", onState);
      s.off("watch:participant-update", onPart);
      s.off("watch:ended", onEnded);
      s.off("watch:invite-approved", onInviteApproved);
      s.off("watch:kicked", onKicked);
      s.off("watch:join-pending", onJoinPending);
      s.off("watch:chat-message", onChatMessage);
      s.off("watch:reaction", onReaction);
    };
  }

  async function connect(): Promise<WatchJoinAck> {
    const sid = getSessionId();
    if (!sid) throw new Error("No session id");

    const cryptoStore = useCryptoStore();
    await cryptoStore.init();
    const deviceId = cryptoStore.deviceId?.trim() ?? "";
    if (!deviceId) {
      throw new Error(
        "Register this device under Settings → Security before Watch Together (same as messaging).",
      );
    }

    refreshSocketAuthHandshake();

    detachSocket?.();
    detachSocket = attachSocketListeners();

    const s = getChatSocket();

    let ack: WatchJoinAck;
    try {
      await waitForSocketConnect(s, 25_000);
      ack = await emitWatchJoinAck(s, sid);
    } catch {
      refreshSocketAuthHandshake();
      s.disconnect();
      await new Promise<void>((r) => {
        window.setTimeout(r, 300);
      });
      await waitForSocketConnect(s, 25_000);
      ack = await emitWatchJoinAck(s, sid);
    }

    if (ack.ok) {
      scheduleJoinPlaybackSync(ack);
    }
    bindPlaybackListeners();

    return ack;
  }

  async function fetchChatHistory(
    take = 100,
  ): Promise<WatchSessionChatMessage[]> {
    const sid = getSessionId();
    if (!sid) return [];
    const s = getChatSocket();
    if (!s.connected) return [];
    const res = await s
      .timeout(15_000)
      .emitWithAck("watch:chat-history", { sessionId: sid, take });
    if (res && typeof res === "object" && "messages" in res) {
      return (res as { messages: WatchSessionChatMessage[] }).messages ?? [];
    }
    return [];
  }

  function sendChatMessage(body: string): void {
    const sid = getSessionId();
    if (!sid || !body.trim()) return;
    const s = getChatSocket();
    if (!s.connected) return;
    s.emit("watch:chat-send", { sessionId: sid, body: body.trim() });
  }

  function sendReaction(emoji: string): void {
    const sid = getSessionId();
    if (!sid) return;
    const s = getChatSocket();
    if (!s.connected) return;
    s.emit("watch:react", { sessionId: sid, emoji });
  }

  function leave() {
    const sid = getSessionId();
    if (sid && getChatSocket().connected) {
      getChatSocket().emit("watch:leave", { sessionId: sid });
    }
    detachSocket?.();
    detachSocket = undefined;
    hostCleanup?.();
    hostCleanup = undefined;
  }

  onBeforeUnmount(() => {
    leave();
  });

  return {
    connect,
    leave,
    applyRemote,
    bindPlaybackListeners,
    bindHostListeners: bindPlaybackListeners,
    fetchChatHistory,
    sendChatMessage,
    sendReaction,
  };
}
