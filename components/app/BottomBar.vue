<script lang="ts" setup>
import app_routes from "~/utils/routes";

const { t } = useI18n();
const currentRoute = useRoute();
const pages = ref([
  {
    name: t("navigation.home"),
    route: app_routes.home,
    icon: "home",
    active: false,
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
    route: app_routes.messages.rooms,
    icon: "chat_bubble",
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
        class="flex items-center justify-center w-1/4 h-16 p-3 cursor-pointer"
        @click="setActive(index)"
      >
        <IconPicker class="text-2xl" :class="{
            'filled text-indigo-500': item.active,
            'text-sub': !item.active,
          }" :icon="item.icon" />
      </NuxtLink>
    </div>
  </div>
</template>
