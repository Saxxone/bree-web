/** sessionStorage payload before redirecting to Stripe Checkout */
export const COIN_UNLOCK_RESUME_KEY = "afovid_coin_unlock_resume";

export interface CoinUnlockResumePayload {
  postId?: string;
  mediaIndex?: number;
  /** When topping up from profile only, redirect here after success */
  profileUserId?: string;
}

export function writeCoinUnlockResume(payload: CoinUnlockResumePayload) {
  if (!import.meta.client) return;
  try {
    sessionStorage.setItem(COIN_UNLOCK_RESUME_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readCoinUnlockResume(): CoinUnlockResumePayload | null {
  if (!import.meta.client) return null;
  try {
    const raw = sessionStorage.getItem(COIN_UNLOCK_RESUME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CoinUnlockResumePayload;
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export function clearCoinUnlockResume() {
  if (!import.meta.client) return;
  try {
    sessionStorage.removeItem(COIN_UNLOCK_RESUME_KEY);
  } catch {
    /* ignore */
  }
}
