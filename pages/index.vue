<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import app_routes from "~/utils/routes";

const router = useRouter();

async function validateUserAuth(): Promise<boolean> {
  //validate user auth token
  return false;
}

onMounted(async () => {
  (await validateUserAuth())
    ? router.push(app_routes.home)
    : router.push(app_routes.login);
});
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <span>
      <img src="/favicon.svg" alt="logo" />
    </span>
  </div>
</template>
