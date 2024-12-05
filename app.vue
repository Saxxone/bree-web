<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
const globalStore = useGlobalStore();
const { closeSnack } = globalStore;

onMounted(() => {
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
