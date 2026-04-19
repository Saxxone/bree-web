import type { Notification } from "~/types/notification";
import type { Author } from "~/types/user";
import type { DateString, Error } from "~/types/types";
import { FetchMethod } from "~/types/types";
import api_routes from "~/utils/api_routes";
import { useAuthStore } from "./auth";

type ApiNotificationRow = {
  id: string;
  userId: string;
  description: string;
  createdAt: string;
  type?: string;
  read?: boolean;
  postId?: string | null;
  commentId?: string | null;
};

type SseNotificationPayload = {
  id?: string;
  date?: string;
  description?: string;
  author?: Partial<Author>;
  user?: { id?: string };
  type?: string;
  postId?: string | null;
  commentId?: string | null;
  read?: boolean;
};

function mapRowToNotification(row: ApiNotificationRow): Notification {
  return {
    id: row.id,
    date: row.createdAt as DateString,
    description: row.description,
    author: undefined,
    read: row.read ?? false,
    postId: row.postId ?? undefined,
    commentId: row.commentId ?? undefined,
    notificationType: row.type,
    trigger: row.type ? { type: row.type } : undefined,
  };
}

function mapSseToNotification(payload: SseNotificationPayload): Notification {
  const author = payload.author as Author | undefined;
  return {
    id:
      payload.id ??
      `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    date: (payload.date as DateString | undefined) ?? null,
    description: payload.description ?? "",
    author,
    read: payload.read ?? false,
    postId: payload.postId ?? undefined,
    commentId: payload.commentId ?? undefined,
    notificationType: payload.type,
    trigger: undefined,
  };
}

function isError(res: unknown): res is Error {
  return (
    typeof res === "object" &&
    res !== null &&
    "type" in res &&
    (res as Error).type === "error"
  );
}

export const useNotificationStore = defineStore("notifications", () => {
  const authStore = useAuthStore();
  const notifications = ref<Notification[]>([]);
  let eventSource: EventSource | null = null;

  const hasUnreadNotifications = computed(() =>
    notifications.value.some((n) => n.read !== true),
  );

  function closenotification(index: number) {
    notifications.value.splice(index, 1);
  }

  function addnotification(notification: Notification) {
    notifications.value.push(notification);
  }

  function reset() {
    eventSource?.close();
    eventSource = null;
    notifications.value = [];
  }

  function upsertById(item: Notification) {
    const i = notifications.value.findIndex((n) => n.id === item.id);
    if (i >= 0) {
      notifications.value[i] = item;
      return;
    }
    notifications.value.unshift(item);
  }

  function isForCurrentUser(payload: SseNotificationPayload): boolean {
    const recipientId = payload.user?.id;
    const me = authStore.user?.id;
    if (!recipientId || !me) return false;
    return recipientId === me;
  }

  async function loadNotificationsFromApi() {
    if (!authStore.isAuthenticated) return;

    const path = `${api_routes.notifications.list}?skip=0&take=50`;
    const res = await useApiConnect<null, ApiNotificationRow[]>(
      path,
      FetchMethod.GET,
    );

    if (isError(res) || !Array.isArray(res)) return;

    notifications.value = res.map(mapRowToNotification);
  }

  async function markAllNotificationsRead() {
    if (!authStore.isAuthenticated || !hasUnreadNotifications.value) return;

    const res = await useApiConnect<null, { count: number }>(
      api_routes.notifications.readAll,
      FetchMethod.PATCH,
    );

    if (isError(res)) return;

    notifications.value = notifications.value.map((n) => ({
      ...n,
      read: true,
    }));
  }

  function startNotificationStream() {
    const token = authStore.access_token;
    const base = import.meta.env.VITE_API_BASE_URL;
    if (!token || !base || eventSource) return;

    const url = `${base}${api_routes.notifications.get}?token=${encodeURIComponent(token)}`;
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      if (!event.data) return;
      try {
        const raw = JSON.parse(event.data) as SseNotificationPayload;
        if (!isForCurrentUser(raw)) return;
        const mapped = mapSseToNotification(raw);
        upsertById(mapped);
      } catch {
        /* ignore malformed SSE frames */
      }
    };

    eventSource.onerror = () => {
      eventSource?.close();
      eventSource = null;
    };
  }

  async function fetchNotifications() {
    if (!authStore.isAuthenticated) {
      reset();
      return;
    }
    await loadNotificationsFromApi();
    if (import.meta.client) {
      startNotificationStream();
    }
  }

  return {
    notifications,
    hasUnreadNotifications,
    closenotification,
    addnotification,
    fetchNotifications,
    markAllNotificationsRead,
    reset,
  };
});
