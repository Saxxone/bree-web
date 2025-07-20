import en from "~/i18n/locales/translations/en";
import pt from "~/i18n/locales/translations/pt";

function getBrowserLocale() {
  const navigatorLocale = navigator.languages
    ? navigator.languages[0]
    : navigator.language;
  const localeParts = navigatorLocale.split("-");
  return localeParts[0];
}

export default defineI18nConfig(() => ({
  locale: getBrowserLocale(),
  defaultLocale: "en",
  locales: [
    { code: "en", name: "English", file: "./translations/en" },
    { code: "pt", name: "Português", file: "./translations/pt" },
  ],
  // defaultLocale: "en",
  // detectBrowserLanguage: {
  //   useCookie: true,
  //   cookieKey: "i18n_redirected",
  //   redirectOn: "root",
  // },
}));
