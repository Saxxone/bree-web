<script setup lang="ts">
import { Icon } from "@iconify/vue";
const props = withDefaults(
  defineProps<{ route?: string; tone?: "default" | "search" }>(),
  { tone: "default" },
);

const router = useRouter();

async function goBack() {
  if (props.route) router.push(props.route);
  else router.go(-1);
}
</script>

<template>
  <div
    :class="[
      'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md',
      props.tone === 'search' ? 'bg-[#1a202c]' : 'bg-base-white',
    ]"
    @click="goBack"
  >
    <Icon
      icon="line-md:arrow-left"
      :class="props.tone === 'search' ? 'text-xl text-white' : 'text-xl'"
    />
  </div>
</template>
