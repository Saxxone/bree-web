<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import { useNotificationStore } from "./store/notification";

const globalStore = useGlobalStore();
const { closeSnack } = globalStore;
const authStore = useAuthStore();
const { initializeAuth } = authStore;
const notificationStore = useNotificationStore();

useHead({
  bodyAttrs: {
    onload: function gtmBodyOnLoad() {
      //append only in prod
      if (process.env.NODE_ENV === "development") return;
      const noscript = document.createElement("noscript");
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-KMH2DRM8";
      iframe.height = "0";
      iframe.width = "0";
      iframe.style.display = "none";
      iframe.style.visibility = "hidden";
      noscript.appendChild(iframe);
      document.body.insertBefore(noscript, document.body.firstChild);
    },
  },
});

function appendGtag() {
  //append only in prod
  if (process.env.NODE_ENV === "development") return;

  //@ts-expect-error gtag is loaded externally
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    //@ts-expect-error gtag is loaded externally
    dataLayer.push(args);
  }

  gtag("js", new Date());

  gtag("config", "G-9SMJ6QLH4J");
}

async function getNotifications() {
  await notificationStore.fetchNotifications();
}

onMounted(() => {
  initializeAuth();
  appendGtag();
  getNotifications();
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
      <AppSnackBar
        v-for="(item, index) in globalStore.snack_bars"
        :key="index"
        :snack="item"
        @close="closeSnack(index)"
      />
    </NuxtLayout>
  </div>
</template>
