const app_routes = {
  splash: "/",
  home: "/home",
  login: "/login",
  signup: "/signup",
  forgot_password: "/forgot-password",
  explore: "/explore",
  messages: "/messages",
  notifications: "/notifications",
  profile: "/profile",
  post: {
    home: "/home",
    compose: "/compose",
    edit: (id: string) => `/post/${id}/edit`,
    view: (id: string) => `/post/${id}`,
  },
};

export default app_routes;
