<script setup lang="ts">
import app_routes from "~/utils/routes";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
const currentRoute = useRoute();
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

    const currentPage = pages.value.find(
      (item) => item.route === currentRoute.path,
    );

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
  <div class="h-dvh col-span-3 hidden lg:block text-main py-6">
    <NuxtLink to="/" class="flex items-center space-x-2 mb-8 p-4">
      <img src="/bree.svg" alt="logo" class="h-5 rounded-lg w-auto" />
      <h1 class="text-xl font-bold">Bree</h1>
    </NuxtLink>

    <div v-for="(item, index) in pages" :key="item.name">
      <NuxtLink
        :to="item.route"
        class="flex space-x-3 p-4 cursor-pointer hover:bg-gray-900 rounded-md ease-out transition-colors duration-300"
        :class="{ ' bg-gray-900': item.active, 'text-sub': !item.active }"
        @click="setActive(index)"
      >
        <Icon
          :key="item.active ? item.icon + '-active' : item.icon"
          :icon="item.icon"
          class="text-2xl w-8 self-center"
          :class="{ ' text-indigo-500': item.active, 'text-sub': !item.active }"
        />
        <p
          class="text-lg"
          :class="{ ' text-indigo-500': item.active, 'text-sub': !item.active }"
        >
          {{ item.name }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
