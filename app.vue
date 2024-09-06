<script setup lang="ts">
import app_routes from "~/utils/routes";
const router = useRouter();

const routes = app_routes;

onMounted(() => {
  router.push(routes.splash);
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
.material-symbols-rounded {
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}
</style>
