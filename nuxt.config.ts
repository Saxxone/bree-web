// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  experimental: { appManifest: false },
  imports: {
    autoImport: true,
  },
  compatibilityDate: "2024-11-01",

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

  $production: {
    // Production-specific config
    app: {
      head: {
        meta: [
          {
            //google adsense
            name: "google-adsense-account",
            content: "ca-pub-1394318571803623",
          },
        ],
        script: [
          // Google tag (gtag.js)
          { src: "https://www.googletagmanager.com/gtag/js?id=G-9SMJ6QLH4J" },
          // {
          //   id: "usercentrics-cmp",
          //   src: "https://app.usercentrics.eu/browser-ui/latest/loader.js",
          //   "data-settings-id": "4wjzbPMMeuOBYx",
          //   async: true,
          // },
          //Google Tag Manager
          {
            innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KMH2DRM8');`,
            type: "text/javascript",
          },
          {
            //google adsense
            src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1394318571803623",
            async: true,
            crossorigin: "anonymous",
          },
        ],
      },
    },
  },

  $development: {
    // Development-specific config
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
