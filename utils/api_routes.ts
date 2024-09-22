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
    like: (id: string) => `/posts/like/${id}`,
    bookmark: (id: string) => `/posts/bookmark/${id}`,
    getPostById: (id: string) => `/posts/${id}`,
    delete: (id: string) => `/posts/${id}`,
  },
};

export default api_routes;
