<script lang="ts" setup>
interface Props {
  img: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div>
    <NuxtImg width="50" height="50" class="avatar" :src="props.img" />
  </div>
</template>
