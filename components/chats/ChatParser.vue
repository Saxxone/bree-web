import type { ChatsChatText } from '#build/components';
<script lang="ts" setup>
import type { Chat } from "~/types/chat";
import type { User } from "~/types/user";

interface Props {
  user: Partial<User>;
  message: Chat;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="">
    <ChatsChatText
      :content="props.message.text"
      :dir="Number(message.id) % 2 === 0 ? 'ltr' : 'rtl'"
      v-if="props.message.text"
    />
  </div>
</template>
