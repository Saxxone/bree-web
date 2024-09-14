<script lang="ts" setup>
import { type HTMLInputType } from "~/types/types";

interface Props {
  name: string;
  id?: string;
  prependIcon?: string;
  appendIcon?: string;
  placeholder?: string;
  inputType?: HTMLInputType;
}

const props = defineProps<Props>();

const model = defineModel<string>();

const emits = defineEmits(["append-click", "prepend-click"]);
</script>

<template>
  <div class="flex items-center bg-white p-4 rounded-lg mb-4">
    <span
      @click="$emit('prepend-click')"
      class="material-symbols-rounded text-gray-400 font-xs inline-block mr-2"
      v-if="props.prependIcon"
    >
      {{ props.prependIcon }}
    </span>
    <input
      :name="name"
      :id="id"
      :type="inputType"
      v-model="model"
      :placeholder="props.placeholder"
      class="placeholder:text-sm outline-none w-full"
    />
    <span
      @click="$emit('append-click')"
      class="material-symbols-rounded inline-block text-gray-400 font-xs ml-auto"
      v-if="props.appendIcon"
    >
      {{ props.appendIcon }}
    </span>
  </div>
</template>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
}
</style>
