<script lang="ts" setup>
import { decryptChatBody } from "~/composables/useE2EE";
import { useCryptoStore } from "~/store/crypto";
import type { DateString } from "~/types/types";

interface Props {
  content: string;
  encryptedPayload?: string | null;
  meta: {
    created_at: DateString;
  };
}

const props = defineProps<Props>();
const emit = defineEmits(["error"]);

const cryptoStore = useCryptoStore();
const { algorithm, hash } = storeToRefs(cryptoStore);
const text = ref();

watch(
  () => [props.content, props.encryptedPayload] as const,
  async () => {
    try {
      const storedKey = localStorage.getItem("private_key");

      const private_key = storedKey
        ? (JSON.parse(storedKey) as JsonWebKey)
        : null;

      if (!private_key) {
        text.value = "Message decryption failed.";
        return;
      }

      const decrypted = await decryptChatBody({
        encryptedPayload: props.encryptedPayload,
        userCiphertextBase64: props.content,
        algorithm: algorithm.value,
        hash: hash.value,
        private_key,
      });
      text.value = decrypted ?? "Message decryption failed.";
    } catch (error) {
      text.value = "Message decryption failed.";
      emit("error", error);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <p class="text-wrap break-words">{{ text }}</p>
  </div>
</template>
