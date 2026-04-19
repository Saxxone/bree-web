<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useAuthStore } from "~/store/auth";
import { useNotificationStore } from "~/store/notification";
import app_routes from "~/utils/routes";

const { t } = useI18n();
const currentRoute = useRoute();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const notificationStore = useNotificationStore();
const { hasUnreadNotifications } = storeToRefs(notificationStore);
const pages = ref([
  {
    name: t("navigation.home"),
    route: app_routes.home,
    icon: "line-md:home-simple-twotone",
    active: false,
  },
  {
    name: t("navigation.explore"),
    route: app_routes.explore,
    icon: "line-md:search-twotone",
    active: false,
  },
  {
    name: t("navigation.history"),
    route: app_routes.history,
    icon: "line-md:backup-restore",
    active: false,
  },
  {
    name: t("navigation.notifications"),
    route: app_routes.notifications,
    icon: "line-md:bell-twotone-loop",
    active: false,
  },
  {
    name: t("navigation.messages"),
    route: app_routes.messages.rooms,
    icon: "line-md:chat-bubble-twotone",
    active: false,
  },
  {
    name: t("navigation.profile"),
    route: app_routes.profile.view(user.value.id),
    icon: "line-md:person-twotone",
    active: false,
  },
]);

function setActive(index: number) {
  pages.value.forEach((item) => {
    item.active = false;
  });
  pages.value[index].active = true;
}

watch(
  () => currentRoute.path,
  () => {
    pages.value.forEach((item) => {
      item.active = false;
    });

    const currentPage = pages.value.find((item) => {
      if (item.route === app_routes.history) {
        return currentRoute.path === item.route;
      }
      return item.route === currentRoute.path;
    });

    if (currentPage) {
      currentPage.active = true;
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="text-main col-span-3 hidden h-dvh py-6 lg:block">
    <NuxtLink to="/" class="mb-8 flex items-center space-x-2 p-4">
      <img src="/afovid.svg" alt="logo" class="h-5 w-auto rounded-lg" />
      <h1 class="text-xl font-bold">afovid</h1>
    </NuxtLink>

    <div v-for="(item, index) in pages" :key="item.name">
      <NuxtLink
        :to="item.route"
        class="flex cursor-pointer space-x-3 rounded-md p-4 transition-colors duration-300 ease-out hover:bg-gray-900"
        :class="{ 'bg-gray-900': item.active, 'text-sub': !item.active }"
        @click="setActive(index)"
      >
        <span class="relative inline-flex shrink-0 self-center">
          <Icon
            :key="item.active ? item.icon + '-active' : item.icon"
            :icon="item.icon"
            class="w-8 text-2xl"
            :class="{
              'text-violet-500': item.active,
              'text-sub': !item.active,
            }"
          />
          <span
            v-if="
              hasUnreadNotifications && item.route === app_routes.notifications
            "
            class="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-zinc-950"
            aria-hidden="true"
          />
        </span>
        <p
          class="text-lg"
          :class="{ 'text-violet-500': item.active, 'text-sub': !item.active }"
        >
          {{ item.name }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
