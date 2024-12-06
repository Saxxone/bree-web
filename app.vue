<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
const globalStore = useGlobalStore();
const { closeSnack } = globalStore;

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
  function gtag() {
    //@ts-expect-error gtag is loaded externally
    dataLayer.push(arguments);
  }
  //@ts-expect-error gtag is loaded externally
  gtag("js", new Date());

  //@ts-expect-error gtag is loaded externally
  gtag("config", "G-9SMJ6QLH4J");
}

onMounted(() => {
  appendGtag();
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
