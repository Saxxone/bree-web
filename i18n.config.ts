import type { I18nOptions } from "vue-i18n";

function getBrowserLocale(): "en" | "pt" {
  if (typeof navigator === "undefined") {
    return "en";
  }
  const raw =
    (navigator.languages?.[0] ?? navigator.language)
      ?.split("-")[0]
      ?.toLowerCase() ?? "en";
  return raw === "pt" ? "pt" : "en";
}

export default defineI18nConfig((): I18nOptions => {
  const locale = getBrowserLocale();
  return {
    legacy: false,
    locale: locale as I18nOptions["locale"],
    fallbackLocale: "en",
  };
});
