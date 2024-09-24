<script lang="ts" setup>
import { HTMLInputType } from "~/types/types";

interface Props {
  name: string;
  id?: string;
  prependIcon?: string;
  appendIcon?: string;
  placeholder?: string;
  rows?: number;
  inputType?: HTMLInputType;
  focus?: boolean;
}

const props = defineProps<Props>();

const model = defineModel<string>();

const emits = defineEmits(["append-click", "prepend-click"]);
</script>

<template>
  <div class="flex items-center bg-white p-4 rounded-lg mb-4">
    <span
      v-if="props.prependIcon"
      class="material-symbols-rounded text-gray-400 font-xs inline-block mr-2"
      @click="$emit('prepend-click')"
    >
      {{ props.prependIcon }}
    </span>
    <div class="w-full">
      <textarea
        v-if="props.inputType === HTMLInputType.Textarea"
        :id="id"
        v-model="model"
        :name="name"
        :rows="props.rows"
        :autofocus="props.focus"
        :placeholder="props.placeholder"
        autocorrect="on"
        autocapitalize="off"
        spellcheck="true"
        class="placeholder:text-sm outline-none w-full rounded-md p-2"
      />

      <input
        v-else
        :autofocus="props.focus"
        :id="id"
        v-model="model"
        :name="name"
        :type="inputType"
        :placeholder="props.placeholder"
        class="placeholder:text-sm outline-none w-full"
      />
    </div>
    <span
      v-if="props.appendIcon"
      class="material-symbols-rounded inline-block text-gray-400 font-xs ml-auto"
      @click="$emit('append-click')"
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
