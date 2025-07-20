<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";
import type { Chat } from "~/types/chat";
import type { DateString } from "~/types/types";

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
  <div class="my-4">
    <div
      class="w-fit max-w-xs overflow-hidden rounded-lg"
      :class="{
        'bg-base-white text-main ms-auto': dir === 'ltr',
        'bg-base-dark text-main-contrast me-auto': dir === 'rtl',
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
        :meta="{ created_at: message.createdAt as DateString }"
        :class="{
          'p-4': !failed,
          'p-2': failed,
        }"
        @error="failed = true"
      />
    </div>
    <div
      class="text-muted p-1 text-xs"
      :class="{
        'text-right': dir === 'ltr',
        'text-left': dir === 'rtl',
      }"
    >
      {{ useDateFormat(message.createdAt, "HH:mm") }}
    </div>
  </div>
</template>
