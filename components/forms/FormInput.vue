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
  <div class="bg-base-white mb-4 flex items-center rounded-lg p-4">
    <Icon
      v-if="props.prependIcon"
      :icon="props.prependIcon"
      class="text-sub font-xs mr-2 inline-block cursor-pointer text-2xl"
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
        class="text-main w-full rounded-lg bg-transparent p-2 outline-none placeholder:text-sm"
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
        class="text-main w-full bg-transparent outline-none placeholder:text-sm"
      />
    </div>
    <Icon
      v-if="props.appendIcon"
      :icon="props.appendIcon"
      class="text-sub font-xs ms-auto inline-block cursor-pointer text-2xl"
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
