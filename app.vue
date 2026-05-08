<script setup lang="ts">
import { useChatInboxListener } from "~/composables/useChatInboxListener";
import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import { useNotificationStore } from "./store/notification";

useChatInboxListener();

const globalStore = useGlobalStore();
const { closeSnack, closeSnackById } = globalStore;
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
        class="pointer-events-none fixed right-4 top-2 z-[100] w-[min(100%-2rem,24rem)] sm:right-6"
        style="position: fixed"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <div class="relative">
          <AppSnackBar
            v-for="(item, renderIndex) in [...globalStore.snack_bars].reverse()"
            :key="item.id ?? renderIndex"
            :class="[
              'pointer-events-auto w-full transition-all duration-300',
              renderIndex > 0 ? 'absolute inset-x-0 top-0' : '',
            ]"
            :style="{
              zIndex: 100 + (globalStore.snack_bars.length - 1 - renderIndex),
              transform: `translateY(${renderIndex * 8}px) scale(${1 - renderIndex * 0.04})`,
              transformOrigin: 'top center',
            }"
            :snack="item"
            @close="
              item.id
                ? closeSnackById(item.id)
                : closeSnack(globalStore.snack_bars.length - 1 - renderIndex)
            "
          />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>
