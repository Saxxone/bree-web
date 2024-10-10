<script lang="ts" setup>
import type { Notification } from "~/types/notification";
import type { Author } from "~/types/user";
import { useGlobalStore } from "~/store/global";

interface Props {
  notifications: Notification[];
}

definePageMeta({
  layout: "social",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

const notifications = ref<Notification[]>([]);

onBeforeMount(() => {
  page_title.value = t("notifications.page_title");
});
</script>

<template>
  <div>
    <AppEmptyData
      :message="t('notifications.no_results')"
      v-if="!notifications.length"
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
