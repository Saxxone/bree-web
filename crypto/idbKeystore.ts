/**
 * IndexedDB-backed keystore for the web Olm worker.
 *
 * Stores exactly two kinds of values:
 * 1. One **non-extractable** AES-GCM CryptoKey (generated inside the worker
 *    with `extractable = false`). CryptoKeys are structured-clonable, so
 *    persisting the handle itself keeps `extractable=false` across tabs and
 *    page reloads — the raw key material never becomes readable by JS.
 * 2. AES-GCM encrypted blobs (the Olm Account / Session pickles + metadata).
 *
 * Nothing in this module talks to the Olm library directly. It is safe to
 * reason about as a plain authenticated-encryption wrapper over IDB.
 */

const DB_NAME = "afovid-olm";
const DB_VERSION = 1;
const STORE_KEYS = "keys";
const STORE_BLOBS = "blobs";
const MASTER_KEY_ID = "master";

const IV_LENGTH = 12;

interface EncryptedRecord {
  id: string;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_KEYS)) {
        db.createObjectStore(STORE_KEYS);
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function promisifyRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getMasterKey(): Promise<CryptoKey> {
  const db = await openDb();
  try {
    const existing = await promisifyRequest(
      db
        .transaction(STORE_KEYS, "readonly")
        .objectStore(STORE_KEYS)
        .get(MASTER_KEY_ID),
    );
    if (existing instanceof CryptoKey) {
      return existing;
    }
    // Generate INSIDE the worker (the worker owns this module). `extractable`
    // is intentionally false so even a future XSS on the main thread that
    // gained postMessage access could not dump the raw key.
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    const tx = db.transaction(STORE_KEYS, "readwrite");
    tx.objectStore(STORE_KEYS).put(key, MASTER_KEY_ID);
    await promisifyRequest(tx as unknown as IDBRequest<unknown>).catch(
      () => undefined,
    );
    return key;
  } finally {
    db.close();
  }
}

/**
 * Encrypt `plaintext` under the worker's master key and write the resulting
 * `{iv, ciphertext}` pair under `id`. Overwrites any previous value for that
 * id atomically.
 */
export async function putBlob(id: string, plaintext: string): Promise<void> {
  const key = await getMasterKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext),
    ),
  );
  const record: EncryptedRecord = { id, iv, ciphertext };
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_BLOBS, "readwrite");
    tx.objectStore(STORE_BLOBS).put(record);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("tx aborted"));
    });
  } finally {
    db.close();
  }
}

export async function getBlob(id: string): Promise<string | null> {
  const key = await getMasterKey();
  const db = await openDb();
  try {
    const record = (await promisifyRequest(
      db.transaction(STORE_BLOBS, "readonly").objectStore(STORE_BLOBS).get(id),
    )) as EncryptedRecord | undefined;
    if (!record) return null;
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: record.iv },
      key,
      record.ciphertext,
    );
    return new TextDecoder().decode(plaintext);
  } finally {
    db.close();
  }
}

export async function deleteBlob(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_BLOBS, "readwrite");
    tx.objectStore(STORE_BLOBS).delete(id);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("tx aborted"));
    });
  } finally {
    db.close();
  }
}

/**
 * Destroy everything: the master CryptoKey + every encrypted blob. Used by
 * the logout path to guarantee a shared browser retains no readable pickle
 * material for the next user.
 */
export async function wipeAll(): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction([STORE_KEYS, STORE_BLOBS], "readwrite");
    tx.objectStore(STORE_KEYS).clear();
    tx.objectStore(STORE_BLOBS).clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("tx aborted"));
    });
  } finally {
    db.close();
  }
  // Also drop the database object so any cached master key is gone forever.
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}
