<script>
import app_routes from "~/utils/routes";

const router = useRouter();

onMounted(() => {
  router.push(app_routes.home);
});
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center">
    <div class="text-center">
      <img src="/bree.svg" alt="logo" class="h-20 rounded-md w-auto" />
      <p class="text-main py-2">Be Free!</p>
    </div>
  </div>
</template>
