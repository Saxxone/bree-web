<script setup lang="ts">
const router = useRouter();

async function goBack() {
  router.go(-1);
}
</script>

<template>
  <div
    class="bg-white w-11 h-11 rounded-lg flex items-center justify-center"
    @click="goBack"
  >
    <span class="material-symbols-rounded font-5xl"> chevron_backward </span>
  </div>
</template>
