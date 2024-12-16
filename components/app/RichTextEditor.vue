<script setup lang="ts">
const { t } = useI18n();

interface Props {
  placeholder?: string;
}

const props = defineProps<Props>();

const text = defineModel<string | null>();

const formatted_text = computed(() => {
  if (!text.value) return "";

  const urlPattern =
    /\b(https?:\/\/[a-z0-9\.\-]+[^\s]*)|\b(www\.[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s]*)|\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](?:\/[^\s]*)?/gi;

  const mentionHashtagPattern = /(?:^|\s)(\.?[#@][a-zA-Z0-9_]{1,})(?:\b|$|\s)/g;

  return text.value
    .split(" ")
    .map((word) => {
      if (word.match(urlPattern)) {
        return `<span style="color: #5b21b6;" target="_blank" rel="noopener noreferrer">${word}</span>`;
      } else if (word.match(mentionHashtagPattern)) {
        let displayWord;
        if (word.startsWith(".")) {
          displayWord = word.substring(1);
        }
        return `${displayWord ? "." : ""}<span style="color: #5b21b6;" target="_blank" rel="noopener noreferrer">${displayWord ?? word}</span>`;
      } else {
        return word;
      }
    })
    .join(" ");
});
</script>

<template>
  <div class="relative h-32">
    <div
      v-html="formatted_text"
      class="bg-base-white absolute top-0 left-0 rounded-lg p-2 h-full w-full outline-none"
    ></div>
    <textarea
      v-model="text"
      type="text"
      class="bg-base-white absolute top-0 left-0 opacity-25 rounded-lg p-2 h-full text-violet-800 outline-none w-full"
      :placeholder="props.placeholder ?? ''"
    />
  </div>
</template>
