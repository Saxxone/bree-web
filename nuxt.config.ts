// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",

  devtools: {
    enabled: false,
  },

  ssr: false,

  devServer: {
    port: 4000,
    https: {
      key: "./localhost-key.pem",
      cert: "./localhost.pem",
    },
  },

  build: {
    analyze: true,
  },

  features: {
    devLogs: "silent",
  },

  vite: {
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: [path.resolve(__dirname, "../../../../")],
      },
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "preload",
          href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
          as: "style",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
        },
      ],
    },
  },

  css: [
    "~/assets/css/fonts.css",
    "~/assets/css/main.css",
    "~/assets/css/components.css",
    "~/assets/css/animations.css",
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    "@nuxt/eslint",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@pinia/nuxt",
  ],

  i18n: {
    vueI18n: "./i18n.config.ts",
  },

  image: {
    provider: "ipx", // If not already set
    ipx: {
      // Add this block
      baseURL: "https://pbs.bree.social",
    },
    quality: 80,
    presets: {
      avatar: {
        modifiers: {
          format: "jpg",
          width: 50,
          height: 50,
        },
      },
    },
    densities: [0.5, 1, 1.5, 2],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      "2xl": 1536,
    },
    format: ["avif", "webp"],
  },
  runtimeConfig: {
    googleAuthClientId: "",
    public: {
      apiBase: "",
    },
  },
});
