<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useAppMainNav } from "~/composables/useAppMainNav";
import { useNotificationStore } from "~/store/notification";
import { useChatUnreadStore } from "~/store/chatUnread";

const notificationStore = useNotificationStore();
const { hasUnreadNotifications } = storeToRefs(notificationStore);
const chatUnreadStore = useChatUnreadStore();
const { hasUnreadMessages } = storeToRefs(chatUnreadStore);
const { items, isItemActive } = useAppMainNav("sidebar");
</script>

<template>
  <div class="text-main col-span-3 hidden h-dvh py-6 lg:block">
    <NuxtLink to="/" class="mb-8 flex items-center space-x-2 p-4">
      <img src="/afovid.svg" alt="logo" class="h-5 w-auto rounded-lg" />
      <h1 class="text-xl font-bold">afovid</h1>
    </NuxtLink>

    <div v-for="item in items" :key="item.id">
      <NuxtLink
        :to="item.route"
        class="flex cursor-pointer space-x-3 rounded-md p-4 transition-colors duration-300 ease-out hover:bg-gray-900"
        :class="{
          'bg-gray-900': isItemActive(item),
          'text-sub': !isItemActive(item),
        }"
      >
        <span class="relative inline-flex shrink-0 self-center">
          <Icon
            :key="isItemActive(item) ? item.icon + '-active' : item.icon"
            :icon="item.icon"
            class="w-8 text-2xl"
            :class="{
              'text-violet-500': isItemActive(item),
              'text-sub': !isItemActive(item),
            }"
          />
          <span
            v-if="hasUnreadNotifications && item.id === 'notifications'"
            class="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-zinc-950"
            aria-hidden="true"
          />
          <span
            v-if="hasUnreadMessages && item.id === 'messages'"
            class="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-zinc-950"
            aria-hidden="true"
          />
        </span>
        <p
          class="text-lg"
          :class="{
            'text-violet-500': isItemActive(item),
            'text-sub': !isItemActive(item),
          }"
        >
          {{ item.name }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
