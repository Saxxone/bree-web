const ws = "http://localhost:3000";
const api_routes = {
  login: "/auth/login",
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
    bookmark: (id: string, status: boolean) => `/posts/bookmark/${id}?status=${status}`,
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
    get: "/notifications",
    delete: (id: string) => `/notifications/delete/${id}`,
  },
  chats: {
    base: ws,
    rooms: "/rooms/all",
    create: ws + "/create",
    roomChats: (id: string) => `/rooms/chats/${id}`,
    delete: (id: string) => `/chats/delete/${id}`,
  },
  users: {
    search: (search: string) => `/user/search?q=${search}`,
  },
};

export default api_routes;
