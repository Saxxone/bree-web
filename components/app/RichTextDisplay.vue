<script setup lang="ts">
import app_routes from "~/utils/routes";

interface Props {
  placeholder?: string;
  text: string;
}

const props = defineProps<Props>();
const router = useRouter();
const container = ref<HTMLDivElement | null>(null);

const formatted_text = (() => {
  if (!props.text) return "";

  const urlPattern =
    /\b(https?:\/\/[a-z0-9\.\-]+[^\s]*)|\b(www\.[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s]*)|\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](?:\/[^\s]*)?/gi;

  const mentionPattern = /(?:^|\s)(\.?[@][a-zA-Z0-9_]{1,})(?:\b|$|\s)/g;

  const hashtagPattern = /(?:^|\s)(\.?[#][a-zA-Z0-9_]{1,})(?:\b|$|\s)/g;

  return props.text
    .split(" ")
    .map((word) => {
      if (word.match(urlPattern)) {
        return `<a style="color: #8b5cf6;" href="${word}" target="_blank" rel="noopener noreferrer">${word}</a>`;
      } else if (word.match(mentionPattern)) {
        return `<a style="color: #8b5cf6;" href="/profile/${encodeURIComponent(word)}">${word}</a>`;
      } else if (word.match(hashtagPattern)) {
        return `<a style="color: #8b5cf6;" href="/search?q=${encodeURIComponent(word.startsWith("#") ? word.slice(1) : word.slice(2))}">${word}</a>`;
      } else {
        return word;
      }
    })
    .join(" ");
})();

const handleClick = (event: MouseEvent) => {
  console.log(event);
  event.preventDefault();
  if (event.target instanceof HTMLAnchorElement) {
    const link = event.target as HTMLAnchorElement;

    window.open(link.href, "_self", "noopener, noreferrer");
  }
};
</script>

<template>
  <div ref="container" class="select" @click="handleClick">
    <span v-html="formatted_text"></span>
  </div>
</template>
