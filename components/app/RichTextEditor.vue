<script setup lang="ts">
import { formatRichTextEditorOverlayHtml } from "~/utils/postRichText";

interface Props {
  placeholder?: string;
  /** Explicit id for labels / autofill; defaults to a stable per-instance id from `useId()`. */
  id?: string;
  /** Form field name for autofill; defaults to `post-text`. */
  name?: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  name: "post-text",
  placeholder: undefined,
});

const text = defineModel<string | null>();

const textareaIdFallback = useId();
const textareaId = computed(() => props.id ?? textareaIdFallback);

const formatted_text = computed(() =>
  formatRichTextEditorOverlayHtml(text.value ?? ""),
);
</script>

<template>
  <div class="relative h-32">
    <!-- Ensures Tailwind emits utilities referenced only from v-html strings in utils/postRichText.ts -->
    <span
      aria-hidden="true"
      class="hidden text-violet-600 dark:text-violet-400"
    />
    <!-- v-html: mirror uses escapeHtml in formatRichTextEditorOverlayHtml -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      aria-hidden="true"
      class="bg-base-white pointer-events-none absolute left-0 top-0 z-0 m-0 h-full w-full overflow-auto whitespace-pre-wrap break-words rounded-lg border-0 p-2 font-sans-serif text-base leading-normal tracking-normal ring-0 outline-none"
      v-html="formatted_text"
    />
    <textarea
      :id="textareaId"
      v-model="text"
      :name="props.name"
      class="m-0 border-0 bg-transparent text-transparent caret-violet-600 ring-0 absolute left-0 top-0 z-10 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words rounded-lg p-2 font-sans-serif text-base leading-normal tracking-normal outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
      autocomplete="off"
      :placeholder="props.placeholder ?? ''"
    />
  </div>
</template>
