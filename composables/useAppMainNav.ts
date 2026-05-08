import type { MainNavId } from "~/config/mainNav";
import { MAIN_NAV_DEFS } from "~/config/mainNav";
import { useAuthStore } from "~/store/auth";

const MAIN_NAV_FLAG: Partial<Record<MainNavId, string>> = {
  home: "social.homeFeed",
  explore: "social.exploreSearch",
  history: "social.history",
  notifications: "notifications.inApp",
  messages: "messaging.rooms",
  profile: "social.profiles",
};

export type NavMatchMode = "exact" | "prefix";

/** How a location path is matched to a tab's `route` (see `useAppMainNav` variants). */
export function matchPath(
  path: string,
  route: string,
  mode: NavMatchMode,
): boolean {
  if (mode === "exact") {
    return path === route;
  }
  return path.startsWith(route);
}

export function useAppMainNav(variant: "sidebar" | "bottom") {
  const { t } = useI18n();
  const currentRoute = useRoute();
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);
  const ff = useFeatureFlags();

  const matchMode: NavMatchMode = variant === "sidebar" ? "exact" : "prefix";

  const items = computed(() => {
    return MAIN_NAV_DEFS.filter(
      (def) => !def.sidebarOnly || variant === "sidebar",
    )
      .filter((def) => {
        const fk = MAIN_NAV_FLAG[def.id];
        if (!fk) return true;
        if (!ff.loaded.value) return true;
        return ff.enabled(fk);
      })
      .map((def) => {
        const userId = user.value?.id;
        if (def.id === "profile" && !userId) {
          return null;
        }
        return {
          id: def.id,
          name: t(def.i18nKey),
          route: def.resolveRoute({ userId: userId ?? undefined }),
          icon: def.icon,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  });

  const activeId = computed<MainNavId | null>(() => {
    const path = currentRoute.path;
    for (const item of items.value) {
      if (matchPath(path, item.route, matchMode)) {
        return item.id;
      }
    }
    return null;
  });

  function isItemActive(item: { id: MainNavId }): boolean {
    return activeId.value === item.id;
  }

  return { items, activeId, isItemActive };
}
