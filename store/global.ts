import type { Snack } from "~/types/types";
import api_routes from "~/utils/api_routes";
import { FetchMethod } from "~/types/types";

const FEATURE_DISABLED_CODE = "FEATURE_DISABLED";

/** API `ForbiddenException` message from `FeatureFlagService`. */
const FEATURE_DISABLED_MESSAGE_SUBSTR = "currently disabled";

/** Snack payload; API errors may include `code` / `flag`. */
export type SnackInput = Snack & { code?: string; flag?: string };

function isFeatureDisabledPayload(snack: SnackInput): boolean {
  if (snack.code === FEATURE_DISABLED_CODE) return true;
  const msg = (snack.message ?? "").toLowerCase();
  return msg.includes(FEATURE_DISABLED_MESSAGE_SUBSTR);
}

function nextSnackId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `snack-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatFeatureDisabledSnack(snack: SnackInput): Snack {
  const nuxtApp = useNuxtApp();
  const i18n = nuxtApp.$i18n as {
    t: (key: string, values?: Record<string, string>) => string;
  };
  const t = i18n.t.bind(i18n);
  const flag = snack.flag;
  const labelKey = flag
    ? `features.flag_labels.${flag.replace(/\./g, "_")}`
    : "";
  let label: string;
  if (!flag) {
    label = t("features.disabled_unknown_feature");
  } else {
    const tr = t(labelKey);
    label = tr === labelKey ? flag.replace(/\./g, " · ") : tr;
  }
  return {
    type: "info",
    title: t("features.disabled_title"),
    message: t("features.disabled_body", { feature: label }),
    timeout: 5000,
  };
}

export const useGlobalStore = defineStore("global", () => {
  const api_loading = ref(false);
  const page_title = ref("");
  const snack_bars = ref<Snack[]>([]);

  function closeSnack(index: number) {
    snack_bars.value.splice(index, 1);
  }

  function closeSnackById(id: string) {
    const i = snack_bars.value.findIndex((s) => s.id === id);
    if (i >= 0) snack_bars.value.splice(i, 1);
  }

  function addSnack(snack: SnackInput) {
    const SNACK_TTL_MS = 5000;
    let payload: Snack;
    if (isFeatureDisabledPayload(snack)) {
      try {
        payload = formatFeatureDisabledSnack({
          ...snack,
          code: FEATURE_DISABLED_CODE,
        });
      } catch {
        payload = {
          type: "info",
          title: "This feature is currently unavailable",
          message:
            snack.flag != null && snack.flag !== ""
              ? `${snack.message ? `${snack.message} ` : ""}(${snack.flag})`.trim()
              : (snack.message ?? "This feature is currently disabled."),
          timeout: SNACK_TTL_MS,
        };
      }
    } else {
      payload = {
        type: snack.type ?? "error",
        message: snack.message,
        title: snack.title ?? undefined,
        timeout: snack.timeout ?? SNACK_TTL_MS,
      };
    }
    payload.id = snack.id && snack.id.length > 0 ? snack.id : nextSnackId();
    snack_bars.value.push(payload);
  }

  async function uploadFiles(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(file.name, file);
    });

    const response = await useApiConnect<FormData, string[]>(
      api_routes.files.upload,
      FetchMethod.POST,
      formData,
      "multipart/form-data",
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      return response;
    }
  }

  return {
    api_loading,
    page_title,
    snack_bars,
    closeSnack,
    closeSnackById,
    addSnack,
    uploadFiles,
  };
});
