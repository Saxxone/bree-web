<script lang="ts" setup>
interface Props {
  img: string;
}

const props = defineProps<Props>();
const img = useImage();
</script>

<template>
  <div>
    <!-- <NuxtImg  :src="props.img" :placeholder="img(props.img, { h: 100, f: 'png', blur: 2, q: 50 })" /> -->

    <img :src="`/assets/${props.img}`" alt="" class="object-fit" />
  </div>
</template>
