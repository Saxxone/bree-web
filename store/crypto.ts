import { useAuthStore } from "~/store/auth";
import { useGenerateKeyPair } from "~/composables/useE2EE";

export const useCryptoStore = defineStore("crypto", () => {
  const algorithm = ref("RSA-OAEP");
  const hash = ref("SHA-256");

  async function createKeys() {
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);
    const { savePublicKey } = authStore;
    const { public_key, private_key } = await useGenerateKeyPair(
      algorithm.value,
      hash.value,
    );

    user.value.publicKey = JSON.stringify(public_key);

    if (!user.value.access_token) authStore.logout();

    await savePublicKey(user.value.id, public_key);

    localStorage.setItem("private_key", JSON.stringify(private_key));
  }

  return {
    algorithm,
    hash,
    createKeys,
  };
});
