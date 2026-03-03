import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/hf-api": {
        target: "https://api-inference.huggingface.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf-api/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "firebase/app": path.resolve(__dirname, "node_modules/firebase/app"),
      "firebase/auth": path.resolve(__dirname, "node_modules/firebase/auth"),
      "firebase/firestore": path.resolve(__dirname, "node_modules/firebase/firestore"),
      "firebase/storage": path.resolve(__dirname, "node_modules/firebase/storage"),
    },
  },
}));
