import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Cấu hình Proxy
    proxy: {
      // Khi frontend gọi /api, nó sẽ chuyển tiếp đến backend
      '/api': {
        target: 'https://oem-ev-warranty-management-system-be-production.up.railway.app',
        changeOrigin: true, // Điều này rất quan trọng để thay đổi header Host
        // Rewrite là tùy chọn nếu backend của bạn không muốn /api ở đầu:
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
