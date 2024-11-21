export const useCryptoStore = defineStore("crypto", () => {
  const algorithm = ref("RSA-OAEP");
  const hash = ref("SHA-256");

  return {
    algorithm,
    hash,
  };
});
