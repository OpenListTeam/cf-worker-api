// @ts-check
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import toml from "toml";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: "toml-loader",
        transform(code, id) {
          if (id.endsWith(".toml")) {
            return `export default ${JSON.stringify(toml.parse(code))};`;
          }
        },
      },
    ],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8787",
          changeOrigin: true,
        },
      },
    },
  },
});
