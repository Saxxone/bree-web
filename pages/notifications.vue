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
const { notifications, hasUnreadNotifications } =
  storeToRefs(notificationStore);

const top_bar = ref<HTMLElement | null>(null);
const loaded = ref(false);

onBeforeMount(() => {
  page_title.value = t("notifications.page_title");
});

onMounted(() => {
  top_bar.value = document.getElementById("top-bar");
  loaded.value = true;
  void notificationStore.markAllNotificationsRead();
});

function markAllRead() {
  void notificationStore.markAllNotificationsRead();
}
</script>

<template>
  <div class="pt-6">
    <div v-if="loaded && top_bar">
      <Teleport :to="top_bar">
        <div
          class="mx-auto flex w-full min-w-0 max-w-full items-center justify-between gap-2 pr-1"
        >
          <p class="text-main min-w-0 shrink truncate text-base font-medium">
            {{ t("notifications.page_title") }}
          </p>
          <button
            v-if="hasUnreadNotifications"
            type="button"
            class="shrink-0 text-sm font-medium text-violet-500 hover:text-violet-400"
            @click="markAllRead"
          >
            {{ t("notifications.mark_all_read") }}
          </button>
        </div>
      </Teleport>
    </div>

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
