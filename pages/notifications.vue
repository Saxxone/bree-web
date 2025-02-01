<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { useNotificationStore } from "~/store/notification";
import type { Author } from "~/types/user";

definePageMeta({
  layout: "social",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const notificationStore = useNotificationStore();
const { page_title } = storeToRefs(globalStore);
const { notifications } = storeToRefs(notificationStore);

async function getNotifications() {
  await notificationStore.fetchNotifications();
}

onBeforeMount(() => {
  page_title.value = t("notifications.page_title");
});

onMounted(() => {
  getNotifications();
});
</script>

<template>
  <div>
    <AppEmptyData
      v-if="!notifications.length"
      :message="t('notifications.no_results')"
    />

    <div v-else>
      <NotificationsSingleNotification
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        :author="notification.author as Author"
      />
    </div>
  </div>
</template>
