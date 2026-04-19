<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { useNotificationStore } from "~/store/notification";
definePageMeta({
  layout: "social",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const notificationStore = useNotificationStore();
const { page_title } = storeToRefs(globalStore);
const { notifications } = storeToRefs(notificationStore);

onBeforeMount(() => {
  page_title.value = t("notifications.page_title");
});

onMounted(() => {
  void notificationStore.markAllNotificationsRead();
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
        :author="notification.author"
      />
    </div>
  </div>
</template>
