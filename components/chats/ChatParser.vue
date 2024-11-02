import type { ChatsChatText } from '#build/components';
<script lang="ts" setup>
import type { Chat } from "~/types/chat";
import { useAuthStore } from "~/store/auth";


interface Props {
  message: Chat;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const dir = computed(() => (props.message.fromUserId === user.value.id ? "ltr" : "rtl"));
</script>

<template>
  <div class="flex">
    <div
      class="my-4 rounded-lg overflow-hidden max-w-xs"
      :class="{
        'bg-base-white ms-auto text-main': dir === 'ltr',
        'bg-base-dark me-auto text-main-contrast': dir === 'rtl',
      }">
      <ChatsChatMedia v-if="props.message.mediaType && props.message.media" :media="props.message.media" :media-type="props.message.mediaType" />
      <ChatsChatText v-if="props.message.text" :content="props.message.text" class="p-4" />
    </div>
  </div>
</template>
