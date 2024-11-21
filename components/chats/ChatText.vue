<script lang="ts" setup>
import { useDecrypt } from "~/composables/useE2EE";
import { useCryptoStore } from "~/store/crypto";

interface Props {
  content: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["error"]);

const cryptoStore = useCryptoStore();
const { algorithm, hash } = storeToRefs(cryptoStore);
const text = ref();
const private_key: Ref<JsonWebKey | null> = ref(null);

async function decryptMessage(val: string) {
  if (useIsBase64(val) && private_key.value) {
    const base64Decoded = useBase64ToArrayBuffer(val);
    const decryptedBuffer = await useDecrypt(
      algorithm.value,
      hash.value,
      base64Decoded,
      private_key.value,
    );
    const decoder = new TextDecoder();
    text.value = decoder.decode(decryptedBuffer);
  } else {
    text.value = val;
  }
}

watch(
  () => props.content,
  async (newVal) => {
    try {
      const storedKey = localStorage.getItem("private_key");

      private_key.value = storedKey
        ? (JSON.parse(storedKey) as JsonWebKey)
        : null;

      if (!private_key.value) {
        // Or handle differently
      }

      await decryptMessage(newVal);
    } catch (error) {
      console.error(
        "Error retrieving/parsing private key:",
        error,
        props.content,
      );
      emit("error");
      text.value = "Message decryption failed.";
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
