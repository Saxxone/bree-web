import type { Notification } from "~/types/notification";
import api_routes from "~/utils/api_routes";
import { FetchMethod } from "~/types/types";
import { useGlobalStore } from "./global";

export const useNotificationStore = defineStore("notifications", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;

  const notifications = ref<Notification[]>([]);

  function closenotification(index: number) {
    notifications.value.splice(index, 1);
  }

  function addnotification(notification: Notification) {
    notifications.value.push(notification);
  }

  async function fetchNotifications() {
    const response = await useApiConnect<null, Notification[]>(
      api_routes.files.upload,
      FetchMethod.GET,
    );

    if ("statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return [];
    } else {
      return response;
    }
  }

  return {
    notifications,
    closenotification,
    addnotification,
    fetchNotifications,
  };
});
