<script lang="ts" setup>

interface Props {
  text: string
}
const props = defineProps<Props>()
</script>

<template>
  <div>
    <p class="text-gray-500 py-5">{{ $props.text }}</p>
  </div>
</template>
