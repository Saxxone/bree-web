<script setup lang="ts">
import { useGenerateKeyPair } from "~/composables/useE2EE";
import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";
import { useUsersStore } from "~/store/users";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { savePublicKey } = authStore;
const userStore = useUsersStore();
const { getUserProfile } = userStore;

const cryptoStore = useCryptoStore();
const { algorithm, hash } = storeToRefs(cryptoStore);

async function createKeys() {
  const { public_key, private_key } = await useGenerateKeyPair(
    algorithm.value,
    hash.value,
  );

  await savePublicKey(user.value.id, public_key);

  localStorage.setItem("private_key", JSON.stringify(private_key));

  getUserProfile(user.value.id);
}

onMounted(async () => {
  if (!user.value.publicKey) await createKeys();
});
</script>

<template>
  <div class="flex items-center justify-center h-96 flex-col text-main">
    <h1>All chats are encrypted!</h1>
    <p>Complete account setup to continue chatting</p>
  </div>
</template>
