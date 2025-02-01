import type { Notification } from "~/types/notification";
import api_routes from "~/utils/api_routes";
import { useAuthStore } from "./auth";

export const useNotificationStore = defineStore("notifications", () => {
  const authStore = useAuthStore();
  const notifications = ref<Notification[]>([]);

  function closenotification(index: number) {
    notifications.value.splice(index, 1);
  }

  function addnotification(notification: Notification) {
    notifications.value.push(notification);
  }

  async function fetchNotifications() {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL + api_routes.notifications.get}?token=${authStore.access_token}`,
    );

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      notifications.value.push(notification);
    };

    eventSource.onerror = (error) => {
      throw new Error("SSE error:" + JSON.stringify(error));
    };
  }

  return {
    notifications,
    closenotification,
    addnotification,
    fetchNotifications,
  };
});
