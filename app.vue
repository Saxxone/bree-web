<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import { useNotificationStore } from "./store/notification";

const globalStore = useGlobalStore();
const { closeSnack } = globalStore;
const authStore = useAuthStore();
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

watch(
  () => authStore.isAuthenticated,
  async (signedIn) => {
    if (signedIn) await notificationStore.fetchNotifications();
    else notificationStore.reset();
  },
  { immediate: true },
);

onMounted(() => {
  appendGtag();
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
      <div
        class="pointer-events-none fixed right-4 top-2 isolate z-50 w-[min(100%-2rem,24rem)] sm:right-6"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <AppSnackBar
          v-for="(item, index) in globalStore.snack_bars"
          :key="index"
          class="pointer-events-auto absolute right-0 top-0 w-full transition-transform duration-200"
          :style="{
            zIndex: index + 1,
            transform: `translateX(${(globalStore.snack_bars.length - 1 - index) * 8}px)`,
          }"
          :snack="item"
          @close="closeSnack(index)"
        />
      </div>
    </NuxtLayout>
  </div>
</template>
