import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/notion': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/device': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/debug': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
