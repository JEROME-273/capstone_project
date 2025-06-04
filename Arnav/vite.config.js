import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      process: "process/browser", // Keep this for compatibility
    },
  },
  define: {
    // Keep process.env but don't override it completely
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
    // Don't define an empty process.env object
  },
  optimizeDeps: {
    include: ["process"],
  },
});
