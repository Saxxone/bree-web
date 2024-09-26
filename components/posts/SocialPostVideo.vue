<script lang="ts" setup>
interface Props {
  video: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div>
    <video class="" :src="`/assets/${props.video}`" controls autoplay loop muted />
  </div>
</template>
