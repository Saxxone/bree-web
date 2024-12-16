<script setup lang="ts">
const { t } = useI18n();

interface Props {
  placeholder?: string;
}

const props = defineProps<Props>();

const text = defineModel<string | null>();

const formatted_text = computed(() => {
  if (!text.value) return "";

  const urlPattern = /(((https?:\/\/)|(www\.))[^\s]+)/g;

  const mentionHashtagPattern = /([@#][^\s]+)/g;

  return text.value
    .split(" ")
    .map((word) => {
      if (word.match(urlPattern)) {
        return `<span style="color: #8b5cf6;" target="_blank" rel="noopener noreferrer">${word}</span>`;
      } else if (word.match(mentionHashtagPattern)) {
        return `<span style="color: #8b5cf6;">${word}</span>`;
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
      class="bg-base-white absolute top-0 left-0 opacity-25 rounded-lg p-2 h-full outline-none w-full"
      :placeholder="props.placeholder ?? ''"
    />
  </div>
</template>
