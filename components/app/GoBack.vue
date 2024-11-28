<script setup lang="ts">
const props = defineProps<{ route?: string }>();

const router = useRouter();

async function goBack() {
  if (props.route) router.push(props.route);
  else router.go(-1);
}
</script>

<template>
  <div
    class="bg-base-white w-11 h-11 rounded-lg flex cursor-pointer items-center justify-center"
    @click="goBack"
  >
  <IconPicker :icon="props.icon" class="text-2xl" />
    
  </div>
</template>
