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
  /** Element id(s) for `aria-describedby` on the native control. */
  describedBy?: string;
  /** When `false`, disables spellcheck (e.g. usernames / handles). */
  spellcheck?: boolean;
  /** Dark compact search well (icon + field). | `chat` = softer well on conversation screens. */
  variant?: "default" | "search" | "chat";
}

const props = withDefaults(defineProps<Props>(), { variant: "default" });

const model = defineModel<string | null>();

defineEmits(["append-click", "prepend-click"]);

watch(
  () => props.defaultValue,
  () => (model.value = props.defaultValue),
  { immediate: true },
);
</script>

<template>
  <div
    :class="[
      'mb-4 flex max-w-full min-w-0 items-center',
      props.variant === 'search'
        ? 'rounded-[10px] bg-[#131722] px-3 py-2.5'
        : props.variant === 'chat'
          ? 'rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3 dark:border-white/5 dark:bg-slate-800/50 dark:ring-1 dark:ring-inset dark:ring-white/5'
          : 'rounded-lg bg-base-white p-4',
    ]"
  >
    <Icon
      v-if="props.prependIcon"
      :icon="props.prependIcon"
      :class="[
        'font-xs mr-2 inline-block shrink-0 cursor-pointer text-2xl',
        props.variant === 'search'
          ? 'text-[#94a3b8]'
          : props.variant === 'chat'
            ? 'text-slate-500 dark:text-slate-500'
            : 'text-sub',
      ]"
      @click="$emit('prepend-click')"
    />
    <div class="min-w-0 flex-1">
      <textarea
        v-if="props.inputType === HTMLInputType.Textarea"
        :id="id"
        v-model="model"
        :disabled="props.disabled"
        :name="name"
        :aria-describedby="props.describedBy"
        :rows="props.rows"
        :autofocus="props.focus"
        :placeholder="props.placeholder"
        autocorrect="on"
        autocapitalize="off"
        :spellcheck="props.spellcheck !== false"
        resize="false"
        class="text-main w-full rounded-lg bg-transparent p-2 outline-none placeholder:text-sm"
        :class="
          props.variant === 'search'
            ? 'text-white placeholder:text-[#94a3b8]'
            : props.variant === 'chat'
              ? 'placeholder:text-slate-500 dark:placeholder:text-slate-500/80'
              : ''
        "
      />

      <input
        v-else
        :id="id"
        v-model="model"
        :autofocus="props.focus"
        :disabled="props.disabled"
        :name="name"
        :type="inputType"
        :aria-describedby="props.describedBy"
        :placeholder="props.placeholder"
        :spellcheck="props.spellcheck !== false"
        class="w-full min-w-0 bg-transparent text-base outline-none placeholder:text-sm"
        :class="
          props.variant === 'search'
            ? 'text-white placeholder:text-[#94a3b8]'
            : props.variant === 'chat'
              ? 'text-main placeholder:text-slate-500 dark:placeholder:text-slate-500/80'
              : 'text-main'
        "
      />
    </div>
    <Icon
      v-if="props.appendIcon"
      :icon="props.appendIcon"
      :class="[
        'font-xs ms-auto inline-block cursor-pointer text-2xl',
        props.variant === 'search'
          ? 'text-[#94a3b8]'
          : props.variant === 'chat'
            ? 'text-slate-500 dark:text-slate-400'
            : 'text-sub',
      ]"
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
