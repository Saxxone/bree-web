<script setup lang="ts">
import { usePostsStore } from "~/store/posts";

interface Props {
  placeholder?: string;
  text: string;
}

const props = defineProps<Props>();
const postStore = usePostsStore();
const { url_pattern, mention_pattern, hashtag_pattern } = postStore;

const formatted_text = (() => {
  if (!props.text) return "";

  return props.text
    .split(" ")
    .map((word) => {
      if (word.match(url_pattern)) {
        return `<a style="color: #8b5cf6;" href="${word}" target="_blank" rel="noopener noreferrer">${word}</a>`;
      } else if (word.match(mention_pattern)) {
        let displayWord;
        if (word.startsWith(".")) {
          displayWord = word.substring(1);
        }
        return `${displayWord ? "." : ""}<a style="color: #8b5cf6;" href="/profile/${encodeURIComponent(displayWord ?? word)}">${displayWord ?? word}</a>`;
      } else if (word.match(hashtag_pattern)) {
        let displayWord;
        if (word.startsWith(".")) {
          displayWord = word.substring(1);
        }
        return `${displayWord ? "." : ""}<a style="color: #8b5cf6;" href="/search?q=${encodeURIComponent(displayWord ?? word)}">${displayWord ?? word}</a>`;
      } else {
        return word;
      }
    })
    .join(" ");
})();

const handleClick = (event: MouseEvent) => {
  if (event.target instanceof HTMLAnchorElement) {
    const link = event.target as HTMLAnchorElement;

    window.open(link.href, "_self", "noopener, noreferrer");
  }
};
</script>

<template>
  <div class="select" @click="handleClick" v-html="formatted_text"></div>
</template>
