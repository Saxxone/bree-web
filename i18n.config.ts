import en_US from "./translations/en_US";
import pt_PT from "./translations/pt_PT";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "en",
  messages: {
    en_US,
    pt_PT,
  },
}));
