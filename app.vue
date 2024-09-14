<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
const globalStore = useGlobalStore();
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
      <AppSnackBar
        @close="globalStore.closeSnack(index)"
        v-for="(item, index) in globalStore.snack_bars"
        :key="index"
        :snack="item"
      />
    </NuxtLayout>
  </div>
</template>
