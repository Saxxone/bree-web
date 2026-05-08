import app_routes from "~/utils/routes";

export type FeatureRouteGuardRule = {
  match: (path: string) => boolean;
  /** Single flag required when `anyOf` is not set */
  flag?: string;
  /** Any one of these flags satisfies the guard */
  anyOf?: string[];
  /** Overrides flag key used for disabled-route toast copy (i18n `features.flag_labels.*`). */
  toastFlag?: string;
};

/** Flag key shown when a route guard sends the user away (toast + i18n). */
export function resolveBlockedRouteToastFlag(
  rule: FeatureRouteGuardRule,
): string | undefined {
  if (rule.toastFlag) return rule.toastFlag;
  if (rule.flag) return rule.flag;
  return rule.anyOf?.[0];
}

/**
 * Route hints for UX only — API remains authoritative (403 when disabled).
 */
export const FEATURE_ROUTE_GUARDS: FeatureRouteGuardRule[] = [
  {
    match: (p) => p === app_routes.home || p.startsWith(`${app_routes.home}/`),
    flag: "social.homeFeed",
  },
  {
    match: (p) => p.startsWith(app_routes.explore),
    flag: "social.exploreSearch",
  },
  {
    match: (p) => p.startsWith(app_routes.history),
    flag: "social.history",
  },
  {
    match: (p) => p.startsWith("/watch-together"),
    flag: "social.watchTogether",
  },
  {
    match: (p) => p.startsWith(app_routes.notifications),
    flag: "notifications.inApp",
  },
  {
    match: (p) => p === "/messages/new",
    flag: "messaging.directMessages",
  },
  {
    match: (p) => p.startsWith("/messages"),
    flag: "messaging.rooms",
  },
  {
    match: (p) => p.startsWith("/profile"),
    flag: "social.profiles",
  },
  {
    match: (p) => p.startsWith(app_routes.post.compose.post),
    anyOf: ["posting.createShortPost", "posting.createLongPost"],
    toastFlag: "posting.compose",
  },
  {
    match: (p) => p.startsWith(app_routes.post.compose.video),
    flag: "posting.uploadVideo",
  },
  {
    match: (p) => p.startsWith("/coins"),
    flag: "coins.stripeCheckout",
  },
  {
    match: (p) => p.startsWith(app_routes.settings.security),
    flag: "auth.deviceManagement",
  },
  {
    match: (p) => p === "/forgot-password",
    flag: "auth.forgotPasswordUi",
  },
];
