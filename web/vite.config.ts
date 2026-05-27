import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const BACKEND = process.env.VITE_PROXY_TARGET || "http://localhost:3004";
const TUNNEL_HOST = process.env.VITE_TUNNEL_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@server": path.resolve(__dirname, "../server"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["crema.love", ".crema.love", "localhost"],
    hmr: TUNNEL_HOST
      ? { clientPort: 443, protocol: "wss", host: TUNNEL_HOST }
      : undefined,
    proxy: {
      "/v1": { target: BACKEND, changeOrigin: true },
      "/health": { target: BACKEND, changeOrigin: true },
    },
  },
});
