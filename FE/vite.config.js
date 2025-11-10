import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Cấu hình Proxy
      proxy: {
        // Khi frontend gọi /api, nó sẽ chuyển tiếp đến backend
        "/api": {
          // 4. Sử dụng biến API_KEY từ .env
          target: env.API_KEY,
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
  };
});
