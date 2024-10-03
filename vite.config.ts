import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: [path.resolve(__dirname, "../../../../")],
    },
  },
});
