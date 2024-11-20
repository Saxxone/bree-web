<script lang="ts" setup>
import { useDecrypt } from "~/composables/useE2EE";
import { useCryptoStore } from "~/store/crypto";

interface Props {
  content: string;
}

const props = defineProps<Props>();

const cryptoStore = useCryptoStore();
const { algorithm, hash } = storeToRefs(cryptoStore);
const text = ref();
const private_key: Ref<JsonWebKey | null> = ref(null);

function isBase64(str: string): boolean {
  if (str === "" || str.trim() === "") {
    return false;
  }

  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  if (!base64Regex.test(str)) {
    return false;
  }

  try {
    return btoa(atob(str)) === str;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function decryptMessage(val: string) {
  if (isBase64(val) && private_key.value) {
    console.log(true, val, isBase64("haha"));
    const base64Decoded = base64ToArrayBuffer(val);
    const decryptedBuffer = await useDecrypt(
      algorithm.value,
      hash.value,
      base64Decoded,
      private_key.value!,
    );
    const decoder = new TextDecoder();
    text.value = decoder.decode(decryptedBuffer);
  } else {
    text.value = val;
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
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
