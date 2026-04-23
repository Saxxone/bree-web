import { useStorage } from "@vueuse/core";
import {
  decrypt as workerDecrypt,
  encrypt as workerEncrypt,
  fingerprint as workerFingerprint,
  generateOtks,
  initCrypto,
  markOtksPublished,
  registerDevice as workerRegisterDevice,
  rotateFallbackKey as workerRotateFallbackKey,
  wipeCrypto,
} from "~/crypto/cryptoClient";
import { FetchMethod } from "~/types/types";
import type { ClaimedPrekey, DeviceBundle } from "~/types/chat";
import api_routes from "~/utils/api_routes";

/**
 * `POST /device` returns a flat `PublicDeviceSummary` (see
 * afovid-api/src/device/device.service.ts), not a `{ device: ... }` wrapper.
 * The shape only overlaps with the client-side `DeviceBundle` on the identity
 * keys, so we type just the fields this store actually consumes.
 */
type RegisterResponse = Pick<
  DeviceBundle,
  "identityKeyCurve25519" | "identityKeyEd25519"
> & { id: string };

function defaultDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Web device";
  const ua = navigator.userAgent || "";
  const platform = (navigator as { platform?: string }).platform || "";
  const m = ua.match(/(Edg|Chrome|Firefox|Safari)\/[\d.]+/)?.[0];
  return [m, platform].filter(Boolean).join(" · ") || "Web device";
}

/**
 * Crypto store: exposes the Olm worker to the rest of the app through a tiny
 * Pinia store so components can `await cryptoStore.encryptForRoom(...)` etc.
 * without touching the worker directly.
 *
 * The only persisted state is the `deviceId` assigned by the server at
 * registration time. All secret material lives inside the worker /
 * IndexedDB.
 */
export const useCryptoStore = defineStore("crypto", () => {
  const deviceId = useStorage<string>("afovid-device-id", "");
  const identityFingerprint = ref<{
    curve25519: string;
    ed25519: string;
  } | null>(null);
  const initializing = ref(false);
  const registering = ref(false);

  const isRegistered = computed(() => !!deviceId.value);

  async function ensureFingerprint(): Promise<void> {
    if (!deviceId.value || identityFingerprint.value) return;
    try {
      const ids = await workerFingerprint();
      identityFingerprint.value = {
        curve25519: ids.identityKeyCurve25519,
        ed25519: ids.identityKeyEd25519,
      };
    } catch {
      // Worker has no account yet — drop the stale deviceId so the UI falls
      // back to the setup flow instead of looping on a dead device record.
      deviceId.value = "";
    }
  }

  async function init(): Promise<void> {
    if (initializing.value) return;
    initializing.value = true;
    try {
      await initCrypto();
      await ensureFingerprint();
    } finally {
      initializing.value = false;
    }
  }

  async function registerThisDevice(label?: string): Promise<string> {
    if (registering.value) return deviceId.value;
    registering.value = true;
    try {
      const bundle = await workerRegisterDevice(
        label || defaultDeviceLabel(),
        100,
      );
      const res = await useApiConnect<typeof bundle, RegisterResponse>(
        api_routes.devices.register,
        FetchMethod.POST,
        bundle,
      );
      if ("status" in res || "statusCode" in res) {
        throw new Error(
          (res as { message?: string }).message ?? "Device registration failed",
        );
      }
      deviceId.value = res.id;
      identityFingerprint.value = {
        curve25519: res.identityKeyCurve25519,
        ed25519: res.identityKeyEd25519,
      };
      await markOtksPublished();
      return deviceId.value;
    } finally {
      registering.value = false;
    }
  }

  /**
   * Claim a prekey bundle for every active device of `targetUserId`. Returns
   * the bundles filtered to devices that actually have a published signed
   * prekey available.
   */
  async function claimPrekeys(targetUserId: string): Promise<ClaimedPrekey[]> {
    const res = await useApiConnect<
      { targetUserId: string },
      { bundles: ClaimedPrekey[] }
    >(api_routes.devices.claim, FetchMethod.POST, { targetUserId });
    if ("status" in res || "statusCode" in res) {
      throw new Error(
        (res as { message?: string }).message ?? "Failed to claim prekeys",
      );
    }
    return res.bundles ?? [];
  }

  async function checkOtkCount(): Promise<number> {
    if (!deviceId.value) return 0;
    const res = await useApiConnect<undefined, { count: number }>(
      api_routes.devices.otkCount(deviceId.value),
      FetchMethod.GET,
    );
    if ("status" in res || "statusCode" in res) return 0;
    return res.count ?? 0;
  }

  /**
   * Generate + upload fresh OTKs when the server pool is below the threshold.
   * Safe to call opportunistically (e.g., once per app load and after sends).
   */
  async function replenishOtksIfNeeded(threshold = 20): Promise<void> {
    if (!deviceId.value) return;
    const count = await checkOtkCount();
    if (count >= threshold) return;
    const batch = await generateOtks(100);
    if (batch.length === 0) return;
    const res = await useApiConnect<
      { oneTimeKeys: typeof batch },
      { uploaded: number }
    >(api_routes.devices.uploadOtk(deviceId.value), FetchMethod.POST, {
      oneTimeKeys: batch,
    });
    if ("status" in res || "statusCode" in res) {
      throw new Error("Failed to upload OTKs");
    }
    await markOtksPublished();
  }

  async function rotateFallback(): Promise<void> {
    if (!deviceId.value) return;
    const fb = await workerRotateFallbackKey();
    const res = await useApiConnect<
      { oneTimeKeys: []; fallbackKey: typeof fb },
      unknown
    >(api_routes.devices.uploadOtk(deviceId.value), FetchMethod.POST, {
      oneTimeKeys: [],
      fallbackKey: fb,
    });
    if (res && typeof res === "object" && "status" in res) {
      throw new Error("Failed to rotate fallback key");
    }
  }

  /**
   * Reset all local crypto state. Called from the logout path + from recovery
   * when the server claims we have no such device. The server-side revoke is
   * the caller's responsibility so that a *failed* server call does not leave
   * the device in a half-wiped state.
   */
  async function wipe(): Promise<void> {
    await wipeCrypto();
    deviceId.value = "";
    identityFingerprint.value = null;
  }

  return {
    deviceId,
    identityFingerprint,
    isRegistered,
    initializing,
    registering,
    init,
    registerThisDevice,
    claimPrekeys,
    checkOtkCount,
    replenishOtksIfNeeded,
    rotateFallback,
    wipe,
    // Direct worker passthrough (main-thread never sees secret material).
    encrypt: workerEncrypt,
    decrypt: workerDecrypt,
  };
});
