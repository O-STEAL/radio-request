import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    envDir: ".env",
    appType: "mpa",
    resolve: {
      alias: {
        "/js": resolve(__dirname, "src/js"),
        "/styles": resolve(__dirname, "src/styles"),
      },
    },
    server: {
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          submit: resolve(__dirname, "submit.html"),
        },
      },
    },
  });
};
