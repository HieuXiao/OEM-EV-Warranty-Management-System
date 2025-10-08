1. npm install tailwindcss @tailwindcss/vite

2. mở file vite.config.js
   
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";
  import path from "path";

  // https://vite.dev/config/
  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });

3. Thêm "@import "tailwindcss";" trong file index.css (nếu không có thì tạo trong src và vào file main.jsx import "import "./index.css";" )

4. tạo 1 file tên "jsconfig.json" ngoài src và thêm :
   
   // jsconfig.json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./src/*"]
        }
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist"]
    }

5. Chạy "npx shadcn@latest init" để thiết lập shadcnUI
    (Which color would you like to use as base color? › Neutral)

6. Chạy lệnh "npm install lucide-react"

7. Vào file "index.html" xóa:
     <!-- Google font -->
    <link rel="preconnect" href="https://fonts.googleapis.com/" />
    <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Icon fonts -->
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css"
      rel="stylesheet"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css"
      rel="stylesheet"
    />

    <!-- Local CSS -->
    <link rel="stylesheet" href="/src/styles/bootstrap.min.css" />
    <link rel="stylesheet" href="/src/styles/style.css" />
