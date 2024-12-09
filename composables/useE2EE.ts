import type { KeyPair } from "~/types/types";

/**
 * Generates a cryptographic key pair using the Web Crypto API.
 *
 * @param {string} algorithm - The name of the key generation algorithm.  Examples: "RSA-OAEP", "ECDSA", "ECDH".
 * @param {string} hash - The name of the hashing algorithm to use. Examples: "SHA-256", "SHA-384", "SHA-512".
 * @returns {Promise<KeyPair>} A Promise that resolves to an object containing the generated key pair in JWK format:
 *   - `public_key`: The public key in JWK format.
 *   - `private_key`: The private key in JWK format.
 */
export async function useGenerateKeyPair(
  algorithm: string,
  hash: string,
): Promise<KeyPair> {
  const key_pair = await window.crypto.subtle.generateKey(
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
    key_pair.publicKey,
  );
  const private_key = await window.crypto.subtle.exportKey(
    "jwk",
    key_pair.privateKey,
  );

  return { public_key, private_key };
}

/**
 * Encrypts data using the provided public key.
 *
 * @param {string} algorithm - The encryption algorithm to use.
 * @param {string} hash - The hashing algorithm to use.
 * @param {BufferSource} data - The data to encrypt.
 * @param {JsonWebKey} public_key - The public key to use for encryption.
 * @returns {Promise<ArrayBuffer>} A Promise that resolves to the encrypted data as an ArrayBuffer.
 */

export async function useEncrypt(
  algorithm: string,
  hash: string,
  data: BufferSource,
  public_key: JsonWebKey,
): Promise<ArrayBuffer> {
  const imported_public_key = await window.crypto.subtle.importKey(
    "jwk",
    public_key,
    { name: algorithm, hash: hash },
    false,
    ["encrypt"],
  );

  return await window.crypto.subtle.encrypt(
    { name: algorithm },
    imported_public_key,
    data,
  );
}

/**
 * Decrypts an encrypted message using the provided private key.
 *
 * @param {string} algorithm - The encryption algorithm used to encrypt the message.
 * @param {string} hash - The hashing algorithm used with the encryption algorithm.
 * @param {ArrayBuffer} encryptedData - The encrypted message as an ArrayBuffer.
 * @param {JsonWebKey} private_key - The private key to use for decryption.
 * @returns {Promise<ArrayBuffer | null>} A Promise that resolves to the decrypted message as an ArrayBuffer, or null if decryption fails.
 */

export async function useDecrypt(
  algorithm: string,
  hash: string,
  encryptedData: ArrayBuffer,
  private_key: JsonWebKey,
): Promise<ArrayBuffer | null> {
  const importedPrivateKey = await window.crypto.subtle.importKey(
    "jwk",
    private_key,
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

/**
 * Encrypts a message for both the sender and receiver using their respective public keys.
 *
 * @param {object} keys - An object containing the sender and receiver's public keys.
 * @param {string} keys.sender_public_key - The sender's public key as a string.
 * @param {string} keys.receiver_public_key - The receiver's public key as a string.
 * @returns {Promise<object>} A Promise that resolves to an object containing the encrypted messages:
 *   - `sender_encrypted_message`: The message encrypted with the sender's public key (ArrayBuffer or null).
 *   - `receiver_encrypted_message`: The message encrypted with the receiver's public key (ArrayBuffer or null).
 *   Returns an object with both encrypted messages as null if either key is missing or encryption fails.
 */

export async function useTwoWayEncryption({
  sender_public_key,
  receiver_public_key,
  message,
  algorithm,
  hash,
}: {
  sender_public_key: string;
  receiver_public_key: string;
  message: string;
  algorithm: string;
  hash: string;
}): Promise<{
  sender_encrypted_message: ArrayBuffer | null;
  receiver_encrypted_message: ArrayBuffer | null;
}> {
  if (!sender_public_key)
    return { receiver_encrypted_message: null, sender_encrypted_message: null };
  if (!receiver_public_key)
    return { receiver_encrypted_message: null, sender_encrypted_message: null };

  const sender_key_encrypted_messsage = await useEncryptMessage({
    public_key: sender_public_key,
    message,
    algorithm,
    hash,
  });
  const receiver_key_encrypted_message = await useEncryptMessage({
    public_key: receiver_public_key,
    message,
    algorithm,
    hash,
  });

  return {
    receiver_encrypted_message: receiver_key_encrypted_message,
    sender_encrypted_message: sender_key_encrypted_messsage,
  };
}

/**
 * Encrypts a message using the provided public key.
 *
 * @param {object} params - The parameters for encryption.
 * @param {JsonWebKey | string} params.public_key - The public key to use for encryption. Can be a JsonWebKey object or a JSON string representation of a JsonWebKey.
 * @param {string} params.message - The message to encrypt.
 * @param {string} params.algorithm - The encryption algorithm to use.
 * @param {string} params.hash - The hashing algorithm to use.
 * @returns {Promise<ArrayBuffer | null>} A Promise that resolves to the encrypted message as an ArrayBuffer, or null if encryption fails or the public key is missing/invalid.
 */

export async function useEncryptMessage({
  public_key,
  message,
  algorithm,
  hash,
}: {
  public_key: string;
  message: string;
  algorithm: string;
  hash: string;
}): Promise<ArrayBuffer | null> {
  if (!public_key) {
    console.error("public key is missing!");
    return null;
  }

  try {
    const encoded_message = new TextEncoder().encode(message);
    const encrypted = await useEncrypt(
      algorithm,
      hash,
      encoded_message,
      JSON.parse(public_key as string),
    );

    return encrypted;
  } catch (error) {
    console.error("Encryption error:", algorithm, hash, error);
    return null;
  }
}

/**
 * Decrypts a message using the provided private key.
 *
 * @param {object} params - The parameters for decryption.
 * @param {string} params.message - The message to decrypt (should be a base64 encoded string if encrypted).
 * @param {string} params.algorithm - The encryption algorithm used to encrypt the message.
 * @param {string} params.hash - The hashing algorithm used with the encryption algorithm.
 * @param {JsonWebKey} params.private_key - The private key to use for decryption.
 * @returns {Promise<string>} A Promise that resolves to the decrypted message as a string, or the original message if it's not base64 encoded or if the private key is missing. Returns null if decryption fails.
 */

export async function useDecryptMessage({
  message,
  algorithm,
  hash,
  private_key,
}: {
  message: string;
  algorithm: string;
  hash: string;
  private_key: JsonWebKey;
}): Promise<string> {
  if (useIsBase64(message) && private_key) {
    const base64_decoded = useBase64ToArrayBuffer(message);
    const decrypted_buffer = await useDecrypt(
      algorithm,
      hash,
      base64_decoded,
      private_key,
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted_buffer as ArrayBuffer);
  } else {
    return message;
  }
}
