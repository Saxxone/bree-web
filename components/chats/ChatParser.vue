<script lang="ts" setup>
import type { Chat } from "~/types/chat";
import { useAuthStore } from "~/store/auth";

interface Props {
  message: Chat;
}

const props = defineProps<Props>();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const dir = computed(() =>
  props.message.fromUserId === user.value.id ? "ltr" : "rtl",
);
const failed = ref(false);
const encrypted_message = computed(
  () =>
    props.message.userEncryptedMessages?.find(
      (message) => message.userId === user.value.id,
    )?.encryptedMessage,
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
        v-if="props.message.mediaType && props.message.media"
        :media="props.message.media"
        :media-type="props.message.mediaType"
        @error="failed = true"
      />

      <ChatsChatText
        v-if="props.message.userEncryptedMessages"
        :content="encrypted_message as string"
        :class="{
          'p-4': !failed,
          'p-2': failed,
        }"
        @error="failed = true"
      />
    </div>
  </div>
</template>
