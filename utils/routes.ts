const app_routes = {
  splash: "/",
  home: "/home",
  login: "/login",
  signup: "/signup",
  forgot_password: "/forgot-password",
  explore: "/explore",
  messages: {
    rooms: "/messages/rooms",
    chat: (id: string) => `/messages/room?u=${id}`,
    room: (id: string) => `/messages/room?r=${id}`,
    new: "/messages/new",
  },
  notifications: "/notifications",
  profile: {
    view: (id: string) => `/profile/${id}`,
    edit: "/profile/edit",
  },
  post: {
    home: "/home",
    compose: "/compose",
    edit: (id: string) => `/post/${id}/edit`,
    view: (id: string) => `/post/${id}`,
    view_media: "/post/media",
  },
};

export default app_routes;
