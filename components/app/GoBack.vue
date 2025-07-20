<script setup lang="ts">
import { Icon } from "@iconify/vue";
const props = defineProps<{ route?: string }>();

const router = useRouter();

async function goBack() {
  if (props.route) router.push(props.route);
  else router.go(-1);
}
</script>

<template>
  <div
    class="bg-base-white flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg"
    @click="goBack"
  >
    <Icon icon="line-md:arrow-left" class="text-xl" />
  </div>
</template>
