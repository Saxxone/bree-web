<script lang="ts" setup>
interface Props {
  img: string;
}

const props = defineProps<Props>();
const image = useImage();
</script>

<template>
  <div class="h-full w-full">
    <NuxtImg
      :src="props.img"
      :placeholder="image(props.img)"
      class="object-cover h-full w-full"
    />
  </div>
</template>
