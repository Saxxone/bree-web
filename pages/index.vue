<script setup lang="ts">
import app_routes from "~/utils/routes";

const router = useRouter();

onMounted(() => {
  router.push(app_routes.home);
});
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center">
    <div class="text-center">
      <img src="/bree.svg" alt="logo" class="h-20 w-auto rounded-lg" />
      <p class="text-main py-2">Be Free!</p>
    </div>
  </div>
</template>
