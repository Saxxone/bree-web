<script setup lang="ts">
const props = defineProps<{ route?: string }>();

const router = useRouter();

async function goBack() {
  props.route ? router.push(props.route) : router.go(-1);
}
</script>

<template>
  <div class="bg-white w-11 h-11 rounded-lg flex items-center justify-center" @click="goBack">
    <span class="material-symbols-rounded text-2xl"> chevron_backward </span>
  </div>
</template>
