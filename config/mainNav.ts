import app_routes from "~/utils/routes";

export type MainNavId =
  | "home"
  | "explore"
  | "history"
  | "notifications"
  | "messages"
  | "profile";

export type MainNavDef = {
  id: MainNavId;
  i18nKey: string;
  icon: string;
  resolveRoute: (ctx: { userId: string | undefined }) => string;
  /** Shown in desktop LeftSideBar only, not the mobile bottom bar. */
  sidebarOnly?: boolean;
};

export const MAIN_NAV_DEFS: MainNavDef[] = [
  {
    id: "home",
    i18nKey: "navigation.home",
    icon: "line-md:home-simple-twotone",
    resolveRoute: () => app_routes.home,
  },
  {
    id: "explore",
    i18nKey: "navigation.explore",
    icon: "line-md:search-twotone",
    resolveRoute: () => app_routes.explore,
  },
  {
    id: "history",
    i18nKey: "navigation.history",
    icon: "line-md:backup-restore",
    resolveRoute: () => app_routes.history,
  },
  {
    id: "notifications",
    i18nKey: "navigation.notifications",
    icon: "line-md:bell-twotone-loop",
    resolveRoute: () => app_routes.notifications,
  },
  {
    id: "messages",
    i18nKey: "navigation.messages",
    icon: "line-md:chat-bubble-twotone",
    resolveRoute: () => app_routes.messages.rooms,
  },
  {
    id: "profile",
    i18nKey: "navigation.profile",
    icon: "line-md:person-twotone",
    resolveRoute: ({ userId }) => app_routes.profile.view(userId!),
    sidebarOnly: true,
  },
];
