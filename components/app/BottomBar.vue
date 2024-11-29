<script lang="ts" setup>
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
  <div class="flex items-center bg-base-white w-full justify-between px-4 py-2">
    <div v-for="(item, index) in pages" :key="item.name">
      <NuxtLink
        :to="item.route"
        class="items-center w-1/4 h-16 p-3 grid text-center cursor-pointer"
        @click="setActive(index)"
      >
        <Icon
          :icon="item.icon"
          class="text-2xl self-center"
          :class="{ ' text-indigo-500': item.active, 'text-sub': !item.active }"
        />
      </NuxtLink>
    </div>
  </div>
</template>
