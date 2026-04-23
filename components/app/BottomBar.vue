<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useAppMainNav } from "~/composables/useAppMainNav";
import { useNotificationStore } from "~/store/notification";
import { useChatUnreadStore } from "~/store/chatUnread";

const notificationStore = useNotificationStore();
const { hasUnreadNotifications } = storeToRefs(notificationStore);
const chatUnreadStore = useChatUnreadStore();
const { hasUnreadMessages } = storeToRefs(chatUnreadStore);
const { items, isItemActive } = useAppMainNav("bottom");
</script>

<template>
  <div class="bg-base-white flex w-full items-center justify-between px-2 py-2">
    <div v-for="item in items" :key="item.id" class="min-w-0 flex-1">
      <NuxtLink
        :to="item.route"
        class="grid h-16 w-full cursor-pointer items-center p-2 text-center"
      >
        <span class="relative inline-flex justify-self-center">
          <Icon
            :key="isItemActive(item) ? item.icon + '-active' : item.icon"
            :icon="item.icon"
            class="text-2xl"
            :class="{
              'text-violet-500': isItemActive(item),
              'text-sub': !isItemActive(item),
            }"
          />
          <span
            v-if="hasUnreadNotifications && item.id === 'notifications'"
            class="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white"
            aria-hidden="true"
          />
          <span
            v-if="hasUnreadMessages && item.id === 'messages'"
            class="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white"
            aria-hidden="true"
          />
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
