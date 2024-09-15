<script lang="ts" setup>
import app_routes from "~/utils/routes";

const { t } = useI18n();

const pages = ref([
  {
    name: t("navigation.home"),
    route: app_routes.home,
    icon: "home",
    active: true,
  },
  {
    name: t("navigation.explore"),
    route: app_routes.explore,
    icon: "search",
    active: false,
  },
  {
    name: t("navigation.notifications"),
    route: app_routes.notifications,
    icon: "notifications",
    active: false,
  },
  {
    name: t("navigation.messages"),
    route: app_routes.messages,
    icon: "chat_bubble",
    active: false,
  },
]);
</script>

<template>
  <div class="flex items-center bg-white w-full justify-between px-4 py-2">
    <div v-for="item in pages" :key="item.name">
      <NuxtLink
        :to="item.route"
        class="flex items-center justify-center w-1/4 h-16 p-3 cursor-pointer"
      >
        <span
          class="material-symbols-rounded font-3xl"
          :class="{
            'filled text-indigo-500': item.active,
            'text-gray-500': !item.active,
          }"
          >{{ item.icon }}</span
        >
      </NuxtLink>
    </div>
  </div>
</template>
