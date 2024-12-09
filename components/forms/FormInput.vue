<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { HTMLInputType } from "~/types/types";

interface Props {
  name: string;
  id?: string;
  defaultValue?: string;
  prependIcon?: string;
  appendIcon?: string;
  placeholder?: string;
  rows?: number;
  inputType?: HTMLInputType;
  focus?: boolean;
  disabled?: boolean;
}

const props = defineProps<Props>();

const model = defineModel<string | null>();

defineEmits(["append-click", "prepend-click"]);

watch(
  () => props.defaultValue,
  () => (model.value = props.defaultValue),
  { immediate: true },
);
</script>

<template>
  <div class="flex items-center bg-base-white p-4 rounded-lg mb-4">
    <Icon
      v-if="props.prependIcon"
      :icon="props.prependIcon"
      class="text-2xl text-sub font-xs inline-block mr-2 cursor-pointer"
      @click="$emit('prepend-click')"
    />
    <div class="w-full">
      <textarea
        v-if="props.inputType === HTMLInputType.Textarea"
        :id="id"
        v-model="model"
        :disabled="props.disabled"
        :name="name"
        :rows="props.rows"
        :autofocus="props.focus"
        :placeholder="props.placeholder"
        autocorrect="on"
        autocapitalize="off"
        spellcheck="true"
        resize="false"
        class="placeholder:text-sm outline-none text-main bg-transparent w-full rounded-lg p-2"
      />

      <input
        v-else
        :id="id"
        v-model="model"
        :autofocus="props.focus"
        :disabled="props.disabled"
        :name="name"
        :type="inputType"
        :placeholder="props.placeholder"
        class="placeholder:text-sm outline-none text-main bg-transparent w-full"
      />
    </div>
    <Icon
      v-if="props.appendIcon"
      :icon="props.appendIcon"
      class="text-2xl inline-block text-sub font-xs ms-auto cursor-pointer"
      @click="$emit('append-click')"
    />
  </div>
</template>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active,
input:-internal-autofill-selected {
  -webkit-box-shadow: 0 0 0 30px inherit inset !important;
}
</style>
