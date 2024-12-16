<script setup lang="ts">
interface Props {
  placeholder?: string;
  text: string;
}

const props = defineProps<Props>();

const formatted_text = computed(() => {
  if (!props.text) return "";

  const urlPattern = /(((https?:\/\/)|(www\.))[^\s]+)/g;

  const mentionPattern = /([@][^\s]+)/g;

  const hashtagPattern = /([#][^\s]+)/g;

  return props.text
    .split(" ")
    .map((word) => {
      if (word.match(urlPattern)) {
        return `<a style="color: #8b5cf6;" href="${word}" target="_blank" rel="noopener noreferrer">${word}</a>`;
      } else if (word.match(mentionPattern)) {
        return `<a style="color: #8b5cf6;" href="/profile/${encodeURIComponent(word)}">${word}</a>`;
      } else if (word.match(hashtagPattern)) {
        return `<a style="color: #8b5cf6;" href="/search?q=${encodeURIComponent(word)}">${word}</a>`;
      } else {
        return word;
      }
    })
    .join(" ");
});
</script>

<template>
  <div v-html="formatted_text" class="select"></div>
</template>
