export async function useGenerateKeyPair(algorithm: string, hash: string) {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: algorithm,
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const public_key = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey,
  );
  const private_key = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey,
  );

  return { public_key, private_key };
}

export async function useEncrypt(
  algorithm: string,
  hash: string,
  data: BufferSource,
  publicKey: JsonWebKey,
) {
  const importedPublicKey = await window.crypto.subtle.importKey(
    "jwk",
    publicKey,
    { name: algorithm, hash: hash },
    false,
    ["encrypt"],
  );

  const encryptedData = await window.crypto.subtle.encrypt(
    { name: algorithm },
    importedPublicKey,
    data,
  );

  return encryptedData;
}

export async function useDecrypt(
  algorithm: string,
  hash: string,
  encryptedData: ArrayBuffer,
  privateKey: JsonWebKey,
) {
  const importedPrivateKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKey,
    { name: algorithm, hash: hash },
    true,
    ["decrypt"],
  );

  const decryptedData = await window.crypto.subtle.decrypt(
    { name: algorithm },
    importedPrivateKey,
    encryptedData,
  );

  return decryptedData;
}
