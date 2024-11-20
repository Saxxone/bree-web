import en from "./translations/en";
import pt from "./translations/pt";

function getBrowserLocale() {
  const navigatorLocale = navigator.languages
    ? navigator.languages[0]
    : navigator.language;
  const localeParts = navigatorLocale.split("-");
  return localeParts[0];
}

export default defineI18nConfig(() => ({
  legacy: false,
  locale: getBrowserLocale(),
  messages: {
    en,
    pt,
  },
  locales: [
    { code: "en", iso: "en-US" },
    { code: "pt", iso: "pt-PT" },
  ],
  defaultLocale: "en",
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: "i18n_redirected",
    redirectOn: "root",
  },
}));
