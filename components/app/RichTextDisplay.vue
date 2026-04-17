<script setup lang="ts">
import { formatRichTextDisplayHtml } from "~/utils/postRichText";

interface Props {
  text: string;
}

const props = defineProps<Props>();

const formatted_text = computed(() => formatRichTextDisplayHtml(props.text));
</script>

<template>
  <div class="relative">
    <!-- Keeps Tailwind utilities used only in formatRichTextDisplayHtml v-html strings -->
    <span
      aria-hidden="true"
      class="hidden font-semibold text-violet-600 decoration-violet-600/50 dark:text-violet-400 dark:decoration-violet-400/50"
    />
    <!-- v-html: output is built with escapeHtml in formatRichTextDisplayHtml -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="select" v-html="formatted_text" />
  </div>
</template>
