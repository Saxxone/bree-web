<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
const globalStore = useGlobalStore();
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
      <AppSnackBar
        v-for="(item, index) in globalStore.snack_bars"
        :key="index"
        :snack="item"
        @close="globalStore.closeSnack(index)"
      />
    </NuxtLayout>
  </div>
</template>
