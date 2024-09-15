const api_routes = {
  login: "/auth/login",
  logout: "/auth/logout",
  register: "/user/register",
  posts: {
    base: "/posts",
    get: "/posts",
    create_post: "/post/create-post",
    create_draft: "/post/create-draft",
    update: (id: string) => `/posts/${id}`,
    getPostById: (id: string) => `/posts/${id}`,
    delete: (id: string) => `/posts/${id}`,
  },
};

export default api_routes;
