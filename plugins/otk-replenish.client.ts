import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";

/**
 * Background OTK replenishment + fallback-key rotation.
 *
 * Client-side scheduling is preferable to a server push because:
 *   - new OTKs can only be *generated* inside the worker (the private halves
 *     never leave the device);
 *   - the server would otherwise have to expose "please upload more" signals
 *     which can leak device activity.
 *
 * Policy:
 *   - Poll `/device/keys/otk-count` every 15 minutes; upload fresh OTKs if the
 *     server pool is below `OTK_LOW_WATER_MARK`.
 *   - Rotate the fallback key once every 24 hours as a belt-and-braces measure
 *     even if the pool is healthy (protects against long-lived fallback reuse).
 *   - On document visibility change, run the check immediately so devices that
 *     were backgrounded catch up quickly on resume.
 */
const OTK_CHECK_INTERVAL_MS = 15 * 60 * 1000;
const FALLBACK_ROTATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export default defineNuxtPlugin(() => {
  if (typeof window === "undefined") return;

  const authStore = useAuthStore();
  const { access_token } = storeToRefs(authStore);
  const cryptoStore = useCryptoStore();
  let checkTimer: ReturnType<typeof setInterval> | null = null;
  let rotateTimer: ReturnType<typeof setInterval> | null = null;
  let inflight = false;

  async function runOtkCheck(): Promise<void> {
    if (inflight) return;
    if (!access_token.value) return;
    if (!cryptoStore.deviceId) return;
    inflight = true;
    try {
      await cryptoStore.replenishOtksIfNeeded();
    } catch {
      // transient; we'll retry on the next interval
    } finally {
      inflight = false;
    }
  }

  async function runFallbackRotate(): Promise<void> {
    if (!access_token.value || !cryptoStore.deviceId) return;
    try {
      await cryptoStore.rotateFallback();
    } catch {
      // non-fatal
    }
  }

  function start() {
    stop();
    checkTimer = setInterval(runOtkCheck, OTK_CHECK_INTERVAL_MS);
    rotateTimer = setInterval(runFallbackRotate, FALLBACK_ROTATE_INTERVAL_MS);
    void runOtkCheck();
  }

  function stop() {
    if (checkTimer) {
      clearInterval(checkTimer);
      checkTimer = null;
    }
    if (rotateTimer) {
      clearInterval(rotateTimer);
      rotateTimer = null;
    }
  }

  watch(
    () => !!access_token.value && !!cryptoStore.deviceId,
    (ready) => {
      if (ready) start();
      else stop();
    },
    { immediate: true },
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void runOtkCheck();
    }
  });
});
