<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";

const cryptoStore = useCryptoStore();
const { createKeys } = cryptoStore;
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

onMounted(async () => {
  if (!user.value.publicKey) await createKeys();
});
</script>

<template>
  <div class="text-main flex h-96 flex-col items-center justify-center">
    <h1>All chats are encrypted!</h1>
    <p>Complete account setup to continue chatting</p>
  </div>
</template>
