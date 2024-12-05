<script lang="ts" setup>
interface Props {
  video: string;
  controls?: boolean;
  autoplay?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="h-full w-full">
    <video
      class=""
      :class="{
        '!w-full h-full object-cover': !props.controls,
        'mx-auto': props.controls,
      }"
      :src="props.video"
      :controls="props.controls"
      :autoplay="props.autoplay"
      loop
      muted
    />
  </div>
</template>
