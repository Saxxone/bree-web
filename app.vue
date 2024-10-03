<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
const globalStore = useGlobalStore();
const { closeSnack } = globalStore;
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
