<script lang="ts" setup>
interface Props {
  content: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div>
    <p>{{ props.content }}</p>
  </div>
</template>
