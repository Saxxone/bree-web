/**
 * Client-safe feature flags from `GET /api/feature-flags`.
 * Unknown keys default to enabled (matches API behavior during rollout).
 */
export function useFeatureFlags() {
  const flags = useState<Record<string, boolean> | null>(
    "afovid-feature-flags",
    () => null,
  );
  const loaded = useState("afovid-feature-flags-loaded", () => false);

  async function load(): Promise<void> {
    const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(
      /\/$/,
      "",
    );
    if (!apiBase) {
      loaded.value = true;
      return;
    }
    try {
      const data = await $fetch<{ flags: Record<string, boolean> }>(
        `${apiBase}/feature-flags`,
      );
      flags.value = data.flags ?? {};
    } catch {
      flags.value = {};
    } finally {
      loaded.value = true;
    }
  }

  function enabled(key: string): boolean {
    const m = flags.value;
    if (!m || !(key in m)) return true;
    return m[key] === true;
  }

  return { flags, loaded, load, enabled };
}

export function useFeedTrailerAutoplay() {
  const ff = useFeatureFlags();
  return computed(() => ff.enabled("media.autoplayTrailers"));
}
