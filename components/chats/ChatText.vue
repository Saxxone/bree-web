<script lang="ts" setup>
import { useDecryptMessage } from "~/composables/useE2EE";
import { useCryptoStore } from "~/store/crypto";
import type { DateString } from "~/types/types";

interface Props {
  content: string;
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
  () => props.content,
  async (message) => {
    try {
      const storedKey = localStorage.getItem("private_key");

      const private_key = storedKey
        ? (JSON.parse(storedKey) as JsonWebKey)
        : null;

      if (!private_key) {
        text.value = "Message decryption failed.";
        return;
      }

      text.value = await useDecryptMessage({
        message,
        algorithm: algorithm.value,
        hash: hash.value,
        private_key: private_key,
      });
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
