<script lang="ts" setup>
interface Props {
  img: string;
}

const props = defineProps<Props>();
const img = useImage();
</script>

<template>
  <div class="h-full w-full">
    <NuxtImg :src="props.img" :placeholder="img(props.img)" class="object-cover h-full w-full" />
    <!-- <img :src="props.img" alt="" class="object-cover h-full w-full" /> -->
  </div>
</template>
