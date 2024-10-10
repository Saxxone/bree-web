import type { ChatsChatText } from '#build/components';
<script lang="ts" setup>
import type { Chat } from "~/types/chat";

interface Props {
  message: Chat;
}

const props = defineProps<Props>();
const dir = computed(() =>
  Number(props.message.id) % 2 === 0 ? "ltr" : "rtl",
);
</script>

<template>
  <div class="flex">
    <div
      class="my-4 rounded-lg overflow-hidden max-w-xs"
      :class="{
        'bg-base-white ms-auto text-main': dir === 'ltr',
        'bg-base-dark me-auto text-main-contrast': dir === 'rtl',
      }"
    >
      <ChatsChatMedia
        :media="props.message.media"
        :media-type="props.message.mediaType"
        v-if="props.message.mediaType"
        class="h-40 w-full overflow-hidden"
      />
      <ChatsChatText
        :content="props.message.text"
        v-if="props.message.text"
        class="p-4"
      />
    </div>
  </div>
</template>
