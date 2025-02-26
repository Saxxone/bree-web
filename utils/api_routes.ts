const ws = import.meta.env.VITE_WS_URL;
const api_routes = {
  login: "/auth/login",
  google_login: "/auth/login/google",
  google_signup: "/auth/signup/google",
  logout: "/auth/logout",
  register: "/user/register",
  posts: {
    base: "/posts",
    feed: "/posts/feed",
    create_post: "/posts/create-post",
    create_draft: "/posts/create-draft",
    update: (id: string) => `/posts/publish/${id}`,
    like: (id: string, status: boolean) => `/posts/like/${id}?status=${status}`,
    checkLike: (id: string) => `/posts/check-like/${id}`,
    bookmark: (id: string, status: boolean) =>
      `/posts/bookmark/${id}?status=${status}`,
    checkBookmark: (id: string) => `/posts/check-bookmark/${id}`,
    getPostById: (id: string) => `/posts/${id}`,
    getComments: (id: string) => `/posts/comments/${id}`,
    getUserPosts: (id: string) => `/posts/user/${id}/posts`,
    getSearchResults: (search: string) => `/posts/search?q=${search}`,
    delete: (id: string) => `/posts/${id}`,
  },
  files: {
    upload: "/file/upload",
  },
  notifications: {
    get: "/notifications/sse",
    delete: (id: string) => `/notifications/delete/${id}`,
  },
  chats: {
    base: ws,
    create: ws + "/create",
    delete: (id: string) => `/chats/delete/${id}`,
  },
  room: {
    rooms: "/rooms/all",
    findRoomByParticipantsOrCreate: (id: string, id2: string) =>
      `/rooms/find-create/?user1=${id}&user2=${id2}`,
    chats: (id: string) => `/rooms/chats/${id}`,
    room: (id: string) => `/rooms/${id}`,
    update: (id: string) => `/rooms/update/${id}`,
  },
  users: {
    get: (id: string) => `/user/${id}`,
    update: (id: string) => `/user/update/${id}`,
    search: (search: string) => `/user/search?q=${search}`,
  },
};

export default api_routes;
