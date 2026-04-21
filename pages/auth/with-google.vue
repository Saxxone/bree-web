<script setup lang="ts">
/**
 * Reserved route for Google OAuth return / deep links.
 * One Tap completes on /login or /signup; this page forwards to sign-in.
 */
import routes from "~/utils/routes";

definePageMeta({
  layout: "base",
});

onMounted(() => {
  navigateTo(routes.login, { replace: true });
});
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-12 text-center text-sm text-gray-600">
    Redirecting to sign in…
  </div>
</template>
