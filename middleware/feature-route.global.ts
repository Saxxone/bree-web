import {
  FEATURE_ROUTE_GUARDS,
  resolveBlockedRouteToastFlag,
} from "~/config/featureRouteGuards";
import app_routes from "~/utils/routes";

/** Avoid loops when `social.homeFeed` is off — `/privacy` stays public. */
const FALLBACK = app_routes.privacy;

export default defineNuxtRouteMiddleware(async (to) => {
  const ff = useFeatureFlags();
  if (!ff.loaded.value) {
    await ff.load().catch(() => {});
  }

  for (const rule of FEATURE_ROUTE_GUARDS) {
    if (!rule.match(to.path)) continue;
    let ok = true;
    if (rule.anyOf?.length) {
      ok = rule.anyOf.some((k) => ff.enabled(k));
    } else if (rule.flag) {
      ok = ff.enabled(rule.flag);
    }
    if (!ok && to.path !== FALLBACK) {
      const flag = resolveBlockedRouteToastFlag(rule);
      if (flag) {
        const globalStore = useGlobalStore();
        globalStore.addSnack({
          type: "error",
          code: "FEATURE_DISABLED",
          flag,
          message: "",
        });
      }
      return navigateTo(FALLBACK);
    }
  }
});
