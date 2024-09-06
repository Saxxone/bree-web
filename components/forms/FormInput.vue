<script lang="ts" setup>
interface Props {
  prependIcon?: string;
  appendIcon?: string;
  placeholder?: string;
}
const props = defineProps<Props>();
</script>

<template>
  <div class="flex items-center">
    <span class="material-symbols-rounded" v-if="props.prependIcon">
      {{ props.prependIcon }}
    </span>
    <input type="text"  :placeholder="props.placeholder">
    <span class="material-symbols-rounded" v-if="props.appendIcon">
      {{ props.appendIcon }}
    </span>
  </div>
</template>
